import { getEventOn } from "@/data/events";
import {
  allSlots,
  MAX_DAYS_AHEAD,
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  SAME_DAY_LEAD_HOURS,
  WEEKEND_ORDER_OPEN_HOUR,
} from "@/data/reservationOptions";
import { ko, type Messages } from "@/i18n/ko";
import { addDaysToKey, parseDateKey, toDateKey } from "@/lib/date";

/** 현재 시각 정보 (브라우저 기준) */
export type Now = {
  dateKey: string;
  /** 자정부터 지난 분 */
  minutes: number;
};

export function toNow(date: Date): Now {
  return { dateKey: toDateKey(date), minutes: date.getHours() * 60 + date.getMinutes() };
}

/** 매장 기준 시간대 — 서버(Vercel, UTC)에서 예약 가능 여부를 다시 검사할 때 사용 */
export const SHOP_TIME_ZONE = "Asia/Seoul";

/** 특정 시간대 기준의 현재 날짜·시각 (서버 시계가 UTC여도 한국 시간으로 계산) */
export function toNowInTimeZone(date: Date, timeZone: string = SHOP_TIME_ZONE): Now {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

/** "15:00" → 15 */
export function getSlotHour(slot: string) {
  return Number(slot.slice(0, 2));
}

/** "15:00" → "오후 3:00" (언어별) */
export function formatTimeLabel(slot: string, t: Messages = ko) {
  return t.format.time(getSlotHour(slot));
}

/** 날짜 + 자정부터 지난 분 */
type Moment = { dateKey: string; minutes: number };

function isAfter(a: Moment, b: Moment) {
  return a.dateKey > b.dateKey || (a.dateKey === b.dateKey && a.minutes > b.minutes);
}

/** 그 날짜의 예약 마감이 풀리는 시각(시) — 평일 ORDER_OPEN_HOUR(9시), 토·일 WEEKEND_ORDER_OPEN_HOUR(12시) */
export function getOrderOpenHour(dateKey: string) {
  const day = parseDateKey(dateKey).getDay();
  return day === 0 || day === 6 ? WEEKEND_ORDER_OPEN_HOUR : ORDER_OPEN_HOUR;
}

/**
 * 예약 마감 중(오후 ORDER_CLOSE_HOUR시 ~ 다음날 오전 ORDER_OPEN_HOUR시, 토·일은 낮 12시)이면 막히는 마지막 시각.
 * 이 시각까지(포함)의 시간대는 고를 수 없음. 마감 중이 아니면 null.
 */
export function getBlockedUntil(now: Now): Moment | null {
  if (now.minutes >= ORDER_CLOSE_HOUR * 60) {
    const tomorrow = addDaysToKey(now.dateKey, 1);
    return { dateKey: tomorrow, minutes: getOrderOpenHour(tomorrow) * 60 };
  }
  const open = getOrderOpenHour(now.dateKey) * 60;
  if (now.minutes < open) return { dateKey: now.dateKey, minutes: open };
  return null;
}

/** 예약할 수 있는 마지막 날짜 — 오늘(한국 날짜)부터 MAX_DAYS_AHEAD일 뒤 */
export function getLastBookableDate(now: Now) {
  return addDaysToKey(now.dateKey, MAX_DAYS_AHEAD);
}

/** 그 날짜에 고를 수 있는 시간대 — 특별한 날(data/events)은 그날 정해진 시간만 */
export function getSlotsForDate(dateKey: string) {
  return getEventOn(dateKey)?.slots ?? allSlots;
}

/**
 * 예약 가능한 시간대인지.
 * - 그 날짜의 시간대(getSlotsForDate)가 아니면: 불가
 * - 지난 날짜·MAX_DAYS_AHEAD일(6주)보다 먼 날짜: 불가
 * - 당일: 현재 시각 + SAME_DAY_LEAD_HOURS 이후 시간대만 가능
 * - 예약 마감 중: 막히는 마지막 시각(getBlockedUntil)까지의 시간대 불가
 */
export function isSlotBookable(slot: string, dateKey: string, now: Now) {
  if (!getSlotsForDate(dateKey).includes(slot)) return false;
  if (dateKey < now.dateKey || dateKey > getLastBookableDate(now)) return false;

  const slotMoment: Moment = { dateKey, minutes: getSlotHour(slot) * 60 };
  if (dateKey === now.dateKey && slotMoment.minutes < now.minutes + SAME_DAY_LEAD_HOURS * 60) {
    return false;
  }

  const blockedUntil = getBlockedUntil(now);
  return blockedUntil === null || isAfter(slotMoment, blockedUntil);
}

/** 해당 날짜에 예약 가능한 시간대가 하나라도 있는지 */
export function hasBookableSlot(dateKey: string, now: Now) {
  return getSlotsForDate(dateKey).some((slot) => isSlotBookable(slot, dateKey, now));
}
