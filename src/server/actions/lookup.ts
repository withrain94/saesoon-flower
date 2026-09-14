"use server";

import { after } from "next/server";
import { buildCancelNotice } from "@/lib/cancelNotice";
import {
  getCustomerCancelOption,
  isSamePhone,
  normalizeReceiptNumber,
  toRefundAccount,
} from "@/lib/customerLookup";
import { formatReceiptNumber } from "@/lib/format";
import type { CustomerReservationView, StoredReservation } from "@/types/reservation";
import { ADMIN_HOME_PATH } from "../auth";
import { getSiteOrigin, getSupabaseEnv } from "../env";
import { sendTelegramMessage } from "../notify";
import { cancelUnpaidReservation, findReservationsByReceipt, saveCancelRequest } from "../reservations";

/**
 * 손님 예약 조회·취소 — 누구나 부를 수 있는 서버 함수이므로 매번 접수번호 + 연락처를 다시 확인한다.
 * 화면 문구는 손님 언어로 화면에서 고르도록 오류 종류(code)만 돌려줌.
 */

export type LookupErrorCode = "notFound" | "unavailable" | "notCancelable" | "invalidRefund" | "failed";
export type LookupResult = { ok: true; reservation: CustomerReservationView } | { ok: false; code: LookupErrorCode };

/** 틀린 번호를 빠르게 여러 번 넣어보지 못하게 실패 응답을 조금 늦춤 */
const FAIL_DELAY_MS = 800;
const slowFail = async (code: LookupErrorCode): Promise<LookupResult> => {
  await new Promise((resolve) => setTimeout(resolve, FAIL_DELAY_MS));
  return { ok: false, code };
};

/** DB에 조회용 칸(receipt_number·cancel_request)을 추가하는 SQL을 아직 실행하지 않았을 때의 오류 */
function isMissingColumn(error: unknown) {
  const code = typeof error === "object" && error !== null ? (error as { code?: unknown }).code : undefined;
  return code === "42703" || code === "PGRST204";
}

function failure(error: unknown, action: string): LookupResult {
  if (isMissingColumn(error)) return { ok: false, code: "unavailable" };
  console.error(`[lookup] ${action} 실패`, error instanceof Error ? error.message : "unknown");
  return { ok: false, code: "failed" };
}

function toView(reservation: StoredReservation): CustomerReservationView {
  return {
    receiptNumber: formatReceiptNumber(reservation.id),
    status: reservation.status,
    // 입금했다고 답한 취소 요청만 "취소 요청 접수됨" (입금 전 바로 취소는 상태가 취소됨)
    cancelRequestedAt: reservation.cancelRequest?.paid ? reservation.cancelRequest.requestedAt : null,
    request: reservation.request,
  };
}

/** 접수번호 + 예약자 연락처가 모두 맞는 예약 (없으면 null) */
async function findOwnReservation(receipt: string, phone: string) {
  const receiptNumber = normalizeReceiptNumber(String(receipt ?? ""));
  if (!receiptNumber || typeof phone !== "string") return null;
  const candidates = await findReservationsByReceipt(receiptNumber);
  return candidates.find((reservation) => isSamePhone(reservation.request.ordererPhone, phone)) ?? null;
}

export async function lookupReservation(receipt: string, phone: string): Promise<LookupResult> {
  if (!getSupabaseEnv()) return { ok: false, code: "unavailable" };
  try {
    const reservation = await findOwnReservation(receipt, phone);
    return reservation ? { ok: true, reservation: toView(reservation) } : slowFail("notFound");
  } catch (error) {
    return failure(error, "조회");
  }
}

export type CancelInput = {
  receipt: string;
  phone: string;
  /** 입금 전 예약에서 "이미 입금(결제)했어요"를 골랐는지 */
  alreadyPaid: boolean;
  refund: { bank: string; account: string; holder: string };
};

/**
 * 손님 취소
 * - 입금 전 + "아직 입금 안 했어요" → 바로 취소
 * - 입금 전 + "이미 입금했어요" / 입금·결제 확인 → 취소 요청 (계좌이체면 환불 계좌 필수)
 * - 제작 완료 이후·이미 요청함·취소됨 → 거절 (전화 안내)
 */
export async function cancelReservationByCustomer(input: CancelInput): Promise<LookupResult> {
  if (!getSupabaseEnv()) return { ok: false, code: "unavailable" };
  try {
    const reservation = await findOwnReservation(input?.receipt, input?.phone);
    if (!reservation) return slowFail("notFound");

    const option = getCustomerCancelOption(reservation.status, reservation.cancelRequest !== null);
    const adminUrl = (() => {
      const origin = getSiteOrigin();
      return origin ? `${origin}${ADMIN_HOME_PATH}/${reservation.id}` : null;
    })();

    const requestedAt = new Date().toISOString();
    const noRefund = { refundBank: "", refundAccount: "", refundHolder: "" };

    if (option === "cancel" && !input.alreadyPaid) {
      const record = { requestedAt, paid: false, ...noRefund };
      if (!(await cancelUnpaidReservation(reservation.id, record))) return { ok: false, code: "notCancelable" };
      after(() => sendTelegramMessage(buildCancelNotice("canceled", reservation.id, reservation.request, adminUrl)));
      return { ok: true, reservation: { ...toView(reservation), status: "canceled" } };
    }

    if (option !== "cancel" && option !== "request") return { ok: false, code: "notCancelable" };

    const needsAccount = reservation.request.paymentMethod === "bank";
    const refund = needsAccount ? toRefundAccount(input.refund ?? { bank: "", account: "", holder: "" }) : noRefund;
    if (!refund) return { ok: false, code: "invalidRefund" };

    const cancelRequest = { requestedAt, paid: true, ...refund };
    if (!(await saveCancelRequest(reservation.id, cancelRequest, ["received", "confirmed"]))) {
      return { ok: false, code: "notCancelable" };
    }
    after(() => sendTelegramMessage(buildCancelNotice("requested", reservation.id, reservation.request, adminUrl)));
    return { ok: true, reservation: { ...toView(reservation), cancelRequestedAt: cancelRequest.requestedAt } };
  } catch (error) {
    return failure(error, "취소");
  }
}
