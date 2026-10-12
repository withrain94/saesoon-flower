import { useT } from "@/hooks/useLocale";
import { getChocolateName, getItemName, type SelectionSummary } from "@/lib/selection";

/** 담은 상품·초콜릿·일정·총 금액 박스 */
export default function OrderSummary({ summary }: { summary: SelectionSummary }) {
  const t = useT();
  const { items, chocolateItems, scheduleLabel, totalQuantity, totalPrice } = summary;

  return (
    <div className="rounded-xl bg-soft px-4 py-3.5 text-left text-[14px]">
      <p className="text-[13px] text-sub">{t.summary.items}</p>
      {items.length > 0 ? (
        <ul className="mt-1 space-y-1">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-baseline justify-between gap-3">
              <span className="font-semibold text-ink">
                {getItemName(product, t)} × {quantity}
              </span>
              <span className="shrink-0 text-body">{t.format.price(product.price * quantity)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 font-semibold text-faint">{t.summary.itemsEmpty}</p>
      )}

      {chocolateItems.length > 0 && (
        <>
          <p className="mt-2.5 text-[13px] text-sub">{t.chocolate.title}</p>
          <ul className="mt-1 space-y-1">
            {chocolateItems.map(({ chocolate, quantity }) => (
              <li key={chocolate.id} className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-ink">
                  {getChocolateName(chocolate, t)} × {quantity}
                </span>
                <span className="shrink-0 text-body">{t.format.price(chocolate.price * quantity)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-2.5 flex gap-3">
        <span className="shrink-0 text-sub">{t.summary.schedule}</span>
        <span className={`font-semibold ${scheduleLabel ? "text-ink" : "text-faint"}`}>
          {scheduleLabel || t.summary.scheduleEmpty}
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-3 border-t border-line pt-2">
        <span className="text-sub">{t.summary.total(totalQuantity)}</span>
        <span className="text-[17px] font-bold text-brand-dark">{t.format.price(totalPrice)}</span>
      </div>
    </div>
  );
}
