import { specialEvents, type SpecialEvent } from "@/data/events";
import { addDaysToKey, formatDateLong, parseDateKey, toDateKey } from "@/lib/date";
import { getSlotHour, hasBookableSlot, isSlotBookable, toNow, type Now } from "@/lib/time";

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

/** Date → "10월 7일(수) 오후 5시" (분이 있으면 "오후 5시 30분") */
export function formatDeadline(date: Date) {
  const hour = date.getHours();
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const minutes = date.getMinutes();
  return `${formatDateLong(toDateKey(date))} ${period} ${displayHour}시${minutes ? ` ${minutes}분` : ""}`;
}
