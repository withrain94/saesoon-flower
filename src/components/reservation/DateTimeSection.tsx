"use client";

import ErrorText from "@/components/ui/ErrorText";
import { CalendarIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import { getEventOn } from "@/data/events";
import { afternoonSlots, morningSlots } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import { formatDateLabel } from "@/lib/date";
import { getEventCopy, getOpenEvents } from "@/lib/events";
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
  const t = useT();
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
        {date ? formatDateLabel(date, t) : t.dateTime.headingDate}
        <span className="text-sub">·</span>
        <span>{time ? formatTimeLabel(time, t) : t.dateTime.headingTime}</span>
      </SectionHeading>
      <p className="mt-1.5 text-sm text-sub">
        {t.dateTime.sameDayRule}
        <br />
        {t.dateTime.closeRule}
      </p>
      {issue === "date" && <ErrorText>{t.dateTime.errorDate}</ErrorText>}
      {issue === "time" && <ErrorText>{t.dateTime.errorTime}</ErrorText>}

      {openEvents.length > 0 && (
        <div className="mt-4">
          <p className="text-[13px] font-semibold text-body">{t.dateTime.eventQuick}</p>
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
                  🎓 {getEventCopy(event, t).shortTitle} · {formatDateLabel(event.date, t)}
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
          getDayLabel={(dateKey) => {
            const event = getEventOn(dateKey);
            return event && getEventCopy(event, t).calendarLabel;
          }}
          onSelect={handleDateSelect}
        />
      ) : (
        <div className="mt-6 h-[330px] animate-pulse rounded-xl bg-soft" />
      )}

      <div className="mt-2 border-t border-line pt-5">
        {date === null && (
          <p className="mb-3 text-sm text-sub">{t.dateTime.pickDateFirst}</p>
        )}
        {selectedEvent ? (
          <>
            <div className="mb-4 rounded-xl border border-brand bg-brand-tint px-4 py-3">
              <EventDayNotice event={selectedEvent} compact />
            </div>
            <TimeSlotGroup
              title={t.dateTime.eventSlots(getEventCopy(selectedEvent, t).shortTitle)}
              slots={selectedEvent.slots}
              selected={time}
              isDisabled={isSlotDisabled}
              onSelect={(slot) => onChange({ date, time: slot })}
            />
          </>
        ) : (
          <>
            <TimeSlotGroup
              title={t.format.morning}
              slots={morningSlots}
              selected={time}
              isDisabled={isSlotDisabled}
              onSelect={(slot) => onChange({ date, time: slot })}
            />
            <TimeSlotGroup
              title={t.format.afternoon}
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
