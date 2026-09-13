import Image from "next/image";
import { ChevronIcon } from "@/components/ui/icons";
import { productCategories } from "@/data/products";
import { formatPrice } from "@/lib/format";
import type { ProductCategoryId } from "@/types/reservation";

/** 첫 화면 입구 — 어떤 상품 종류를 예약할지 바로 고르게 함 (종류 수만큼 칸이 나뉨) */
export default function CategoryEntry({
  countByCategory,
  onSelect,
}: {
  countByCategory: Record<ProductCategoryId, number>;
  onSelect: (categoryId: ProductCategoryId) => void;
}) {
  return (
    <section aria-label="예약할 상품 종류" className="px-5 pb-2 pt-3">
      <p className="text-[15px] font-bold text-ink">무엇을 예약하시나요?</p>
      <p className="mt-0.5 text-[13px] text-sub">여러 가지를 함께 담아 한 번에 예약할 수도 있어요.</p>

      <div className="mt-3 grid auto-cols-fr grid-flow-col gap-2">
        {productCategories.map((category) => {
          const count = countByCategory[category.id];
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
                  alt={`${category.name} 예시 사진`}
                  fill
                  sizes="(max-width: 512px) 31vw, 155px"
                  className="object-cover"
                />
                {count > 0 && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
                    {count}개 담음
                  </span>
                )}
              </div>
              <div className="px-2.5 pb-2.5 pt-2">
                <p className="text-[15px] font-extrabold text-ink">{category.name}</p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-sub">{category.tagline}</p>
                <p className="mt-1.5 flex items-center justify-between gap-1 text-[12px] font-bold text-brand-dark">
                  {formatPrice(category.startingPrice)}부터
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
