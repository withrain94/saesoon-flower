import Image from "next/image";
import { ChevronIcon } from "@/components/ui/icons";
import { productCategories } from "@/data/products";
import { useT } from "@/hooks/useLocale";
import type { ProductCategoryId } from "@/types/reservation";

/** 첫 화면 입구 — 어떤 상품 종류를 예약할지 바로 고르게 함 (종류 수만큼 칸이 나뉨) */
export default function CategoryEntry({
  countByCategory,
  onSelect,
}: {
  countByCategory: Record<ProductCategoryId, number>;
  onSelect: (categoryId: ProductCategoryId) => void;
}) {
  const t = useT();

  return (
    <section aria-label={t.categoryEntry.ariaLabel} className="px-5 pb-2 pt-3">
      <p className="text-[15px] font-bold text-ink">{t.categoryEntry.title}</p>
      <p className="mt-0.5 text-[13px] text-sub">{t.categoryEntry.subtitle}</p>

      <div className="mt-3 grid auto-cols-fr grid-flow-col gap-2">
        {productCategories.map((category) => {
          const count = countByCategory[category.id];
          const copy = t.categories[category.id];
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className="group overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm transition hover:border-brand active:scale-[0.99]"
            >
              <div className="relative aspect-square bg-soft">
                <Image
                  src={category.thumbnail}
                  alt={t.categoryEntry.photoAlt(copy.name)}
                  fill
                  sizes="(max-width: 512px) 31vw, 155px"
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
