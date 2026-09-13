import { productCategories } from "@/data/products";
import { formatPrice } from "@/lib/format";
import type { SelectionSummary } from "@/lib/selection";
import { RESERVATION_FORM_ID } from "./sections";

/** 화면 하단 고정 예약 버튼 — form 속성으로 OrdererForm을 제출 */
export default function SubmitBar({ summary }: { summary: SelectionSummary }) {
  const { countByCategory, totalQuantity, totalPrice, scheduleLabel } = summary;

  const counts = productCategories
    .filter((category) => countByCategory[category.id] > 0)
    .map((category) => `${category.name} ${countByCategory[category.id]}`);
  const description =
    totalQuantity > 0
      ? [...counts, scheduleLabel].filter(Boolean).join(" · ")
      : "상품과 날짜·시간을 선택해 주세요";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto max-w-lg border-t border-line bg-white px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className={`truncate font-semibold ${totalQuantity > 0 ? "text-ink" : "text-sub"}`}>
            {description}
          </span>
          {totalQuantity > 0 && (
            <span className="shrink-0 font-bold text-brand-dark">{formatPrice(totalPrice)}</span>
          )}
        </div>
        <button
          type="submit"
          form={RESERVATION_FORM_ID}
          className="h-[52px] w-full rounded-xl bg-brand text-[17px] font-bold text-white transition hover:bg-brand-dark active:scale-[0.99]"
        >
          예약하기
        </button>
      </div>
    </div>
  );
}
