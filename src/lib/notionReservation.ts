import { getEventOn, type SpecialEvent } from "@/data/events";
import { findBlackboardPreset } from "@/data/reservationOptions";
import { ko } from "@/i18n/ko";
import { describeColor, describeOrchidDelivery, describePayment } from "@/lib/adminFormat";
import { parseDateKey } from "@/lib/date";
import { formatReceiptNumber } from "@/lib/format";
import { getSlotHour } from "@/lib/time";
import type { ReservationDelivery, ReservationRequest, ReservationStatus, StoredReservation } from "@/types/reservation";

/**
 * 노션 "날짜별 예약 표" 내용 — 받는 날짜마다 페이지 하나, 상품 1개당 표 한 줄.
 * 노션으로 보내는 일은 server/notion.ts, 여기서는 페이지 이름과 칸 글자만 만든다.
 */

/** 표 머리글 (순서 = 칸 순서). 앞 9칸은 매장이 쓰던 노션 표와 같음 */
export const NOTION_TABLE_HEADERS = [
  "원하시는 색감",
  "금액",
  "날짜/시간대",
  "보내는분 성함",
  "보내는분 연락처",
  "받는분 성함",
  "받는분 연락처",
  "메시지",
  "예약종류",
  "승진 토퍼",
  "결제 방법",
  "호접난 받는 방법",
  "접수번호",
  "매장 메모",
] as const;

/** 이미 올린 줄을 찾을 때 보는 칸 */
export const NOTION_RECEIPT_COLUMN = NOTION_TABLE_HEADERS.indexOf("접수번호");
const ORDERER_PHONE_COLUMN = NOTION_TABLE_HEADERS.indexOf("보내는분 연락처");
const RECIPIENT_PHONE_COLUMN = NOTION_TABLE_HEADERS.indexOf("받는분 연락처");
const KIND_COLUMN = NOTION_TABLE_HEADERS.indexOf("예약종류");

/** 이 상태가 되면 노션 표에 올림 (입금·결제 확인 이후) */
export const NOTION_SYNC_STATUSES: ReservationStatus[] = ["confirmed", "made", "delivered"];

const CANCELED_MARK = "[취소] ";

/** 특별한 날 페이지 이름 앞부분 — 새 종류를 추가하면 타입 오류로 알려줌 */
const eventPagePrefix: Record<SpecialEvent["kind"], string> = {
  institutePromotion: "인재개발원",
};

/** 표 아래에 연락처 모음(중복 제외)을 붙이는 특별한 날 — 단체 문자 보내기용 */
const contactListEventKinds: SpecialEvent["kind"][] = ["institutePromotion"];

/** 연락처 모음 한 줄에 넣는 개수 */
export const CONTACT_LIST_CHUNK = 20;

/** 이 날짜 페이지에 연락처 모음을 붙이는지 */
export function hasContactLists(dateKey: string) {
  const event = getEventOn(dateKey);
  return event ? contactListEventKinds.includes(event.kind) : false;
}

/** 연락처 모음 제목 앞부분 — 노션에서 이 글자로 시작하는 제목을 찾아 새로 고침 */
export const CONTACT_LIST_TITLES = {
  orderer: "주문자 연락처",
  recipient: "받는분 연락처",
} as const;

/** 같은 번호 판단용 — 숫자와 + 만 남김 (010-1234-5678 = 01012345678) */
function phoneKey(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

/** 국내 번호는 010-1234-5678 모양으로, 그 밖(해외 등)은 적힌 그대로 */
function formatPhone(phone: string) {
  const digits = phoneKey(phone);
  if (/^01\d{8,9}$/.test(digits) || /^0[3-9]\d{8,9}$/.test(digits)) {
    return digits.replace(/^(0\d{2})(\d{3,4})(\d{4})$/, "$1-$2-$3");
  }
  if (/^02\d{7,8}$/.test(digits)) return digits.replace(/^(02)(\d{3,4})(\d{4})$/, "$1-$2-$3");
  return phone.trim();
}

/** 중복 뺀 번호를 CONTACT_LIST_CHUNK개씩 묶음 (처음 나온 순서 유지) */
function uniqueChunks(phones: string[]) {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const phone of phones) {
    const key = phoneKey(phone);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(formatPhone(phone));
  }
  const chunks: string[] = [];
  for (let index = 0; index < unique.length; index += CONTACT_LIST_CHUNK) {
    chunks.push(unique.slice(index, index + CONTACT_LIST_CHUNK).join(","));
  }
  return { count: unique.length, chunks };
}

