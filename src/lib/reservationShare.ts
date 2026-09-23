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
  // 접수번호 안내를 되도록 남기고, 길면 가게 이름을 앞 단어로 줄이고, 그래도 길면 안내를 뺌
  const shortName = t.shop.name.split(" ")[0];
  const tries: [string, boolean][] = [
    [t.shop.name, true],
    [shortName, true],
    [t.shop.name, false],
    [shortName, false],
  ];
  for (const [shopName, withNote] of tries) {
    const text = buildLines(t, shopName, id, request, withNote);
    if (text.length <= maxLength) return text;
  }
  return buildLines(t, t.shop.name.split(" ")[0], id, request, false).slice(0, maxLength);
}

function buildLines(t: Messages, shopName: string, id: string, request: ReservationRequest, withNote: boolean) {
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
    // 취소할 때 접수번호를 직접 넣어야 하므로 왜 필요한지 알려줌 (맨 뒤 — 카톡 200자를 넘으면 이 줄부터 뺌)
    withNote ? t.share.receiptNote : "",
  ]
    .filter(Boolean)
    .join("\n");
}
