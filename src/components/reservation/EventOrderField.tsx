import type { SpecialEvent } from "@/data/events";
import { useT } from "@/hooks/useLocale";
import { getEventCopy } from "@/lib/events";

/**
 * 특별한 날(인재개발원 승진식·장기과정 수료식)을 골랐을 때 "○○ 꽃인가요?" — 예일 때만 받는 분 칸에 무료 토퍼 칸이 생김.
 * 꼭 골라야 함. input name: forEvent ("yes" / "no")
 */
export default function EventOrderField({
  event,
  value,
  onChange,
}: {
  event: SpecialEvent;
  /** null = 아직 안 고름 */
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  const t = useT();
  const copy = getEventCopy(event, t);
  const options = [
    { answer: true, label: copy.forEventYes },
    { answer: false, label: t.topper.forEventNo },
  ];

  return (
    <fieldset>
      <legend className="text-[15px] font-bold text-ink">
        🎓 {t.topper.forEventQuestion(copy.title)} <span className="text-brand">*</span>
      </legend>
      <p className="mt-0.5 text-[13px] text-sub">{copy.forEventHint}</p>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => {
          const active = value === option.answer;
          return (
            <label
              key={String(option.answer)}
              className={`cursor-pointer rounded-xl border px-2 py-3 text-center text-[14px] font-bold leading-snug transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
                active ? "border-brand bg-brand text-white" : "border-field bg-white text-ink hover:border-brand"
              }`}
            >
              <input
                type="radio"
                name="forEvent"
                value={option.answer ? "yes" : "no"}
                required
                checked={active}
                onChange={() => onChange(option.answer)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
