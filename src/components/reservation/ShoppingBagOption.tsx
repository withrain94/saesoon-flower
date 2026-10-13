import Image from "next/image";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { MAX_CHOCOLATE_QUANTITY, shoppingBag } from "@/data/chocolates";
import { useT } from "@/hooks/useLocale";
import { usePhotos } from "@/hooks/usePhotos";
import { chocolateSlot } from "@/lib/sitePhotos";

/**
 * 꽃다발 목록 맨 위 "쇼핑백 2,000원" (2026-10-12 사용자 요청).
 * 초콜릿처럼 수량만 고르고(받는 분·메시지 칸 없음) 금액은 합계에 더해진다. 모양은 ProductOption과 맞춤
 */
export default function ShoppingBagOption({
  quantity,
  onQuantityChange,
}: {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}) {
  const t = useT();
  const image = usePhotos()(chocolateSlot(shoppingBag.id)).images[0];
  const selected = quantity > 0;
  const name = t.chocolate.items.shoppingbag.name;

  return (
    <li className={`-mx-5 px-5 py-5 transition-colors ${selected ? "bg-brand-tint" : ""}`}>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-bold leading-snug text-ink">
            <span className="mr-1.5 inline-block rounded-full bg-brand px-2 py-0.5 align-middle text-[11.5px] font-bold text-white">
              {t.chocolate.bag.badge}
            </span>
            {name}
          </h3>
          <ul className="mt-2 space-y-0.5 text-[13.5px] leading-relaxed text-sub">
            {t.chocolate.bag.points.map((point) => (
              <li key={point}>- {point}</li>
            ))}
          </ul>
        </div>

        <div className="relative h-[124px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-soft">
          <Image src={image} alt={t.chocolate.photoAlt(name)} fill sizes="120px" className="object-cover" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-[17px] font-bold text-ink">{t.format.price(shoppingBag.price)}</p>
        <QuantityStepper value={quantity} max={MAX_CHOCOLATE_QUANTITY} label={name} onChange={onQuantityChange} />
      </div>
      <p className={`mt-2 text-right text-[15px] font-bold ${selected ? "text-brand-dark" : "text-faint"}`}>
        {t.format.price(shoppingBag.price * quantity)}
      </p>
    </li>
  );
}
