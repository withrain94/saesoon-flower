import { getEventOn } from "@/data/events";
import { documentOptions } from "@/data/reservationOptions";
import { ko } from "@/i18n/ko";
import {
  describeColor,
  describeDeliveryAddress,
  describeDeliveryMessage,
  describeDeliveryName,
  describeDeliveryRecipient,
  describeForEvent,
  describeOrchidDelivery,
  describePayment,
  describeReceiveMethod,
  formatAdminDate,
  formatAdminTime,
  localeNames,
  summarizeItems,
} from "@/lib/adminFormat";
import { getEventCopy } from "@/lib/events";
import { formatReceiptNumber } from "@/lib/format";
import { joinTopper } from "@/lib/units";
import type { ReservationDelivery, ReservationRequest } from "@/types/reservation";

/** 상품 1개 — 받는 분·배송지·토퍼·메시지 */
function describeDelivery(request: ReservationRequest, delivery: ReservationDelivery, index: number) {
  const address = describeDeliveryAddress(request, delivery);
  const topper = joinTopper(delivery.topperName, delivery.topperRank, delivery.topperCourse);
  return [
    `${index + 1}. ${describeDeliveryName(request, delivery)}`,
    `  · 받는 분: ${describeDeliveryRecipient(request, delivery)}`,
    address && `  · 배송지: ${address}`,
    topper && `  · 토퍼: ${topper}`,
    `  · 메시지: ${describeDeliveryMessage(delivery)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * 새 예약 알림(텔레그램) 문구 — 고객이 신청서에 적은 내용 전부를 한국어로.
 * adminUrl: 이 예약의 관리자 상세 페이지 주소 (모르면 null)
 */
export function buildReservationNotice(id: string, request: ReservationRequest, adminUrl: string | null) {
  const event = getEventOn(request.date);
  const amount =
    request.paymentMethod === "paypal"
      ? `${ko.format.price(request.paypalAmount)} (수수료 포함)`
      : ko.format.price(request.totalPrice);
  const color = describeColor(request);
  const orchid = describeOrchidDelivery(request);
  const documents = documentOptions
    .filter((option) => request.documents.includes(option.value))
    .map((option) => option.label)
    .join("·");

  const lines = [
    `🌸 새 예약 · 접수번호 ${formatReceiptNumber(id)}`,
    `📅 ${formatAdminDate(request.date)} ${formatAdminTime(request.time)}${event ? ` · ${getEventCopy(event, ko).shortTitle}` : ""}`,
    `💐 ${summarizeItems(request)} (총 ${request.totalQuantity}개)`,
    // 현금영수증·카드 결제하실 분까지 (PayPal 금액·이메일은 따로 적으므로 이름만)
    `💰 ${amount} · ${request.paymentMethod === "paypal" ? ko.payment.methods.paypal.label : describePayment(request)}`,
    request.paymentMethod === "paypal" && `📧 PayPal 결제 요청 보낼 이메일 ${request.paypalEmail}`,
    `👤 예약자 ${request.ordererName} ${request.ordererPhone}`,
    event && `🎓 ${getEventCopy(event, ko).shortTitle} 꽃: ${describeForEvent(request)}`,
    `🚚 받는 방법: ${describeReceiveMethod(request)}`,
    orchid && `🌿 호접난: ${orchid}`,
    color && `🎨 원하는 색감: ${color}`,
    request.documents.length > 0 &&
      `📄 ${documents} 요청 · 상호 ${request.documentCompany}${request.documentBusinessNumber ? ` · 사업자번호 ${request.documentBusinessNumber}` : ""}`,
    request.locale !== "ko" && `🌐 신청 언어 ${localeNames[request.locale]}`,
    "",
    "📝 받는 분·메시지",
    ...request.deliveries.map((delivery, index) => describeDelivery(request, delivery, index)),
    adminUrl && `\n관리자 페이지에서 보기 ›\n${adminUrl}`,
  ];

  // 빈 줄("")은 받는 분 목록 앞 칸 띄우기용으로 남김
  return lines.filter((line) => typeof line === "string").join("\n");
}
