import type { SpecialEvent } from "@/data/events";
import { formatDateLong } from "@/lib/date";
import { formatDeadline, getEventDeadline } from "@/lib/events";

/** 특별한 날 안내 — 제목·날짜·안내 문구·예약 마감 (첫 화면 배너와 날짜 섹션 공용) */
export default function EventDayNotice({
  event,
  compact = false,
}: {
  event: SpecialEvent;
  /** 날짜 섹션 안에서는 제목을 작게 */
  compact?: boolean;
}) {
  const deadline = getEventDeadline(event);

  return (
    <div>
      <p className={`font-extrabold text-ink ${compact ? "text-[15px]" : "text-[17px]"}`}>
        <span aria-hidden="true">🎓 </span>
        {event.title}
      </p>
      <p className="mt-0.5 text-[14px] font-bold text-brand-dark">{formatDateLong(event.date)}</p>
      <ul className="mt-2 space-y-1 text-[13.5px] leading-relaxed text-body">
        {event.highlights.map((line) => (
          <li key={line} className="flex gap-1.5">
            <span aria-hidden="true" className="text-brand">
              ✓
            </span>
            <span>{line}</span>
          </li>
        ))}
        {deadline && (
          <li className="flex gap-1.5 font-semibold text-ink">
            <span aria-hidden="true" className="text-brand">
              ✓
            </span>
            <span>{formatDeadline(deadline)} 전까지 예약해 주세요.</span>
          </li>
        )}
      </ul>
    </div>
  );
}