/**
 * 노션 표 줄(머리글 제외) → 주문자·받는분 연락처 모음. 취소된 줄은 뺌.
 * 결과: 제목 한 줄 + 20개씩 이어 쓴 줄들
 */
export function buildContactLists(tableRows: string[][]) {
  const active = tableRows.filter((cells) => !cells[KIND_COLUMN]?.startsWith(CANCELED_MARK.trim()));
  const orderer = uniqueChunks(active.map((cells) => cells[ORDERER_PHONE_COLUMN] ?? ""));
  const recipient = uniqueChunks(active.map((cells) => cells[RECIPIENT_PHONE_COLUMN] ?? ""));
  return [
    { title: `${CONTACT_LIST_TITLES.orderer} (중복 제외 ${orderer.count}개)`, lines: orderer.chunks },
    { title: `${CONTACT_LIST_TITLES.recipient} (중복 제외 ${recipient.count}개)`, lines: recipient.chunks },
  ];
}

/** "2026-10-30" → "인재개발원 26/10/30" (특별한 날) / "예약 26/10/15" */
export function notionPageTitle(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  const event = getEventOn(dateKey);
  return `${event ? eventPagePrefix[event.kind] : "예약"} ${year.slice(2)}/${month}/${day}`;
}

/** "2026. 10. 30.(금) 오전 9:00 인재개발원" */
function formatSchedule(request: ReservationRequest) {
  const date = parseDateKey(request.date);
  const event = getEventOn(request.date);
  const text = `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.(${ko.format.weekdays[date.getDay()]}) ${ko.format.time(getSlotHour(request.time))}`;
  return event ? `${text} ${eventPagePrefix[event.kind]}` : text;
}

/** 메시지 칸 — 꽃다발 메모지는 문구만, 리본·블랙보드는 앞에 방식 표시 */
function formatMessage(delivery: ReservationDelivery) {
  switch (delivery.messageType) {
    case "none":
      return "";
    case "memo":
      return delivery.memo;
    case "ribbon":
      return `리본: ${delivery.ribbonLeft || "-"} / ${delivery.ribbonRight || "-"}`;
    case "blackboard": {
      const preset = findBlackboardPreset(delivery.category, delivery.blackboardPreset);
      return `블랙보드: ${preset && !preset.text ? ko.blackboardPresets[preset.id] : delivery.blackboard}`;
    }
  }
}

/** 예약 한 건 → 표 줄들 (상품 1개당 한 줄, 칸 순서는 NOTION_TABLE_HEADERS) */
export function buildNotionRows({ id, status, adminMemo, request }: StoredReservation): string[][] {
  const color = describeColor(request) ?? "";
  const schedule = formatSchedule(request);
  const payment = describePayment(request);
  const orchid = describeOrchidDelivery(request) ?? "";
  const receipt = formatReceiptNumber(id);
  const canceled = status === "canceled" ? CANCELED_MARK : "";

  return request.deliveries.map((delivery) => {
    const row: Record<(typeof NOTION_TABLE_HEADERS)[number], string> = {
      "원하시는 색감": delivery.category === "orchid" ? "" : color,
      금액: ko.format.price(delivery.price),
      "날짜/시간대": schedule,
      "보내는분 성함": request.ordererName,
      "보내는분 연락처": request.ordererPhone,
      "받는분 성함": delivery.recipientName || "(예약자 픽업)",
      "받는분 연락처": delivery.recipientPhone,
      메시지: formatMessage(delivery),
      예약종류: `${canceled}${ko.categories[delivery.category].name}`,
      "승진 토퍼": [delivery.topperName, delivery.topperRank].filter(Boolean).join(" "),
      "결제 방법": payment,
      "호접난 받는 방법": delivery.category === "orchid" ? orchid : "",
      접수번호: receipt,
      "매장 메모": adminMemo,
    };
    return NOTION_TABLE_HEADERS.map((header) => row[header]);
  });
}
