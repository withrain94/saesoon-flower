import { bookingSiteUrl, businessInfo } from "@/data/shop";
import { formatAdminDate, formatAdminTime, summarizeItems } from "@/lib/adminFormat";
import type { ReservationRequest } from "@/types/reservation";

/**
 * 관리자 [지금 문자 보내기] — 예약자에게 보내는 안내 문자 (매장 안드로이드 폰의 SMS Gate 앱으로 발송).
 * 기본 문구만 만들고, 관리자가 보내기 전에 고칠 수 있음.
 */

/** 문자 한 통 최대 글자 (장문 문자도 너무 길면 휴대폰에서 여러 통으로 나뉨) */
export const MAX_SMS_TEXT = 1000;

/** 완성 사진 보기 주소 — 손님이 문자 속 링크로 열어 보는 화면 (/photo/예약id) */
export function completionPhotoPageUrl(reservationId: string) {
  return `${bookingSiteUrl}/photo/${reservationId}`;
}

/** 기본 안내 문구 — 완성 사진이 있으면 "준비됐어요" + 사진 보기 링크 */
export function buildOrdererSmsText(
  reservationId: string,
  request: ReservationRequest,
  { hasPhotos }: { hasPhotos: boolean },
) {
  const pickup = request.receiveMethod !== "delivery";
  const lines = [
    `[새순 꽃집] ${request.ordererName}님, ${hasPhotos ? "예약하신 꽃이 예쁘게 준비됐어요." : "예약하신 꽃 안내드려요."}`,
    "",
    `- ${pickup ? "픽업" : "배송"} 일시: ${formatAdminDate(request.date)} ${formatAdminTime(request.time)}`,
    `- 상품: ${summarizeItems(request)}`,
  ];
  if (pickup) lines.push(`- 매장: ${businessInfo.address}`);
  if (hasPhotos) lines.push("", `완성 사진 보기: ${completionPhotoPageUrl(reservationId)}`);
  lines.push("", `문의: ${businessInfo.phone}`);
  return lines.join("\n");
}

/**
 * 받는 번호를 국제 형식으로 — "010-1234-5678" → "+821012345678", "+1 555-123" → "+1555123".
 * 휴대폰 번호로 볼 수 없으면 null
 */
export function toSmsPhoneNumber(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^0-9]/g, "");
  if (trimmed.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (/^01[016789][0-9]{7,8}$/.test(digits)) return `+82${digits.slice(1)}`;
  if (/^8201[016789][0-9]{7,8}$/.test(digits)) return `+${digits}`;
  return null;
}

/** 휴대폰 기본 문자 앱을 여는 주소 (자동 발송이 안 될 때 예비용) */
export function smsAppLink(phone: string, text: string) {
  return `sms:${phone.replace(/[^0-9+]/g, "")}?body=${encodeURIComponent(text)}`;
}
