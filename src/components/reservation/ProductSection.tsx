"use client";

import { useState } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { ChevronIcon, GridIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import { shoppingBag } from "@/data/chocolates";
import { getCategory, sortProductsByRank } from "@/data/products";
import { siteLinksByCategory } from "@/data/shop";
import { useT } from "@/hooks/useLocale";
import { getMinPriceNoticeText } from "@/lib/minPrice";
import { getOnSaleCategories, getSalePeriodNoticeText } from "@/lib/salePeriod";
import { getCategoryNames, getItemName, getPopularNote } from "@/lib/selection";
import type { Now } from "@/lib/time";
import type { ProductCategoryId, Selection } from "@/types/reservation";
import CategoryNotice from "./CategoryNotice";
import ProductOption from "./ProductOption";
import ProductPhotos from "./ProductPhotos";
import ShoppingBagOption from "./ShoppingBagOption";
import { scrollToSection, SECTION, sectionScrollMargin } from "./sections";

type SortKey = "price" | "rank";

export default function ProductSection({
  categoryId,
  onCategoryChange,
  quantities,
  countByCategory,
  onQuantityChange,
  addOnQuantities,
  onAddOnChange,
  showError,
  date,
  now,
  priceConflict,
}: {
  /** 지금 보고 있는 상품 종류 (첫 화면 입구 카드와 공유) */
  categoryId: ProductCategoryId;
  onCategoryChange: (categoryId: ProductCategoryId) => void;
  quantities: Selection["quantities"];
  countByCategory: Record<ProductCategoryId, number>;
  onQuantityChange: (productId: string, quantity: number) => void;
  /** 쇼핑백·초콜릿 id → 수량 (꽃다발 목록 맨 위 쇼핑백 칸용) */
  addOnQuantities: Record<string, number>;
  onAddOnChange: (addOnId: string, quantity: number) => void;
  showError: boolean;
  /** 고른 받는 날짜 — 졸업시즌 등 최소 금액 안내용 */
  date: string | null;
  now: Now | null;
  /** 담은 상품이 고른 날짜에 안 될 때 안내 (바로 보여줌) */
  priceConflict: string | null;
}) {
  const t = useT();
  const [sort, setSort] = useState<SortKey>("price");
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  const category = getCategory(categoryId);
  const copy = t.categories[categoryId];
  // 기간 한정 종류(크리스마스 식물트리 등)는 기간이 지나면 탭에서 빠짐
  const visibleCategories = getOnSaleCategories(now);
  const siteLink = siteLinksByCategory[categoryId];
  const nextCategory =
    visibleCategories[(visibleCategories.findIndex((item) => item.id === categoryId) + 1) % visibleCategories.length];
  const canSort = category.products.length > 1;
  const products =
    canSort && sort === "rank" ? sortProductsByRank(category.products) : category.products;
  // 상품이 하나뿐인 종류(호접난)는 사진을 먼저 크게
  const featuredProduct = category.featured ? category.products[0] : undefined;

  /** 상품 칸 안내 — 기간 한정 상품은 판매 기간, 나머지는 졸업시즌 등 최소 금액 */
  function productDateNotice(product: (typeof products)[number]) {
    const periodText = getSalePeriodNoticeText(product.category, date, t);
    if (periodText) return { kind: "blocked" as const, text: periodText };
    return category.minPriceExempt ? null : getMinPriceNoticeText(product.price, date, now, t);
  }

  const sortTabs: { key: SortKey; label: string }[] = [
    { key: "price", label: t.productSection.sortPrice },
    { key: "rank", label: t.productSection.sortRank },
  ];

  return (
    <section id={SECTION.items} className={`${sectionScrollMargin} px-5 pb-2 pt-4`}>
      <SectionHeading icon={<GridIcon />}>{t.productSection.heading}</SectionHeading>
      <p className="mt-1.5 text-sm text-sub">{t.productSection.subtitle(getCategoryNames(t))}</p>
      {showError && <ErrorText>{t.productSection.error}</ErrorText>}
      {priceConflict && <ErrorText>⚠️ {priceConflict}</ErrorText>}

      <div role="tablist" aria-label={t.productSection.tabsAria} className={`mt-4 grid gap-2 ${visibleCategories.length > 4 ? "grid-cols-3" : "auto-cols-fr grid-flow-col"}`}
      >
        {visibleCategories.map((item) => {
          const active = item.id === categoryId;
          const count = countByCategory[item.id];
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCategoryChange(item.id)}
              className={`flex min-h-12 flex-wrap items-center justify-center gap-x-1 gap-y-0.5 rounded-xl border px-0.5 py-1.5 text-center text-[14px] font-bold leading-tight transition ${
                active
                  ? "border-brand bg-brand text-white"
                  : "border-field bg-white text-body hover:border-brand"
              }`}
            >
              {/* 종류가 많아(4개면 한 줄, 5개 이상이면 3칸씩) 이름이 글자 중간에서 줄바꿈되지 않게 — 띄어쓰기에서만 (개수 표시는 넘치면 아랫줄로) */}
              <span className="break-keep">{t.categories[item.id].name}</span>
              {count > 0 && (
                <span
                  className={`min-w-5 shrink-0 rounded-full px-1.5 text-[12px] leading-5 ${
                    active ? "bg-white text-brand-dark" : "bg-brand text-white"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {featuredProduct && (
        <ProductPhotos product={featuredProduct} itemName={getItemName(featuredProduct, t)} large />
      )}

      {copy.notice && <CategoryNotice key={categoryId} notice={copy.notice} />}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-sub">{getPopularNote(category, t)}</p>
        {canSort && (
          <div className="flex gap-1.5">
            {sortTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                aria-pressed={sort === tab.key}
                onClick={() => setSort(tab.key)}
                className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                  sort === tab.key ? "bg-strong text-white" : "border border-line bg-white text-body"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="mt-1 text-[12px] text-faint">{t.productSection.photoNote}</p>
      {siteLink && (
        <a
          href={siteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-line bg-soft px-4 py-3 transition hover:border-brand"
        >
          <span>
            <span className="block text-[14px] font-bold text-ink">{t.productSection.moreSite(copy.name)}</span>
            <span className="block text-[12px] text-sub">{t.productSection.moreSiteSub}</span>
          </span>
          <ChevronIcon direction="right" className="h-4 w-4 shrink-0 text-sub" />
        </a>
      )}

      <ul role="tabpanel" aria-label={t.productSection.listAria(copy.name)} className="mt-1 divide-y divide-line">
        {categoryId === "bouquet" && (
          <ShoppingBagOption
            quantity={addOnQuantities[shoppingBag.id] ?? 0}
            onQuantityChange={(quantity) => onAddOnChange(shoppingBag.id, quantity)}
          />
        )}
        {products.map((product) => (
          <ProductOption
            key={product.id}
            product={product}
            quantity={quantities[product.id] ?? 0}
            onQuantityChange={(quantity) => onQuantityChange(product.id, quantity)}
            photosOpen={openProductId === product.id}
            onTogglePhotos={() =>
              setOpenProductId((current) => (current === product.id ? null : product.id))
            }
            featured={product === featuredProduct}
            priceNotice={productDateNotice(product)}
          />
        ))}
      </ul>

      {nextCategory.id !== categoryId && (
        <button
          type="button"
          onClick={() => {
            // 목록 끝에서 누르므로 새 목록의 처음으로 이동
            onCategoryChange(nextCategory.id);
            scrollToSection(SECTION.items);
          }}
          className="mb-4 mt-1 flex w-full items-center justify-between gap-2 rounded-xl border border-brand bg-brand-tint px-4 py-3.5 text-left transition hover:bg-white"
        >
          <span>
            <span className="block text-[15px] font-bold text-brand-dark">
              {t.productSection.nextCategory(t.categories[nextCategory.id].name)}
            </span>
            <span className="text-[12px] text-sub">
              {t.categories[nextCategory.id].tagline} ·{" "}
              {t.categoryEntry.startingFrom(t.format.price(nextCategory.startingPrice))}
            </span>
          </span>
          <ChevronIcon direction="right" className="h-5 w-5 shrink-0 text-brand-dark" />
        </button>
      )}
    </section>
  );
}
