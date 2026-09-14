"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/ui/icons";
import { MAX_MONTHS_AHEAD } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import { getMonthGrid, monthsBetween, toDateKey } from "@/lib/date";

export default function Calendar({
  todayKey,
  selected,
  isDateDisabled,
  getDayLabel,
  onSelect,
}: {
  todayKey: string;
  /** 처음 보여줄 달도 이 날짜 기준 (다른 달 날짜를 바깥에서 고르면 key를 바꿔 다시 그리기) */
  selected: string | null;
  /** 지난 날짜, 예약 가능한 시간이 남지 않은 당일 등 */
  isDateDisabled: (dateKey: string) => boolean;
  /** 특별한 날 표시 (예: "승진식") — 없으면 undefined */
  getDayLabel?: (dateKey: string) => string | undefined;
  onSelect: (dateKey: string) => void;
}) {
  const t = useT();
  const [monthOffset, setMonthOffset] = useState(() =>
    selected ? Math.min(MAX_MONTHS_AHEAD, Math.max(0, monthsBetween(todayKey, selected))) : 0,
  );
  const { year, month, cells } = getMonthGrid(todayKey, monthOffset);

  return (
    <div className="mt-5">
      <div className="flex items-center justify-center gap-6">
        <MonthButton
          direction="left"
          label={t.dateTime.prevMonth}
          disabled={monthOffset <= 0}
          onClick={() => setMonthOffset(monthOffset - 1)}
        />
        <p className="min-w-24 text-center text-xl font-bold text-ink">
          {year}.{month + 1}
        </p>
        <MonthButton
          direction="right"
          label={t.dateTime.nextMonth}
          disabled={monthOffset >= MAX_MONTHS_AHEAD}
          onClick={() => setMonthOffset(monthOffset + 1)}
        />
      </div>

      <div className="mt-5 grid grid-cols-7 text-center text-sm text-body">
        {t.format.weekdays.map((weekday, index) => (
          <span key={index} className="py-2">
            {weekday}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, index) =>
          day === null ? (
            <span key={`blank-${index}`} aria-hidden="true" />
          ) : (
            <DayButton
              key={toDateKey(day)}
              day={day}
              todayKey={todayKey}
              selected={selected}
              disabled={isDateDisabled(toDateKey(day))}
              label={getDayLabel?.(toDateKey(day))}
              onSelect={onSelect}
            />
          ),
        )}
      </div>
    </div>
  );
}

function DayButton({
  day,
  todayKey,
  selected,
  disabled,
  label,
  onSelect,
}: {
  day: Date;
  todayKey: string;
  selected: string | null;
  disabled: boolean;
  /** 특별한 날 표시 */
  label?: string;
  onSelect: (dateKey: string) => void;
}) {
  const t = useT();
  const key = toDateKey(day);
  const isSelected = key === selected;
  const isToday = key === todayKey;
  const isSunday = day.getDay() === 0;
  const isSpecial = label !== undefined;

  const tone = isSelected
    ? "bg-brand font-bold text-white"
    : disabled
      ? "text-disabled"
      : isSpecial
        ? "bg-brand-tint font-bold text-brand-dark ring-1 ring-brand hover:bg-white"
        : isSunday
          ? "text-danger hover:bg-soft"
          : "text-ink hover:bg-soft";

  const caption = label ?? (isToday ? t.dateTime.today : undefined);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(key)}
      aria-pressed={isSelected}
      aria-label={t.dateTime.dayAria(day.getMonth() + 1, day.getDate(), label, isToday)}
      className="flex justify-center py-0.5 disabled:cursor-default"
    >
      <span
        className={`flex h-12 w-11 flex-col items-center justify-center rounded-xl text-[16px] transition ${tone}`}
      >
        {day.getDate()}
        {caption && (
          <span
            className={`max-w-full truncate px-0.5 text-[10px] leading-none ${
              isSelected ? "text-white" : isSpecial && !disabled ? "font-bold text-brand-dark" : "text-sub"
            }`}
          >
            {caption}
          </span>
        )}
      </span>
    </button>
  );
}

function MonthButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-soft disabled:text-disabled disabled:hover:bg-transparent"
    >
      <ChevronIcon direction={direction} className="h-4 w-4" />
    </button>
  );
}
