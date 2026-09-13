"use client";

import ErrorText from "@/components/ui/ErrorText";
import { CalendarIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import { getEventOn } from "@/data/events";
import {
  afternoonSlots,
  morningSlots,
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import { formatDateLabel } from "@/lib/date";
import { getOpenEvents } from "@/lib/events";
import { formatTimeLabel, hasBookableSlot, isSlotBookable, type Now } from "@/lib/time";
import type { Selection } from "@/types/reservation";
import Calendar from "./Calendar";
import EventDayNotice from "./EventDayNotice";
import { SECTION, sectionScrollMargin } from "./sections";
import TimeSlotGroup from "./TimeSlotGroup";

export default function DateTimeSection({
  now,
  date,
  time,
  onChange,
  issue,
}: {
  /** null = 서버 렌더링 중 (아직 현재 시각을 모름) */
  now: Now | null;
  date: string | null;
  time: string | null;
  onChange: (patch: Pick<Selection, "date" | "time">) => void;
  issue: "date" | "time" | null;
}) {
  const isSlotDisabled = (slot: string) =>
    date === null || now === null || !isSlotBookable(slot, date, now);
  const selectedEvent = date ? getEventOn(date) : undefined;
  const openEvents = now ? getOpenEvents(now) : [];

  /** 날짜를 바꿨을 때 그 날짜에 안 되는 시간이 선택돼 있으면 시간 선택을 해제 */
  function handleDateSelect(nextDate: string) {
    const keepTime = time !== null && now !== null && isSlotBookable(time, nextDate, now);
    onChange({ date: nextDate, time: keepTime ? time : null });
  }

  return (
    <section id={SECTION.dateTime} className={`${sectionScrollMargin} px-5 pb-8 pt-7`}>
      <SectionHeading icon={<CalendarIcon />}>
        {date ? formatDateLabel(date) : "날짜"}
        <span className="text-sub">·</span>
        <span>{time ? formatTimeLabel(time) : "시간을 선택해 주세요"}</span>
      </SectionHeading>
      <p className="mt-1.5 text-sm text-sub">
        당일 예약은 받으실 시간 {SAME_DAY_LEAD_HOURS}시간 전까지 가능해요.
        <br />
        오후 {ORDER_CLOSE_HOUR - 12}시가 되면 다음날 오전 {ORDER_OPEN_HOUR}시까지는 예약할 수 없어요.
      </p>
      {issue === "date" && <ErrorText>받으실 날짜를 선택해 주세요.</ErrorText>}
      {issue === "time" && <ErrorText>받으실 시간을 선택해 주세요.</ErrorText>}

      {openEvents.length > 0 && (
        <div className="mt-4">
          <p className="text-[13px] font-semibold text-body">특별한 날 바로 선택</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {openEvents.map((event) => {
              const active = event.date === date;
              return (
                <button
                  key={event.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleDateSelect(event.date)}
                  className={`rounded-full border px-3.5 py-2 text-[13px] font-bold transition ${
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-brand bg-brand-tint text-brand-dark hover:bg-white"
                  }`}
                >
                  🎓 {event.shortTitle} · {formatDateLabel(event.date)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {now ? (
        <Calendar
          // 다른 달의 날짜를 바깥(특별한 날 버튼 등)에서 고르면 그 달을 보여주도록 다시 그림
          key={date ? date.slice(0, 7) : "none"}
          todayKey={now.dateKey}
          selected={date}
          isDateDisabled={(dateKey) => !hasBookableSlot(dateKey, now)}
          getDayLabel={(dateKey) => getEventOn(dateKey)?.calendarLabel}
          onSelect={handleDateSelect}
        />
      ) : (
        <div className="mt-6 h-[330px] animate-pulse rounded-xl bg-soft" />
      )}

      <div className="mt-2 border-t border-line pt-5">
        {date === null && (
          <p className="mb-3 text-sm text-sub">날짜를 먼저 선택하면 시간을 고를 수 있어요.</p>
        )}
        {selectedEvent ? (
          <>
            <div className="mb-4 rounded-xl border border-brand bg-brand-tint px-4 py-3">
              <EventDayNotice event={selectedEvent} compact />
            </div>
            <TimeSlotGroup
              title={`${selectedEvent.shortTitle} 시간`}
              slots={selectedEvent.slots}
              selected={time}
              isDisabled={isSlotDisabled}
              onSelect={(slot) => onChange({ date, time: slot })}
            />
          </>
        ) : (
          <>
            <TimeSlotGroup
              title="오전"
              slots={morningSlots}
              selected={time}
              isDisabled={isSlotDisabled}
              onSelect={(slot) => onChange({ date, time: slot })}
            />
            <TimeSlotGroup
              title="오후"
              slots={afternoonSlots}
              selected={time}
              isDisabled={isSlotDisabled}
              onSelect={(slot) => onChange({ date, time: slot })}
            />
          </>
        )}
      </div>
    </section>
  );
}
