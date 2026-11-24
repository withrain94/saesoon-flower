import { orchidRestaurants, PHONE_PATTERN } from "@/data/reservationOptions";
import { ko } from "@/i18n/ko";
import { describeDeliveryName, formatAdminDate, formatAdminTime } from "@/lib/adminFormat";
import { addDaysToKey, parseDateKey } from "@/lib/date";
import { formatReceiptNumber } from "@/lib/format";
import { getSlotHour, type Now } from "@/lib/time";
import { needsDeliveryAddress } from "@/lib/units";
import type { OrchidDelivery, ReservationRequest, ReservationStatus } from "@/types/reservation";

/**
 * 손님이 예약 조회 화면에서 받는 분 정보(성함·연락처·배송지, 호접난 식당)를 고치는 규칙 (2026-11-24 사용자 요청).
 * 화면(components/lookup)과 서버 함수(server/actions/lookup)가 같이 씀. 날짜·시간·상품·금액·메시지는 고칠 수 없음.
 *
 * 고칠 수 있는 기한 (사용자 결정):
 * - 토·일 예약 → 그 전 금요일 오후 5시 전까지
 * - 오전 9시 이전(9시 포함) 예약 → 전날 오후 5시 전까지
 * - 그 외 → 예약 시간 2시간 전까지
 */

/** 9시 예약도 "9시 이전"에 넣음 (예약 마감 규칙이 다음날 9시까지 막는 것과 같게) */
const EARLY_LAST_HOUR = 9;
const CLOSE_HOUR = 17;
const LEAD_HOURS = 2;

/** 고칠 수 있는 마지막 시각 (한국 시각) — 이 시각 "전"까지 */
export function getRecipientEditDeadline(dateKey: string, slot: string): { dateKey: string; hour: number } {
  const day = parseDateKey(dateKey).getDay();
  if (day === 6 || day === 0) return { dateKey: addDaysToKey(dateKey, day === 6 ? -1 : -2), hour: CLOSE_HOUR };
  const hour = getSlotHour(slot);
  if (hour <= EARLY_LAST_HOUR) return { dateKey: addDaysToKey(dateKey, -1), hour: CLOSE_HOUR };
  return { dateKey, hour: hour - LEAD_HOURS };
}

/** 지금(한국 시각) 손님이 받는 분 정보를 고칠 수 있는지 — 취소·전달 완료·취소 요청 중이면 안 됨 */
export function canEditRecipients(
  reservation: { status: ReservationStatus; cancelRequested: boolean; date: string; time: string },
  now: Now,
) {
  if (reservation.status === "canceled" || reservation.status === "delivered" || reservation.cancelRequested) return false;
  const deadline = getRecipientEditDeadline(reservation.date, reservation.time);
  if (now.dateKey !== deadline.dateKey) return now.dateKey < deadline.dateKey;
  return now.minutes < deadline.hour * 60;
}

export type RecipientEditInput = {
  /** request.deliveries와 같은 순서·개수 */
  deliveries: { recipientName: string; recipientPhone: string; recipientAddress: string }[];
  /** 호접난 식당 배송일 때만 */
  orchid: { restaurant: string; reservationName: string } | null;
};

export type RecipientEditError =
  | "recipientName"
  | "recipientPhone"
  | "recipientAddress"
  | "orchidRestaurant"
  | "orchidReservationName"
  | "unchanged"
  | "invalid";

