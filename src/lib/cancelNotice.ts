import { getEventOn } from "@/data/events";
import { ko } from "@/i18n/ko";
import { formatAdminDate, formatAdminTime, summarizeItems } from "@/lib/adminFormat";
import { getEventCopy } from "@/lib/events";
import { formatReceiptNumber } from "@/lib/format";
import type { PaymentMethod, ReservationRequest } from "@/types/reservation";

/** "입금" / "카드 결제" / "PayPal 결제" — "이미 ○○했어요", "○○를 취소" 문구용 */
export function paymentActionWord(method: PaymentMethod) {
  return { bank: "입금", card: "카드 결제", paypal: "PayPal 결제" }[method];
}

/**
 * 손님이 예약 조회 화면에서 취소했을 때 텔레그램 알림 문구 (한국어).
 * 환불 계좌는 알림에 넣지 않고 관리자 페이지에서만 보여줌.
 * kind: canceled = 입금 전 바로 취소 / requested = 입금·결제 후 취소 요청(환불 필요)
 */
export function buildCancelNotice(
  kind: "canceled" | "requested",
  id: string,
  request: ReservationRequest,
  adminUrl: string | null,
) {
  const event = getEventOn(request.date);
  const payment = ko.payment.methods[request.paymentMethod].label;
  const cashReceipt =
    request.paymentMethod === "bank" && request.cashReceiptType !== "none"
      ? `현금영수증 신청 있음(${ko.payment.cashReceiptOptions[request.cashReceiptType]}) — 발행했다면 취소 발행`
      : null;
  const refundGuide =
    request.paymentMethod === "bank"
      ? "환불 계좌는 관리자 페이지에서 확인해 주세요. 환불 후 '취소'를 눌러 마무리해요."
      : `${paymentActionWord(request.paymentMethod)}를 취소(환불)한 뒤 관리자 페이지에서 '취소'를 눌러 마무리해요.`;

  const lines = [
    kind === "canceled"
      ? `⚪ 손님이 예약을 취소했어요 ("아직 ${paymentActionWord(request.paymentMethod)} 안 했어요") · 접수번호 ${formatReceiptNumber(id)}`
      : `🔴 취소 요청 · 환불 필요 · 접수번호 ${formatReceiptNumber(id)}`,
    `📅 ${formatAdminDate(request.date)} ${formatAdminTime(request.time)}${event ? ` · ${getEventCopy(event, ko).shortTitle}` : ""}`,
    `👤 ${request.ordererName} · ${request.ordererPhone}`,
    `💐 ${summarizeItems(request)} · ${ko.format.price(request.totalPrice)} · ${payment}`,
    ...(kind === "requested" ? [refundGuide] : []),
    ...(cashReceipt ? [cashReceipt] : []),
    ...(adminUrl ? [`관리자: ${adminUrl}`] : []),
  ];
  return lines.join("\n");
}
