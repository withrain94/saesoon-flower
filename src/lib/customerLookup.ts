import type { CancelRequest, ReservationStatus } from "@/types/reservation";

/**
 * 손님 예약 조회·취소 규칙 — 화면(components/lookup)과 서버 함수(server/actions/lookup)가 같이 씀.
 */

/** 접수번호 입력값 정리 — "5d7b bc7e" → "5D7BBC7E". 형식이 아니면 null */
export function normalizeReceiptNumber(value: string) {
  const cleaned = value.replace(/[\s-]/g, "").toUpperCase();
  return /^[0-9A-F]{8}$/.test(cleaned) ? cleaned : null;
}

/** 연락처 비교용 숫자 — "+82 10-1234-5678" = "010-1234-5678" = "01012345678" */
function phoneDigits(value: string) {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+82")) return `0${digits.slice(3)}`;
  return digits.replace(/\+/g, "");
}

export function isSamePhone(a: string, b: string) {
  const left = phoneDigits(a);
  return left.length >= 7 && left === phoneDigits(b);
}

/**
 * 손님이 조회 화면에서 할 수 있는 일
 * - cancel: 입금 전(접수) — 바로 취소 또는 "이미 입금했어요"면 취소 요청
 * - request: 입금·결제 확인 — 취소 요청 (환불 필요)
 * - requested: 이미 취소 요청을 보냄
 * - call: 제작 완료·전달 완료 — 전화로 문의
 * - none: 이미 취소됨
 */
export type CustomerCancelOption = "cancel" | "request" | "requested" | "call" | "none";

export function getCustomerCancelOption(status: ReservationStatus, cancelRequested: boolean): CustomerCancelOption {
  if (status === "canceled") return "none";
  if (cancelRequested) return "requested";
  if (status === "received") return "cancel";
  if (status === "confirmed") return "request";
  return "call";
}

export const REFUND_TEXT_MAX = 40;
const ACCOUNT_NUMBER = /^[\d-]{6,30}$/;

/** 환불 계좌 입력 검사 — 계좌이체로 입금한 예약만 필요. 틀리면 null */
export function toRefundAccount(input: { bank: string; account: string; holder: string }) {
  const bank = input.bank.trim().slice(0, REFUND_TEXT_MAX);
  const account = input.account.replace(/\s/g, "");
  const holder = input.holder.trim().slice(0, REFUND_TEXT_MAX);
  if (!bank || !holder || !ACCOUNT_NUMBER.test(account)) return null;
  return { refundBank: bank, refundAccount: account, refundHolder: holder } satisfies Omit<CancelRequest, "requestedAt" | "paid">;
}
