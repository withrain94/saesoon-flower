import { ChevronIcon } from "@/components/ui/icons";
import type { SpecialEvent } from "@/data/events";
import { useT } from "@/hooks/useLocale";
import { formatDateLabel } from "@/lib/date";
import { getEventCopy, getOpenEvents } from "@/lib/events";
import type { Now } from "@/lib/time";
import EventDayNotice from "./EventDayNotice";

/** 첫 화면 — 가장 가까운 특별한 날(예: 인재개발원 승진식)을 크게, 다음 일정은 작게 */
export default function SpecialEventBanner({
  now,
  onBook,
}: {
  /** null = 서버 렌더링 중 (마감 여부를 모르므로 그리지 않음) */
  now: Now | null;
  /** 이 날짜·추천 상품으로 예약 시작 */
  onBook: (event: SpecialEvent) => void;
}) {
  const t = useT();
  if (now === null) return null;
  const [nearest, ...later] = getOpenEvents(now);
  if (!nearest) return null;

  return (
    <section
      aria-label={t.eventBanner.ariaLabel}
      className="mx-5 mb-3 mt-3 rounded-2xl border border-brand bg-brand-tint px-4 pb-4 pt-3.5"
    >
      <EventDayNotice event={nearest} />

      <button
        type="button"
        onClick={() => onBook(nearest)}
        className="mt-3 flex min-h-12 w-full items-center justify-center gap-1 rounded-xl bg-brand px-3 py-2 text-[15px] font-bold text-white transition hover:bg-brand-dark active:scale-[0.99]"
      >
        {t.eventBanner.book(getEventCopy(nearest, t).shortTitle, t.categories[nearest.recommendedCategory].name)}
        <ChevronIcon direction="right" className="h-4 w-4 shrink-0" />
      </button>

      {later.length > 0 && (
        <div className="mt-3 border-t border-panel-line pt-2.5">
          <p className="text-[12px] text-sub">{t.eventBanner.later}</p>
          <ul className="mt-1 space-y-1">
            {later.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onBook(event)}
                  className="flex w-full items-center justify-between gap-2 text-left text-[14px] text-body hover:text-brand-dark"
                >
                  <span>
                    <span className="font-semibold text-ink">{getEventCopy(event, t).shortTitle}</span> ·{" "}
                    {formatDateLabel(event.date, t)}
                  </span>
                  <span className="flex shrink-0 items-center text-[13px] text-sub">
                    {t.eventBanner.bookShort}
                    <ChevronIcon direction="right" className="h-3.5 w-3.5" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
