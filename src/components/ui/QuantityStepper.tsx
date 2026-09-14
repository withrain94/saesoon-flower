import { useT } from "@/hooks/useLocale";

export default function QuantityStepper({
  value,
  min = 0,
  max,
  label,
  onChange,
}: {
  value: number;
  min?: number;
  max: number;
  /** 스크린리더용 상품 이름 (예: "꽃다발 6만원") */
  label: string;
  onChange: (value: number) => void;
}) {
  const t = useT();
  const buttonClassName =
    "flex h-full w-10 items-center justify-center text-xl text-ink transition hover:bg-soft disabled:text-disabled disabled:hover:bg-transparent";

  return (
    <div
      role="group"
      aria-label={t.productOption.quantity(label)}
      className={`flex h-10 w-[120px] shrink-0 items-stretch overflow-hidden rounded-lg border bg-white transition ${
        value > 0 ? "border-brand" : "border-field"
      }`}
    >
      <button
        type="button"
        aria-label={t.productOption.decrease(label)}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={buttonClassName}
      >
        −
      </button>
      <output
        aria-live="polite"
        className={`flex flex-1 items-center justify-center text-[15px] font-semibold ${
          value > 0 ? "text-brand-dark" : "text-ink"
        }`}
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={t.productOption.increase(label)}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={buttonClassName}
      >
        +
      </button>
    </div>
  );
}
