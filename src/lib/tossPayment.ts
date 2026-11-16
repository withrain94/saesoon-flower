import { VIRTUAL_ACCOUNT_BEFORE_SLOT_HOURS, VIRTUAL_ACCOUNT_MAX_HOURS } from "@/data/reservationOptions";
import { tossBankName } from "@/data/tossBanks";
import { ko } from "@/i18n/ko";
import { formatReceiptNumber } from "@/lib/format";
import type {
  CustomerPaymentView,
  ReservationRequest,
  StoredReservation,
  TossPaymentRecord,
  TossPaymentStatus,
} from "@/types/reservation";

/**
 * 토스페이먼츠 온라인 결제 규칙 (순수 함수) — 서버(server/toss.ts, actions/payment.ts)와 화면이 같이 씀.
 * 계좌이체 = 예약마다 전용 입금 계좌(가상계좌), 개인카드 = 카드 결제창. 법인카드(키인)·PayPal은 온라인 결제 아님.
 */

/** 결제창을 여는 데 필요한 값 — 서버가 만들어 브라우저로 보냄 (클라이언트 키는 공개해도 되는 키) */
export type TossCheckout = {
  clientKey: string;
  method: "CARD" | "VIRTUAL_ACCOUNT";
  orderId: string;
  orderName: string;
  amount: number;
  /** 결제 금액 중 면세 금액 = 꽃(꽃다발·꽃바구니·호접난). 초콜릿·쇼핑백은 과세라 빠짐 — 복합과세 상점일 때만 토스가 적용 */
  taxFreeAmount: number;
  customerName: string;
  /** 국내 휴대폰 번호(숫자만)일 때만 — 해외 번호면 null */
  customerMobilePhone: string | null;
  /** 가상계좌 입금 기한(시간) — 카드면 null */
  validHours: number | null;
};

const TOSS_STATUSES: TossPaymentStatus[] = [
  "READY",
  "IN_PROGRESS",
  "WAITING_FOR_DEPOSIT",
  "DONE",
  "CANCELED",
  "PARTIAL_CANCELED",
  "ABORTED",
  "EXPIRED",
];

/** 결제가 살아 있는 상태 — 입금 기다림 / 결제 완료 / 일부 취소 (이때는 결제창을 다시 열지 않음) */
const ACTIVE_STATUSES: TossPaymentStatus[] = ["WAITING_FOR_DEPOSIT", "DONE", "PARTIAL_CANCELED"];

export const isTossActive = (record: Pick<TossPaymentRecord, "status"> | null) =>
  record !== null && ACTIVE_STATUSES.includes(record.status);

/** 토스 주문번호 = 예약 id + "_" + 시도 번호 (영문·숫자·-·_ 6~64자). 결제창을 다시 열 때마다 새로 */
export function toTossOrderId(reservationId: string, attempt: string) {
  return `${reservationId}_${attempt.replace(/[^0-9a-zA-Z]/g, "").slice(0, 20) || "1"}`;
}

/** 토스 주문번호 → 예약 id (형식이 아니면 null) */
export function reservationIdFromOrderId(orderId: unknown) {
  if (typeof orderId !== "string") return null;
  const match = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_[0-9a-zA-Z]{1,20}$/.exec(orderId);
  return match ? match[1] : null;
}

/** 결제창에 보이는 상품명 */
export const tossOrderName = (reservationId: string) => `새순 꽃 예약 ${formatReceiptNumber(reservationId)}`;

/** 결제창에 넘길 휴대폰 번호 — 국내 번호(숫자 10~11자리, 0으로 시작)만 */
export function tossCustomerPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return /^0\d{9,10}$/.test(digits) ? digits : null;
}

