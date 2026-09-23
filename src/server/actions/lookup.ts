"use server";

import { after } from "next/server";
import { buildCancelNotice } from "@/lib/cancelNotice";
import {
  getCustomerCancelOption,
  isSameName,
  isSamePhone,
  normalizeReceiptNumber,
  phoneLastDigits,
  toRefundAccount,
} from "@/lib/customerLookup";
import { formatReceiptNumber } from "@/lib/format";
import type { CustomerReservationView, StoredReservation } from "@/types/reservation";
import { ADMIN_HOME_PATH } from "../auth";
import { getSiteOrigin, getSupabaseEnv } from "../env";
import { sendTelegramMessage } from "../notify";
import {
  cancelUnpaidReservation,
  findReservationsByPhoneEnding,
  findReservationsByReceipt,
  saveCancelRequest,
} from "../reservations";

/**
 * 손님 예약 조회·취소 — 누구나 부를 수 있는 서버 함수이므로 매번 예약자 이름 + 연락처를 다시 확인한다.
 * 화면 문구는 손님 언어로 화면에서 고르도록 오류 종류(code)만 돌려줌.
 */

export type LookupErrorCode =
  | "notFound"
  | "unavailable"
  | "notCancelable"
  | "invalidRefund"
  | "receiptMismatch"
  | "tooMany"
  | "failed";
type LookupFailure = { ok: false; code: LookupErrorCode };
export type LookupResult = { ok: true; reservation: CustomerReservationView } | LookupFailure;
export type LookupListResult = { ok: true; reservations: CustomerReservationView[] } | LookupFailure;

/** 한 번에 보여줄 예약 수 (받는 날짜 늦은 순) */
const MAX_RESULTS = 20;

/** 틀린 이름·번호를 빠르게 여러 번 넣어보지 못하게 실패 응답을 조금 늦춤 */
const FAIL_DELAY_MS = 800;
const slowFail = async (code: LookupErrorCode): Promise<LookupFailure> => {
  await new Promise((resolve) => setTimeout(resolve, FAIL_DELAY_MS));
  return { ok: false, code };
};

/**
 * 같은 연락처로 틀린 조회·취소를 반복하면 잠시 막음 (남의 예약을 찍어보는 것 방지).
 * 서버가 여러 대로 나뉘면 대수만큼 늘어나지만, 한 번에 수백 번 넣어보는 것은 막힌다.
 */
const FAIL_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS = 10;
const fails = new Map<string, { count: number; first: number }>();

function throttleKey(phone: unknown) {
  return (typeof phone === "string" ? phoneLastDigits(phone) : "") ?? "";
}

/** 지금 막혀 있는지 (막혀 있으면 true) */
function isBlocked(key: string) {
  if (!key) return false;
  const record = fails.get(key);
  if (!record) return false;
  if (Date.now() - record.first > FAIL_WINDOW_MS) {
    fails.delete(key);
    return false;
  }
  return record.count >= MAX_FAILS;
}

function countFail(key: string) {
  if (!key) return;
  const record = fails.get(key);
  if (!record || Date.now() - record.first > FAIL_WINDOW_MS) {
    fails.set(key, { count: 1, first: Date.now() });
    return;
  }
  record.count += 1;
  // 오래된 기록이 쌓이지 않게 정리
  if (fails.size > 500) {
    for (const [otherKey, other] of fails) {
      if (Date.now() - other.first > FAIL_WINDOW_MS) fails.delete(otherKey);
    }
  }
}

const clearFails = (key: string) => {
  if (key) fails.delete(key);
};

/** DB에 조회용 칸(receipt_number·cancel_request)을 추가하는 SQL을 아직 실행하지 않았을 때의 오류 */
function isMissingColumn(error: unknown) {
  const code = typeof error === "object" && error !== null ? (error as { code?: unknown }).code : undefined;
  return code === "42703" || code === "PGRST204";
}

function failure(error: unknown, action: string): LookupFailure {
  if (isMissingColumn(error)) return { ok: false, code: "unavailable" };
  console.error(`[lookup] ${action} 실패`, error instanceof Error ? error.message : "unknown");
  return { ok: false, code: "failed" };
}

function toView(reservation: StoredReservation): CustomerReservationView {
  return {
    id: reservation.id,
    receiptNumber: formatReceiptNumber(reservation.id),
    status: reservation.status,
    // 입금했다고 답한 취소 요청만 "취소 요청 접수됨" (입금 전 바로 취소는 상태가 취소됨)
    cancelRequestedAt: reservation.cancelRequest?.paid ? reservation.cancelRequest.requestedAt : null,
    request: reservation.request,
  };
}

const isOwner = (reservation: StoredReservation, name: string, phone: string) =>
  isSameName(reservation.request.ordererName, name) && isSamePhone(reservation.request.ordererPhone, phone);

/** 예약자 이름 + 연락처가 모두 맞는 예약들 (받는 날짜 늦은 순) */
async function findOwnReservations(name: unknown, phone: unknown) {
  if (typeof name !== "string" || typeof phone !== "string") return [];
  const lastDigits = phoneLastDigits(phone);
  if (!lastDigits || !name.trim()) return [];
  const candidates = await findReservationsByPhoneEnding(lastDigits);
  return candidates.filter((reservation) => isOwner(reservation, name, phone)).slice(0, MAX_RESULTS);
}

/** 접수번호로 고른 예약 한 건 — 이름 + 연락처도 맞아야 함 (없으면 null) */
async function findOwnReservation(receipt: unknown, name: unknown, phone: unknown) {
  const receiptNumber = normalizeReceiptNumber(String(receipt ?? ""));
  if (!receiptNumber || typeof name !== "string" || typeof phone !== "string") return null;
  const candidates = await findReservationsByReceipt(receiptNumber);
  return candidates.find((reservation) => isOwner(reservation, name, phone)) ?? null;
}

export async function lookupReservations(name: string, phone: string): Promise<LookupListResult> {
  if (!getSupabaseEnv()) return { ok: false, code: "unavailable" };
  const key = throttleKey(phone);
  if (isBlocked(key)) return slowFail("tooMany");
  try {
    const reservations = await findOwnReservations(name, phone);
    if (reservations.length === 0) {
      countFail(key);
      return slowFail("notFound");
    }
    clearFails(key);
    return { ok: true, reservations: reservations.map(toView) };
  } catch (error) {
    return failure(error, "조회");
  }
}

export type CancelInput = {
  /** 조회 결과에서 고른 예약의 접수번호 */
  receipt: string;
  /** 손님이 직접 적은 접수번호 — 고른 예약의 접수번호와 같아야 취소됨 */
  typedReceipt: string;
  name: string;
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
 * 이름·연락처에 더해 손님이 접수번호를 직접 적어야 한다 (이름·번호만 아는 사람이 취소하지 못하도록).
 */
export async function cancelReservationByCustomer(input: CancelInput): Promise<LookupResult> {
  if (!getSupabaseEnv()) return { ok: false, code: "unavailable" };
  const key = throttleKey(input?.phone);
  if (isBlocked(key)) return slowFail("tooMany");
  try {
    const reservation = await findOwnReservation(input?.receipt, input?.name, input?.phone);
    if (!reservation) {
      countFail(key);
      return slowFail("notFound");
    }
    if (normalizeReceiptNumber(String(input?.typedReceipt ?? "")) !== formatReceiptNumber(reservation.id)) {
      countFail(key);
      return slowFail("receiptMismatch");
    }
    clearFails(key);

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
