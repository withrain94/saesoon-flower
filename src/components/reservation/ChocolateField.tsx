import Image from "next/image";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { chocolateChoices, MAX_CHOCOLATE_QUANTITY, type ChocolateId } from "@/data/chocolates";
import { useT } from "@/hooks/useLocale";
import { usePhotos } from "@/hooks/usePhotos";
import { chocolateSlot } from "@/lib/sitePhotos";

/**
 * 신청서 "🍫 초콜릿 추가" — 꽃과 함께 보낼 초콜릿을 수량으로 고른다 (2026-10-12 사용자 요청).
 * 받는 분·메시지 칸은 없고, 고른 금액은 합계에 바로 더해진다.
 */
export default function ChocolateField({
  quantities,
  onChange,
  withHeading = true,
}: {
  /** 초콜릿 id → 수량 */
  quantities: Record<string, number>;
  onChange: (chocolateId: string, quantity: number) => void;
  /** 물어보는 창 안에서는 제목을 창이 이미 보여주므로 끔 */
  withHeading?: boolean;
}) {
  const t = useT();
  const photos = usePhotos();

  return (
    <div>
      {withHeading && (
        <>
          <p className="text-[15px] font-bold text-ink">
            <span aria-hidden="true">🍫 </span>
            {t.chocolate.title} <span className="text-[13px] font-normal text-sub">({t.common.optional})</span>
          </p>
          <p className="mt-0.5 text-[13px] text-sub">{t.chocolate.description}</p>
        </>
      )}

      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
        {chocolateChoices.map((chocolate) => {
          const quantity = quantities[chocolate.id] ?? 0;
          const copy = t.chocolate.items[chocolate.id as ChocolateId];
          return (
            <li
              key={chocolate.id}
              className={`flex items-center gap-3 px-3 py-3 transition-colors ${quantity > 0 ? "bg-brand-tint" : ""}`}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-soft">
                <Image
                  src={photos(chocolateSlot(chocolate.id)).images[0]}
                  alt={t.chocolate.photoAlt(copy.name)}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold leading-snug text-ink">{copy.name}</p>
                {copy.note && <p className="mt-0.5 text-[12.5px] leading-snug text-sub">{copy.note}</p>}
                <p className="mt-1 text-[14px] font-bold text-ink">{t.format.price(chocolate.price)}</p>
              </div>

              <QuantityStepper
                value={quantity}
                max={MAX_CHOCOLATE_QUANTITY}
                label={copy.name}
                onChange={(next) => onChange(chocolate.id, next)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
