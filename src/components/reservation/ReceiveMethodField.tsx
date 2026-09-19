import { deliveryFreeRules, receiveMethods } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import type { ReceiveMethod } from "@/types/reservation";
import OrchidDeliveryField from "./OrchidDeliveryField";

/**
 * 받는 방법 — 매장 픽업 / 배송 (예약 전체에 한 번, 받는 분 칸보다 먼저).
 * 배송이면 배송비 안내 + (호접난이 있으면) 호접난 배송 식당 칸. 꽃다발·꽃바구니 배송지는 받는 분 칸에서.
 * input name: receiveMethod
 */
export default function ReceiveMethodField({
  value,
  onChange,
  hasOrchid,
  hasAddressItems,
}: {
  value: ReceiveMethod;
  onChange: (value: ReceiveMethod) => void;
  /** 호접난을 담았는지 — 배송이면 식당 칸 */
  hasOrchid: boolean;
  /** 받는 분 칸에 배송지를 적는 상품(꽃다발·꽃바구니)을 담았는지 */
  hasAddressItems: boolean;
}) {
  const t = useT();
  const copy = t.receive;

  return (
    <fieldset>
      <legend className="text-[15px] font-bold text-ink">
        {copy.title} <span className="text-brand">*</span>
      </legend>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {receiveMethods.map((method) => {
          const active = method === value;
          return (
            <label
              key={method}
              className={`cursor-pointer rounded-xl border px-2 py-2.5 text-center transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
                active ? "border-brand bg-brand text-white" : "border-field bg-white text-ink hover:border-brand"
              }`}
            >
              <input
                type="radio"
                name="receiveMethod"
                value={method}
                checked={active}
                onChange={() => onChange(method)}
                className="sr-only"
              />
              <span className="block text-[14px] font-bold leading-snug">{copy.methods[method].label}</span>
              <span className={`mt-0.5 block text-[11.5px] ${active ? "text-white/85" : "text-sub"}`}>
                {copy.methods[method].description}
              </span>
            </label>
          );
        })}
      </div>

      {value === "delivery" && (
        <div className="mt-3 space-y-3">
          <div role="note" className="rounded-2xl border border-brand bg-brand-tint px-4 py-3">
            <p className="text-[14px] font-bold text-brand-dark">🚚 {copy.feeTitle}</p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-[13px] text-body">
              {deliveryFreeRules.map((rule) => (
                <li key={rule.id}>{copy.freeRules[rule.id](t.format.priceShort(rule.minPrice))}</li>
              ))}
            </ul>
            <p className="mt-1.5 text-[13px] font-semibold text-body">📱 {copy.feeContact}</p>
          </div>
          {hasOrchid && <OrchidDeliveryField />}
          {hasAddressItems && <p className="px-1 text-[13px] text-sub">{copy.addressGuide}</p>}
        </div>
      )}
    </fieldset>
  );
}
