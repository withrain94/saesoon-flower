"use server";

import { isSamePhone } from "@/lib/customerLookup";
import { formatReceiptNumber } from "@/lib/format";
import {
  buildTossCheckout,
  canStartTossPayment,
  readyPaymentRecord,
  reservationIdFromOrderId,
  toCustomerPaymentView,
  toTossOrderId,
  type TossCheckout,
} from "@/lib/tossPayment";
import type { CustomerReservationView, StoredReservation } from "@/types/reservation";
import { getTossEnv } from "../env";
import { getReservation, saveTossPayment } from "../reservations";
import { confirmTossPayment, getTossPaymentByOrderId, syncTossPayment } from "../toss";

/**
 * 손님 온라인 결제 — 결제창 다시 열기 / 결제창에서 돌아온 결제 승인.
 * 누구나 부를 수 있는 서버 함수이므로 금액은 예약 기록으로만 확인하고, 다시 열기는 예약자 연락처를 확인한다.
 * 화면 문구는 손님 언어로 화면에서 고르도록 오류 종류(code)만 돌려줌.
 */

export type PaymentErrorCode = "unavailable" | "notFound" | "notPayable" | "amountMismatch" | "failed";

const toView = (reservation: StoredReservation): CustomerReservationView => ({
  id: reservation.id,
  receiptNumber: formatReceiptNumber(reservation.id),
  status: reservation.status,
  cancelRequestedAt: reservation.cancelRequest?.paid ? reservation.cancelRequest.requestedAt : null,
  request: reservation.request,
  payment: toCustomerPaymentView(reservation.payment),
});

/**
 * 결제창 다시 열기 (결제창을 닫았거나 실패한 뒤, 예약 조회 화면 [결제하기]) — 예약 id + 예약자 연락처 확인.
 * 이미 결제(입금 대기)된 예약이면 notPayable
 */
export async function startTossPayment(
  reservationId: string,
  phone: string,
): Promise<{ ok: true; checkout: TossCheckout } | { ok: false; code: PaymentErrorCode }> {
  const toss = getTossEnv();
  if (!toss) return { ok: false, code: "unavailable" };
  try {
    const reservation = /^[0-9a-f-]{36}$/.test(String(reservationId)) ? await getReservation(reservationId) : null;
    if (!reservation || typeof phone !== "string" || !isSamePhone(reservation.request.ordererPhone, phone)) {
      return { ok: false, code: "notFound" };
    }
    if (!canStartTossPayment(reservation)) return { ok: false, code: "notPayable" };

    const now = new Date();
    const orderId = toTossOrderId(reservation.id, now.getTime().toString(36));
    await saveTossPayment(reservation.id, readyPaymentRecord(orderId, reservation.request.totalPrice, now));
    return { ok: true, checkout: buildTossCheckout(reservation.id, reservation.request, toss.clientKey, orderId, now) };
  } catch (error) {
    console.error("[payment] 결제창 다시 열기 실패", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "failed" };
  }
}

/**
 * 결제창에서 돌아온 값으로 결제 승인 (카드 = 결제 완료, 계좌이체 = 전용 입금 계좌 발급).
 * 새로고침으로 두 번 불려도 이미 승인된 결제면 토스에서 다시 읽어 그대로 보여줌
 */
export async function confirmTossPaymentRedirect(input: {
  paymentKey: string;
  orderId: string;
  amount: string;
}): Promise<{ ok: true; reservation: CustomerReservationView } | { ok: false; code: PaymentErrorCode; message?: string }> {
  if (!getTossEnv()) return { ok: false, code: "unavailable" };
  const reservationId = reservationIdFromOrderId(input?.orderId);
  const paymentKey = typeof input?.paymentKey === "string" ? input.paymentKey.slice(0, 200) : "";
  if (!reservationId || !paymentKey) return { ok: false, code: "notFound" };

  try {
    const reservation = await getReservation(reservationId);
    if (!reservation || !reservation.request.tossPayment) return { ok: false, code: "notFound" };
    // 결제창 주소의 금액은 바꿀 수 있으므로 예약 금액과 꼭 비교
    if (Number(input.amount) !== reservation.request.totalPrice) return { ok: false, code: "amountMismatch" };

    const already = reservation.payment?.paymentKey === paymentKey;
    const confirmed = already
      ? await getTossPaymentByOrderId(input.orderId)
      : await confirmTossPayment(paymentKey, input.orderId, reservation.request.totalPrice);
    // 이미 승인된 결제(새로고침 등)면 토스에서 다시 읽음
    const result =
      !confirmed.ok && confirmed.code === "ALREADY_PROCESSED_PAYMENT"
        ? await getTossPaymentByOrderId(input.orderId)
        : confirmed;
    if (!result.ok) return { ok: false, code: "failed", message: result.message };

    const record = await syncTossPayment(reservation, result.payment);
    const latest = (await getReservation(reservationId)) ?? reservation;
    return { ok: true, reservation: toView({ ...latest, payment: record ?? latest.payment }) };
  } catch (error) {
    console.error("[payment] 결제 승인 실패", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "failed" };
  }
}
