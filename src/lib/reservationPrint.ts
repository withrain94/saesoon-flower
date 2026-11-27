import { formatAdminDate, formatAdminTime } from "@/lib/adminFormat";
import { buildNotionRows, NOTION_TABLE_HEADERS, notionPageTitle } from "@/lib/notionReservation";
import type { StoredReservation } from "@/types/reservation";

/**
 * 관리자 "예약 목록 인쇄" PDF 내용 (2026-11-26 사용자 요청 — 노션 캡처 대신 선명하게 인쇄해 체크).
 * 칸 글자는 노션 표 줄(buildNotionRows)을 그대로 써서 노션과 같은 내용. PDF 모양은 server/documentPdf/ReservationListPdf
 */

const col = (header: (typeof NOTION_TABLE_HEADERS)[number]) => NOTION_TABLE_HEADERS.indexOf(header);

/** 인쇄 표 칸 (순서 = 칸 순서) */
export const PRINT_COLUMNS = [
  "시간",
  "상품",
  "금액",
  "색감",
  "보내는분",
  "받는분",
  "받는 방법·배송지",
  "메시지",
  "토퍼",
  "결제",
  "접수번호·메모",
] as const;

export type PrintRow = { cells: string[]; firstOfReservation: boolean };

export type PrintList = { title: string; summary: string; rows: PrintRow[] };

/** PDF 글꼴(나눔고딕)에 없는 그림글자(🛍️·🍫·📞 등)는 깨져 보여서 뺌 */
const plain = (text: string) =>
  text
    .replace(/[\u{10000}-\u{10FFFF}️‍]/gu, "")
    .replace(/ {2,}/g, " ")
    .trim();

const joinLines = (...parts: string[]) => parts.map(plain).filter(Boolean).join("\n");

/** 하루치 예약(취소 제외, 시간 순) → 인쇄 표. 상품 1개당 한 줄 (초콜릿·쇼핑백은 첫 줄 색감 칸) */
export function buildPrintList(dateKey: string, reservations: StoredReservation[]): PrintList {
  const rows: PrintRow[] = [];
  let flowerCount = 0;
  for (const reservation of reservations) {
    flowerCount += reservation.request.deliveries.length;
    buildNotionRows(reservation).forEach((cells, index) => {
      const receiveMethod = cells[col("받는 방법")];
      const address = cells[col("배송지")];
      rows.push({
        firstOfReservation: index === 0,
        cells: [
          formatAdminTime(reservation.request.time),
          cells[col("예약종류")],
          cells[col("금액")],
          cells[col("원하시는 색감")],
          joinLines(cells[col("보내는분 성함")], cells[col("보내는분 연락처")]),
          joinLines(cells[col("받는분 성함")], cells[col("받는분 연락처")]),
          joinLines(receiveMethod, address),
          cells[col("메시지")],
          cells[col("토퍼")],
          cells[col("결제 방법")],
          joinLines(cells[col("접수번호")], cells[col("매장 메모")]),
        ].map(plain),
      });
    });
  }

  const pageTitle = notionPageTitle(dateKey);
  const kind = pageTitle.startsWith("예약 ") ? "" : ` · ${pageTitle.split(" ")[0]}`;
  return {
    title: `새순 예약 목록 — ${formatAdminDate(dateKey)}${kind}`,
    summary: `예약 ${reservations.length}건 · 꽃 ${flowerCount}개 (취소 제외)`,
    rows,
  };
}

/** "saesoon-reservations-2026-11-27.pdf" (한글 파일 이름은 브라우저마다 깨질 수 있어 영어로) */
export function printListFileName(dateKey: string) {
  return `saesoon-reservations-${dateKey}.pdf`;
}