/** 가상계좌 입금 기한(시간) — 받는 시간 1시간 전까지, 1~72시간 */
export function virtualAccountValidHours(request: Pick<ReservationRequest, "date" | "time">, now: Date) {
  const slot = Date.parse(`${request.date}T${request.time}:00+09:00`);
  const hours = Number.isNaN(slot)
    ? VIRTUAL_ACCOUNT_MAX_HOURS
    : Math.floor((slot - now.getTime()) / 3_600_000) - VIRTUAL_ACCOUNT_BEFORE_SLOT_HOURS;
  return Math.min(VIRTUAL_ACCOUNT_MAX_HOURS, Math.max(1, hours));
}

/** 이 예약을 결제창으로 결제할 수 있는지 — 온라인 결제 예약 + 접수 상태 + 취소 요청 없음 + 아직 결제(발급) 안 됨 */
export function canStartTossPayment(reservation: Pick<StoredReservation, "request" | "status" | "cancelRequest" | "payment">) {
  return (
    reservation.request.tossPayment &&
    reservation.status === "received" &&
    reservation.cancelRequest === null &&
    !isTossActive(reservation.payment)
  );
}

/** 면세 금액 — 꽃 상품(꽃다발·꽃바구니·호접난)은 면세, 초콜릿·쇼핑백은 과세 (2026-11-17 사용자 확인) */
export function taxFreeAmountOf(request: Pick<ReservationRequest, "items">) {
  return request.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function buildTossCheckout(
  reservationId: string,
  request: ReservationRequest,
  clientKey: string,
  orderId: string,
  now: Date,
): TossCheckout {
  const virtual = request.paymentMethod === "bank";
  return {
    clientKey,
    method: virtual ? "VIRTUAL_ACCOUNT" : "CARD",
    orderId,
    orderName: tossOrderName(reservationId),
    amount: request.totalPrice,
    taxFreeAmount: taxFreeAmountOf(request),
    customerName: request.ordererName.slice(0, 100),
    customerMobilePhone: tossCustomerPhone(request.ordererPhone),
    validHours: virtual ? virtualAccountValidHours(request, now) : null,
  };
}

/** 결제창을 연 직후 저장할 기록 (아직 결제 전) */
export function readyPaymentRecord(orderId: string, amount: number, now: Date): TossPaymentRecord {
  return {
    orderId,
    paymentKey: null,
    status: "READY",
    method: null,
    amount,
    approvedAt: null,
    virtualAccount: null,
    cashReceipt: null,
    receiptUrl: null,
    canceledAt: null,
    updatedAt: now.toISOString(),
  };
}

const text = (value: unknown) => (typeof value === "string" ? value : null);
const object = (value: unknown) =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

/** 토스 Payment 객체(결제 승인·조회 응답) → 저장할 기록. 모양이 아니면 null */
export function toTossPaymentRecord(payment: unknown, now: Date): TossPaymentRecord | null {
  const raw = object(payment);
  const orderId = text(raw?.orderId);
  const status = TOSS_STATUSES.find((value) => value === raw?.status);
  if (!raw || !orderId || !status) return null;

  const account = object(raw.virtualAccount);
  const cashReceipt = object(raw.cashReceipt);
  const cancels = Array.isArray(raw.cancels) ? raw.cancels.map(object).filter(Boolean) : [];
  const lastCancel = cancels.at(-1);

  return {
    orderId,
    paymentKey: text(raw.paymentKey),
    status,
    method: text(raw.method),
    amount: typeof raw.totalAmount === "number" ? raw.totalAmount : 0,
    approvedAt: text(raw.approvedAt),
    virtualAccount: account
      ? {
          bankCode: text(account.bankCode) ?? "",
          accountNumber: text(account.accountNumber) ?? "",
          dueDate: text(account.dueDate) ?? "",
        }
      : null,
    cashReceipt:
      cashReceipt && text(cashReceipt.receiptUrl)
        ? {
            type: text(cashReceipt.type) ?? "",
            issueNumber: text(cashReceipt.issueNumber) ?? "",
            receiptUrl: text(cashReceipt.receiptUrl) ?? "",
          }
        : null,
    receiptUrl: text(object(raw.receipt)?.url),
    canceledAt: lastCancel ? text(lastCancel.canceledAt) : null,
    updatedAt: now.toISOString(),
  };
}

/**
 * 새로 받은 결제 기록으로 바꿔도 되는지 — 예전에 열었다 닫은 결제창(다른 주문번호)의 소식이 늦게 와서
 * 이미 결제(입금 대기)된 기록을 덮어쓰지 않게
 */
export function shouldReplacePayment(stored: TossPaymentRecord | null, incoming: TossPaymentRecord) {
  if (!stored || stored.orderId === incoming.orderId) return true;
  return !isTossActive(stored) || incoming.status === "DONE";
}

/** 손님 화면용 — 결제 키 등은 빼고 */
export function toCustomerPaymentView(record: TossPaymentRecord | null): CustomerPaymentView | null {
  if (!record) return null;
  return {
    status: record.status,
    amount: record.amount,
    virtualAccount: record.virtualAccount,
    receiptUrl: record.receiptUrl,
  };
}

/** 가상계좌 입금 기한 "2026-11-14T15:00:00" → "11/14 15:00" */
export function formatTossDueDate(dueDate: string) {
  const match = /^\d{4}-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(dueDate);
  return match ? `${Number(match[1])}/${Number(match[2])} ${match[3]}:${match[4]}` : dueDate;
}

/** 매장용 한국어 결제 상태 한 줄 (관리자·텔레그램) */
export function describeTossPayment(record: TossPaymentRecord | null, request: ReservationRequest) {
  if (!record) return request.paymentMethod === "bank" ? "전용 계좌 발급 전 (손님이 결제창을 안 열었거나 닫음)" : "카드 결제 전 (손님이 결제창을 닫음)";
  const account = record.virtualAccount;
  switch (record.status) {
    case "DONE":
      return account ? `🏦 입금 완료 ${ko.format.price(record.amount)}` : `💳 카드 결제 완료 ${ko.format.price(record.amount)}`;
    case "WAITING_FOR_DEPOSIT":
      return account
        ? `⏳ 입금 기다리는 중 · ${tossBankName(account.bankCode)} ${account.accountNumber} · 기한 ${formatTossDueDate(account.dueDate)}`
        : "⏳ 입금 기다리는 중";
    case "CANCELED":
      return "↩️ 결제 취소(환불)됨";
    case "PARTIAL_CANCELED":
      return "↩️ 일부 취소됨";
    case "EXPIRED":
      return "⌛ 입금 기한 지남";
    case "ABORTED":
      return "⚠️ 결제 실패";
    default:
      return request.paymentMethod === "bank" ? "전용 계좌 발급 전 (손님이 결제창을 닫음)" : "카드 결제 전 (손님이 결제창을 닫음)";
  }
}

/** 결제 소식 텔레그램 문구 — 결제 완료·입금 완료·금액 다름·취소된 예약에 입금 */
export function buildPaymentNotice(
  kind: "paid" | "amountMismatch" | "paidAfterCancel",
  reservation: Pick<StoredReservation, "id" | "request">,
  record: TossPaymentRecord,
  adminUrl: string | null,
) {
  const { request } = reservation;
  const what = record.virtualAccount ? "전용 계좌 입금" : "카드 결제";
  const head = {
    paid: `✅ ${what} 완료 — 예약이 '입금·결제 확인'으로 바뀌었어요`,
    amountMismatch: `⚠️ ${what} 금액이 예약 금액과 달라요 — 상태는 그대로 두었어요. 확인해 주세요`,
    paidAfterCancel: `⚠️ 이미 취소된 예약에 ${what}이 들어왔어요 — 관리자에서 환불해 주세요`,
  }[kind];
  return [
    head,
    `접수번호 ${formatReceiptNumber(reservation.id)} · ${request.ordererName} · ${request.date} ${request.time}`,
    `결제 ${ko.format.price(record.amount)} / 예약 금액 ${ko.format.price(request.totalPrice)}`,
    record.cashReceipt && `🧾 현금영수증 ${record.cashReceipt.type} 발급됨`,
    adminUrl && `관리자: ${adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}
