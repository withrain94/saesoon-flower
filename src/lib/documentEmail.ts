import { documentOptions } from "@/data/reservationOptions";
import { businessInfo } from "@/data/shop";
import { ko } from "@/i18n/ko";
import { formatDateLabel } from "@/lib/date";
import type { BusinessDocument } from "@/lib/documents";
import { formatReceiptNumber } from "@/lib/format";
import { formatTimeLabel } from "@/lib/time";
import type { ReservationRequest } from "@/types/reservation";

/**
 * 견적서·거래명세표 이메일 문구 (한국어 — 서류가 한국어라서, 외국어 신청이면 영어 한 줄을 덧붙임).
 * 실제 보내기는 server/documentEmail.ts
 */

/** "견적서·거래명세표" — 요청한 서류만 */
function documentTitles(request: ReservationRequest) {
  return documentOptions
    .filter((option) => request.documents.includes(option.value))
    .map((option) => option.label)
    .join("·");
}

/** 첨부 파일 이름 — "새순_견적서_SS-20260914-1530.pdf" */
export function documentFileName(document: BusinessDocument) {
  return `${businessInfo.tradeName}_${document.title}_${document.number}.pdf`;
}

export function buildDocumentEmail(id: string, request: ReservationRequest) {
  const titles = documentTitles(request);
  const receiptNumber = formatReceiptNumber(id);
  const lines = [
    `${request.documentCompany} ${request.ordererName}님, 안녕하세요.`,
    `${ko.shop.name}입니다.`,
    "",
    `요청하신 ${titles}를 PDF 파일로 첨부해 보내드립니다.`,
    "",
    `· 접수번호: ${receiptNumber}`,
    `· 받는 날짜: ${formatDateLabel(request.date)} ${formatTimeLabel(request.time)}`,
    `· 합계 금액: ${ko.format.price(request.totalPrice)}`,
    "",
    `궁금한 점은 이 메일에 답장하시거나 전화(${businessInfo.phone})로 문의해 주세요.`,
    "감사합니다.",
  ];
  if (request.locale !== "ko") {
    lines.push("", "Your requested documents (in Korean) are attached as PDF files. Thank you.");
  }
  return {
    subject: `[${ko.shop.name}] ${titles} 보내드립니다 (접수번호 ${receiptNumber})`,
    text: lines.join("\n"),
  };
}

/** 자동 발송 실패 — 매장 텔레그램 알림 문구 */
export function buildDocumentEmailFailedNotice(id: string, request: ReservationRequest, adminUrl: string | null) {
  return [
    `⚠️ 서류 이메일 보내기 실패 · 접수번호 ${formatReceiptNumber(id)}`,
    `${documentTitles(request)} → ${request.documentEmail}`,
    "관리자 상세 화면에서 '서류 이메일 다시 보내기'를 눌러주세요.",
    adminUrl,
  ]
    .filter(Boolean)
    .join("\n");
}
