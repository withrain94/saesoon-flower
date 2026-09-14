import { getEventOn } from "@/data/events";
import { ko } from "@/i18n/ko";
import {
  describeOrchidDelivery,
  formatAdminDate,
  formatAdminTime,
  localeNames,
  summarizeItems,
} from "@/lib/adminFormat";
import { getEventCopy } from "@/lib/events";
import { formatReceiptNumber } from "@/lib/format";
import type { ReservationRequest } from "@/types/reservation";

/**
 * 새 예약 알림(텔레그램) 문구 — 매장이 한눈에 보고 바로 연락할 수 있게 한국어로 짧게.
 * adminUrl: 이 예약의 관리자 상세 페이지 주소 (모르면 null)
 */
export function buildReservationNotice(id: string, request: ReservationRequest, adminUrl: string | null) {
  const event = getEventOn(request.date);
  const payment = ko.payment.methods[request.paymentMethod].label;
  const amount =
    request.paymentMethod === "paypal"
      ? `${ko.format.price(request.paypalAmount)} (수수료 포함)`
      : ko.format.price(request.totalPrice);
  const orchid = describeOrchidDelivery(request);
  const hasTopper = request.deliveries.some((delivery) => delivery.topperName || delivery.topperRank);

  const lines = [
    `🌸 새 예약 · 접수번호 ${formatReceiptNumber(id)}`,
    `📅 ${formatAdminDate(request.date)} ${formatAdminTime(request.time)}${event ? ` · ${getEventCopy(event, ko).shortTitle}` : ""}`,
    `💐 ${summarizeItems(request)}`,
    `💰 ${amount} · ${payment}`,
    request.paymentMethod === "paypal" && `📧 PayPal 결제 요청 보낼 이메일 ${request.paypalEmail}`,
    `👤 ${request.ordererName} ${request.ordererPhone}`,
    orchid && `🚚 호접난 ${orchid}`,
    hasTopper && "🎓 승진 토퍼 문구 있음",
    request.documents.length > 0 && "📄 견적서·거래명세표 요청",
    request.locale !== "ko" && `🌐 신청 언어 ${localeNames[request.locale]}`,
    adminUrl && `\n관리자 페이지에서 보기 ›\n${adminUrl}`,
  ];

  return lines.filter(Boolean).join("\n");
}
