import Image from "next/image";
import { ChevronIcon } from "@/components/ui/icons";
import { useT } from "@/hooks/useLocale";
import { usePhotos } from "@/hooks/usePhotos";
import { getOnSaleCategories } from "@/lib/salePeriod";
import { thumbnailSlot } from "@/lib/sitePhotos";
import type { Now } from "@/lib/time";
import type { ProductCategoryId } from "@/types/reservation";

/** 첫 화면 입구 — 어떤 상품 종류를 예약할지 바로 고르게 함 (한 줄에 2개씩) */
export default function CategoryEntry({
  countByCategory,
  onSelect,
  now,
}: {
  countByCategory: Record<ProductCategoryId, number>;
  onSelect: (categoryId: ProductCategoryId) => void;
  /** 기간 한정 종류(크리스마스 식물트리 등)는 기간이 지나면 빠짐 */
  now: Now | null;
}) {
  const t = useT();
  const photos = usePhotos();

  return (
    <section aria-label={t.categoryEntry.ariaLabel} className="px-5 pb-2 pt-3">
      <p className="text-[15px] font-bold text-ink">{t.categoryEntry.title}</p>
      <p className="mt-0.5 text-[13px] text-sub">{t.categoryEntry.subtitle}</p>

      {/* 종류가 4개(치이카와 꽃다발 추가, 2026-11-17)라 휴대폰에서도 보기 좋게 2×2 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {getOnSaleCategories(now).map((category) => {
          const count = countByCategory[category.id];
          const copy = t.categories[category.id];
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className="group overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm transition hover:border-brand active:scale-[0.99]"
            >
              <div className="relative aspect-[4/3] bg-soft">
                <Image
                  src={photos(thumbnailSlot(category.id)).images[0]}
                  alt={t.categoryEntry.photoAlt(copy.name)}
                  fill
                  sizes="(max-width: 512px) 46vw, 236px"
                  className="object-cover"
                />
                {count > 0 && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
                    {t.categoryEntry.count(count)}
                  </span>
                )}
              </div>
              <div className="px-2.5 pb-2.5 pt-2">
                <p className="text-[15px] font-extrabold text-ink">{copy.name}</p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-sub">{copy.tagline}</p>
                <p className="mt-1.5 flex items-center justify-between gap-1 text-[12px] font-bold text-brand-dark">
                  {t.categoryEntry.startingFrom(t.format.price(category.startingPrice))}
                  <ChevronIcon direction="right" className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
