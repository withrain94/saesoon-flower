import "server-only";

import { after } from "next/server";
import {
  buildPaymentNotice,
  shouldReplacePayment,
  toTossPaymentRecord,
} from "@/lib/tossPayment";
import type { StoredReservation, TossPaymentRecord } from "@/types/reservation";
import { ADMIN_HOME_PATH } from "./auth";
import { getSiteOrigin, getTossEnv } from "./env";
import { syncReservationToNotionById } from "./notion";
import { sendTelegramMessage } from "./notify";
import { markReservationPaid, saveTossPayment } from "./reservations";

/**
 * 토스페이먼츠 서버 API — 비밀 키(TOSS_SECRET_KEY)는 여기서만 씀. 결제 기록 저장·상태 바꾸기·알림도 여기 한 곳(syncTossPayment).
 * 문서: docs.tosspayments.com/reference (2026-11-13 확인)
 */

const API = "https://api.tosspayments.com/v1";
const TIMEOUT_MS = 15_000;

export type TossApiResult = { ok: true; payment: unknown } | { ok: false; code: string; message: string };

async function tossFetch(path: string, init?: { body?: unknown; idempotencyKey?: string }): Promise<TossApiResult> {
  const env = getTossEnv();
  if (!env) return { ok: false, code: "NOT_CONFIGURED", message: "온라인 결제 설정(토스 키)이 없어요." };
  try {
    const response = await fetch(`${API}${path}`, {
      method: init?.body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${env.secretKey}:`).toString("base64")}`,
        "Content-Type": "application/json",
        ...(init?.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
      },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const body = (await response.json().catch(() => null)) as { code?: string; message?: string } | null;
    if (response.ok) return { ok: true, payment: body };
    return { ok: false, code: body?.code ?? String(response.status), message: body?.message ?? "토스 응답 오류" };
  } catch (error) {
    return { ok: false, code: "NETWORK", message: error instanceof Error ? error.name : "unknown" };
  }
}

/** 결제 승인 — 결제창에서 돌아온 paymentKey·orderId·amount (금액은 부르는 쪽이 예약 금액과 먼저 비교) */
export const confirmTossPayment = (paymentKey: string, orderId: string, amount: number) =>
  tossFetch("/payments/confirm", { body: { paymentKey, orderId, amount } });

/** 주문번호로 결제 조회 (웹훅을 받으면 토스에 다시 물어서 진짜 상태를 확인) */
export const getTossPaymentByOrderId = (orderId: string) =>
  tossFetch(`/payments/orders/${encodeURIComponent(orderId)}`);

/**
 * 결제 취소(환불) — 전액. 가상계좌에 이미 입금된 결제는 환불받을 계좌(은행 코드·계좌번호·예금주)가 꼭 필요.
 * 입금 전 가상계좌를 취소하면 그 계좌로는 더 이상 입금이 안 됨
 */
export const cancelTossPayment = (
  paymentKey: string,
  reason: string,
  refundAccount?: { bank: string; accountNumber: string; holderName: string },
) =>
  tossFetch(`/payments/${encodeURIComponent(paymentKey)}/cancel`, {
    body: { cancelReason: reason.slice(0, 200), ...(refundAccount ? { refundReceiveAccount: refundAccount } : {}) },
    idempotencyKey: `cancel-${paymentKey}`.slice(0, 300),
  });

const adminUrlOf = (id: string) => {
  const origin = getSiteOrigin();
  return origin ? `${origin}${ADMIN_HOME_PATH}/${id}` : null;
};

/**
 * 토스에서 받은 결제 정보를 예약에 반영 — 결제 승인·웹훅·관리자 "토스에서 다시 확인"이 모두 이 함수를 씀.
 * - 기록 저장 (예전 결제창 소식이 결제된 기록을 덮지 않게)
 * - 결제 완료(DONE) + 금액이 예약 금액과 같으면 접수 → 입금·결제 확인 + 텔레그램 + 노션
 * - 금액이 다르거나 이미 취소된 예약이면 상태는 두고 텔레그램으로 알림
 * 돌려주는 값: 저장한 기록 (모양이 이상하면 null)
 */
export async function syncTossPayment(reservation: StoredReservation, payment: unknown): Promise<TossPaymentRecord | null> {
  const record = toTossPaymentRecord(payment, new Date());
  if (!record) return null;
  if (!shouldReplacePayment(reservation.payment, record)) return reservation.payment;

  const wasDone = reservation.payment?.status === "DONE" && reservation.payment.orderId === record.orderId;
  await saveTossPayment(reservation.id, record);
  if (record.status !== "DONE" || wasDone) return record;

  const adminUrl = adminUrlOf(reservation.id);
  if (record.amount !== reservation.request.totalPrice) {
    after(() => sendTelegramMessage(buildPaymentNotice("amountMismatch", reservation, record, adminUrl)));
    return record;
  }
  if (reservation.status === "canceled") {
    after(() => sendTelegramMessage(buildPaymentNotice("paidAfterCancel", reservation, record, adminUrl)));
    return record;
  }
  if (await markReservationPaid(reservation.id)) {
    after(() => sendTelegramMessage(buildPaymentNotice("paid", reservation, record, adminUrl)));
    // 노션 결제 칸 [입금 전] → [입금 확인]
    after(() => syncReservationToNotionById(reservation.id));
  }
  return record;
}
