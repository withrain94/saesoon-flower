import { formatPrice } from "@/lib/format";
import { getItemName, type SelectionSummary } from "@/lib/selection";

/** 담은 상품·일정·총 금액 박스 */
export default function OrderSummary({ summary }: { summary: SelectionSummary }) {
  const { items, scheduleLabel, totalQuantity, totalPrice } = summary;

  return (
    <div className="rounded-xl bg-soft px-4 py-3.5 text-left text-[14px]">
      <p className="text-[13px] text-sub">담은 상품</p>
      {items.length > 0 ? (
        <ul className="mt-1 space-y-1">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-baseline justify-between gap-3">
              <span className="font-semibold text-ink">
                {getItemName(product)} × {quantity}
              </span>
              <span className="shrink-0 text-body">{formatPrice(product.price * quantity)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 font-semibold text-faint">예약할 상품을 담아주세요</p>
      )}

      <div className="mt-2.5 flex gap-3">
        <span className="shrink-0 text-sub">날짜·시간</span>
        <span className={`font-semibold ${scheduleLabel ? "text-ink" : "text-faint"}`}>
          {scheduleLabel || "날짜와 시간을 선택해 주세요"}
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-3 border-t border-line pt-2">
        <span className="text-sub">총 {totalQuantity}개</span>
        <span className="text-[17px] font-bold text-brand-dark">{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
}
