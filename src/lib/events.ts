import { getEventOn, specialEvents, type SpecialEvent } from "@/data/events";
import { ko, type Messages } from "@/i18n/ko";
import { addDaysToKey, formatDateLong, parseDateKey, toDateKey } from "@/lib/date";
import { getSlotHour, hasBookableSlot, isSlotBookable, toNow, type Now } from "@/lib/time";
import type { ProductCategoryId } from "@/types/reservation";

/** 특별한 날의 화면 문구 (제목·짧은 이름·달력 표시·안내) */
export function getEventCopy(event: SpecialEvent, t: Messages = ko) {
  const copy = t.events[event.kind];
  return {
    title: copy.title(event.term),
    shortTitle: copy.shortTitle(event.term),
    calendarLabel: copy.calendarLabel,
    highlights: copy.highlights,
  };
}

/** 그 날짜에 이 종류 상품을 담으면 무료 토퍼(이름·직급) 입력칸이 생기는지 */
export function hasFreeTopper(dateKey: string | null, category: ProductCategoryId) {
  if (!dateKey) return false;
  return getEventOn(dateKey)?.topperCategories.includes(category) ?? false;
}

/** 아직 예약할 수 있는 특별한 날 (날짜순) */
export function getOpenEvents(now: Now): SpecialEvent[] {
  return specialEvents.filter((event) => hasBookableSlot(event.date, now));
}

/** 특별한 날의 예약 마감 시각 — 그날 시간대 중 하나라도 고를 수 있는 마지막 순간 다음 분 */
export function getEventDeadline(event: SpecialEvent): Date | null {
  const lastSlot = [...event.slots].sort().at(-1);
  if (!lastSlot) return null;

  // 받는 시각부터 1분씩 거슬러 올라가며 처음으로 예약 가능한 순간을 찾음 (규칙은 isSlotBookable 하나만 따름)
  const start = parseDateKey(event.date);
  start.setHours(getSlotHour(lastSlot));
  const earliest = parseDateKey(addDaysToKey(event.date, -7));

  for (const moment = new Date(start); moment >= earliest; moment.setMinutes(moment.getMinutes() - 1)) {
    const now = toNow(moment);
    if (event.slots.some((slot) => isSlotBookable(slot, event.date, now))) {
      return new Date(moment.getTime() + 60_000);
    }
  }
  return null;
}

/** Date → "10월 7일(수) 오후 5시" (언어별) */
export function formatDeadline(date: Date, t: Messages = ko) {
  return t.format.deadline(formatDateLong(toDateKey(date), t), date.getHours(), date.getMinutes());
}
