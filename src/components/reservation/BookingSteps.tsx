import { useStoreInfoT } from "@/hooks/useStoreInfoT";
import { sectionTabs } from "./sections";

/** "예약은 3단계면 끝나요" — 누르면 그 단계 섹션으로 이동 (단계 = 위쪽 탭과 같은 3개) */
export default function BookingSteps() {
  const s = useStoreInfoT();

  return (
    <section aria-label={s.steps.title} className="px-5 pb-1 pt-4">
      <p className="text-[15px] font-bold text-ink">{s.steps.title}</p>
      <p className="mt-0.5 text-[12.5px] text-sub">{s.steps.subtitle}</p>
      <ol className="mt-2.5 flex items-stretch gap-1">
        {sectionTabs.map((tab, index) => (
          <li key={tab.id} className="flex flex-1 items-center gap-1">
            <a
              href={`#${tab.id}`}
              className="flex flex-1 flex-col items-center rounded-xl bg-brand-tint px-1 py-2.5 text-center transition hover:bg-panel"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[12px] font-extrabold text-white">
                {index + 1}
              </span>
              <span className="mt-1 text-[12.5px] font-bold leading-tight text-ink">{s.steps.items[tab.key]}</span>
            </a>
            {index < sectionTabs.length - 1 && <span className="text-[12px] text-faint">›</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