const PHONE = new RegExp(`^(?:${PHONE_PATTERN})$`);
const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** 고친 값을 신청서 검사와 같은 규칙으로 확인하고, 받는 분 칸만 바꾼 예약 내용을 돌려줌 */
export function applyRecipientEdit(
  request: ReservationRequest,
  input: unknown,
): { ok: true; request: ReservationRequest } | { ok: false; code: RecipientEditError } {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const rawDeliveries = Array.isArray(raw.deliveries) ? raw.deliveries : [];
  if (rawDeliveries.length !== request.deliveries.length) return { ok: false, code: "invalid" };

  const deliveries = [];
  for (const [index, delivery] of request.deliveries.entries()) {
    const d = (rawDeliveries[index] ?? {}) as Record<string, unknown>;
    const recipientName = str(d.recipientName, 50);
    const recipientPhone = str(d.recipientPhone, 25);
    const needsAddress = needsDeliveryAddress(request.receiveMethod, delivery.category);
    const recipientAddress = needsAddress ? str(d.recipientAddress, 200) : "";
    if (recipientPhone && !PHONE.test(recipientPhone)) return { ok: false, code: "recipientPhone" };
    if (needsAddress && !recipientName) return { ok: false, code: "recipientName" };
    if (needsAddress && !recipientPhone) return { ok: false, code: "recipientPhone" };
    if (needsAddress && !recipientAddress) return { ok: false, code: "recipientAddress" };
    deliveries.push({ ...delivery, recipientName, recipientPhone, recipientAddress });
  }

  let orchidDelivery: OrchidDelivery | null = request.orchidDelivery;
  if (orchidDelivery?.method === "restaurant") {
    const rawOrchid = (raw.orchid ?? {}) as Record<string, unknown>;
    const restaurant = str(rawOrchid.restaurant, 200);
    const reservationName = str(rawOrchid.reservationName, 50);
    if (!restaurant) return { ok: false, code: "orchidRestaurant" };
    if (orchidRestaurants.some((name) => name === restaurant) && !reservationName) {
      return { ok: false, code: "orchidReservationName" };
    }
    orchidDelivery = { ...orchidDelivery, restaurant, reservationName };
  }

  const next = { ...request, deliveries, orchidDelivery };
  if (describeRecipientChanges(request, next).length === 0) return { ok: false, code: "unchanged" };
  return { ok: true, request: next };
}

const show = (value: string) => value || "(비움)";

/** 바뀐 칸 목록 (텔레그램 알림용, 한국어) */
export function describeRecipientChanges(before: ReservationRequest, after: ReservationRequest) {
  const lines: string[] = [];
  before.deliveries.forEach((old, index) => {
    const next = after.deliveries[index];
    if (!next) return;
    const fields = [
      ["성함", old.recipientName, next.recipientName],
      ["연락처", old.recipientPhone, next.recipientPhone],
      ["배송지", old.recipientAddress, next.recipientAddress],
    ].filter(([, a, b]) => a !== b);
    if (fields.length === 0) return;
    lines.push(`• ${describeDeliveryName(before, old)}`);
    for (const [label, a, b] of fields) lines.push(`   ${label}: ${show(a)} → ${show(b)}`);
  });
  const oldOrchid = before.orchidDelivery;
  const newOrchid = after.orchidDelivery;
  if (oldOrchid && newOrchid) {
    if (oldOrchid.restaurant !== newOrchid.restaurant) {
      lines.push(`• 호접난 식당: ${show(oldOrchid.restaurant)} → ${show(newOrchid.restaurant)}`);
    }
    if (oldOrchid.reservationName !== newOrchid.reservationName) {
      lines.push(`• 식당 예약 이름: ${show(oldOrchid.reservationName)} → ${show(newOrchid.reservationName)}`);
    }
  }
  return lines;
}

/** 손님이 받는 분 정보를 고쳤을 때 매장 텔레그램 알림 (한국어) */
export function buildRecipientEditNotice(
  id: string,
  before: ReservationRequest,
  after: ReservationRequest,
  status: ReservationStatus,
  adminUrl: string | null,
) {
  return [
    `✏️ 손님이 받는 분 정보를 고쳤어요 · 접수번호 ${formatReceiptNumber(id)}`,
    `📅 ${formatAdminDate(before.date)} ${formatAdminTime(before.time)} · ${ko.receive.methods[before.receiveMethod].label}`,
    `👤 ${before.ordererName} · ${before.ordererPhone}`,
    ...describeRecipientChanges(before, after),
    ...(status === "made" ? ["⚠️ 이미 제작 완료로 표시된 예약이에요 — 바뀐 내용을 확인해 주세요."] : []),
    ...(adminUrl ? [`관리자: ${adminUrl}`] : []),
  ].join("\n");
}
