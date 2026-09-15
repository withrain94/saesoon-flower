import { bankAccount } from "@/data/shop";
import type { Messages } from "@/i18n/ko";
import { parseDateKey } from "@/lib/date";
import { formatReceiptNumber } from "@/lib/format";
import { getSlotHour } from "@/lib/time";
import type { ReservationRequest } from "@/types/reservation";

/**
 * 신청 완료 화면 "카카오톡으로 나에게 보내기" — 손님 언어로 된 예약 요약 글.
 * 카카오 공유는 이 글을 텍스트 메시지로, 다른 앱 공유·복사도 같은 글을 씀.
 */

/**
 * 카카오 JavaScript 키 (공개 값 — 카카오 개발자 앱에 등록한 사이트 주소에서만 동작).
 * 없으면 카카오 버튼 대신 복사·다른 앱 공유만 보여줌
 */
export const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY?.trim() || null;

/** 카카오톡 텍스트 메시지 최대 길이 */
export const KAKAO_TEXT_MAX = 200;

/**
 * 예약 요약 — 가게·접수번호·받는 날짜·상품·합계·결제(계좌이체면 입금 계좌).
 * maxLength보다 길면 가게 이름을 앞 단어("새순", "Saesoon")로 줄여 입금 계좌 줄이 잘리지 않게 함
 */
export function buildReservationShareText(
  t: Messages,
  id: string,
  request: ReservationRequest,
  maxLength = Number.POSITIVE_INFINITY,
) {
  const full = buildLines(t, t.shop.name, id, request);
  if (full.length <= maxLength) return full;
  return buildLines(t, t.shop.name.split(" ")[0], id, request).slice(0, maxLength);
}

function buildLines(t: Messages, shopName: string, id: string, request: ReservationRequest) {
  const date = parseDateKey(request.date);
  const [first, ...rest] = request.items;
  const firstName = first
    ? `${t.format.itemName(t.categories[first.category].name, t.format.priceShort(first.price))} × ${first.quantity}`
    : "";

  return [
    t.share.title(shopName),
    t.share.receipt(formatReceiptNumber(id)),
    `${t.format.dateLong(date.getMonth() + 1, date.getDate(), date.getDay())} ${t.format.time(getSlotHour(request.time))}`,
    t.share.items(firstName, rest.length),
    t.share.total(t.format.price(request.paymentMethod === "paypal" ? request.paypalAmount : request.totalPrice)),
    request.paymentMethod === "bank"
      ? t.share.bank(t.bankCard.bank, bankAccount.number, bankAccount.holder)
      : t.share.payment(t.payment.methods[request.paymentMethod].label),
  ].join("\n");
}
