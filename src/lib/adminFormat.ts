import { findBlackboardPreset } from "@/data/reservationOptions";
import { localeOptions } from "@/i18n";
import { ko } from "@/i18n/ko";
import { parseDateKey } from "@/lib/date";
import { getSlotHour, SHOP_TIME_ZONE } from "@/lib/time";
import type { Locale } from "@/types/i18n";
import type { ProductCategoryId, ReservationDelivery, ReservationRequest } from "@/types/reservation";

/**
 * 관리자 화면용 한국어 표시 — 고객이 어떤 언어로 신청했든 매장은 한국어로 봄.
 * 이름·선택지 문구는 한국어 언어 파일(i18n/ko.ts)을 그대로 씀.
 */

/** 고객이 신청서를 본 언어 이름 (언어 탭과 같은 목록) */
export const localeNames = Object.fromEntries(
  localeOptions.map((option) => [option.code, option.label]),
) as Record<Locale, string>;

/** "2026-10-08" → "10월 8일(목)" */
export function formatAdminDate(dateKey: string) {
  const date = parseDateKey(dateKey);
  return ko.format.dateLong(date.getMonth() + 1, date.getDate(), date.getDay());
}

/** "09:00" → "오전 9:00" */
export function formatAdminTime(slot: string) {
  return ko.format.time(getSlotHour(slot));
}

/** ISO 시각 → "9. 14. 오후 6:50" (한국 시각) */
export function formatAdminDateTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: SHOP_TIME_ZONE,
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "꽃다발 6만원" */
export function formatAdminItemName(category: ProductCategoryId, price: number) {
  return ko.format.itemName(ko.categories[category].name, ko.format.priceShort(price));
}

/** 예약 목록 한 줄 요약 — "꽃다발 6만원 ×2 · 호접난 12만원" */
export function summarizeItems(request: ReservationRequest) {
  return request.items
    .map((item) => {
      const name = formatAdminItemName(item.category, item.price);
      return item.quantity > 1 ? `${name} ×${item.quantity}` : name;
    })
    .join(" · ");
}

/** 메시지 — 블랙보드 "알아서 써주세요"는 매장에서 작성한다고 표시 */
export function describeDeliveryMessage(delivery: ReservationDelivery) {
  const { message } = ko;
  switch (delivery.messageType) {
    case "none":
      return message.describeNone;
    case "memo":
      return message.describeMemo(delivery.memo);
    case "ribbon":
      return message.describeRibbon(delivery.ribbonLeft, delivery.ribbonRight);
    case "blackboard": {
      const preset = findBlackboardPreset(delivery.category, delivery.blackboardPreset);
      if (preset && !preset.text) return `블랙보드 · ${ko.blackboardPresets[preset.id]} (매장에서 작성)`;
      return message.describeBlackboard(delivery.blackboard);
    }
  }
}

/** 받는 분 — 비었으면 예약자 픽업 */
export function describeDeliveryRecipient(delivery: ReservationDelivery) {
  const text = [delivery.recipientName, delivery.recipientPhone].filter(Boolean).join(" · ");
  return text || ko.recipient.describeEmpty;
}

/**
 * 결제 방법 한 줄 — "계좌이체 · 현금영수증 소득공제 010-…" / "카드 결제 · 결제하실 분 …" / "PayPal 66,000원 · 이메일"
 */
export function describePayment(request: ReservationRequest) {
  const { payment } = ko;
  const label = payment.methods[request.paymentMethod].label;
  switch (request.paymentMethod) {
    case "bank":
      return request.cashReceiptType === "none"
        ? label
        : `${label} · 현금영수증 ${payment.cashReceiptOptions[request.cashReceiptType]} ${request.cashReceiptNumber}`;
    case "card":
      return request.cardPayer === "other" ? `${label} · 결제하실 분 ${request.cardPayerContact}` : label;
    case "paypal":
      return `${label} ${ko.format.price(request.paypalAmount)} · ${request.paypalEmail}`;
  }
}

/** 원하는 색감 — 색감을 고르지 않는 주문이면 null */
export function describeColor(request: ReservationRequest) {
  if (!request.color) return null;
  const label = ko.color.options[request.color as keyof typeof ko.color.options] ?? request.color;
  return request.colorOther ? `${label} · ${request.colorOther}` : label;
}

/** 호접난 받는 방법 — 호접난이 없으면 null */
export function describeOrchidDelivery(request: ReservationRequest) {
  const delivery = request.orchidDelivery;
  if (!delivery) return null;
  return delivery.method === "restaurant"
    ? ko.orchidDelivery.describeRestaurant(delivery.restaurant, delivery.reservationName)
    : ko.orchidDelivery.describePickup;
}
