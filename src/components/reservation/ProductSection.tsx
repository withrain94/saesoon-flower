"use client";

import { useState } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { ChevronIcon, GridIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  categoryNames,
  getCategory,
  getNextCategory,
  productCategories,
  sortProductsByRank,
} from "@/data/products";
import { siteLinksByCategory } from "@/data/shop";
import { formatPrice } from "@/lib/format";
import type { ProductCategoryId, Selection } from "@/types/reservation";
import CategoryNotice from "./CategoryNotice";
import ProductOption from "./ProductOption";
import { scrollToSection, SECTION, sectionScrollMargin } from "./sections";

type SortKey = "price" | "rank";

const sortTabs: { key: SortKey; label: string }[] = [
  { key: "price", label: "금액순" },
  { key: "rank", label: "인기순" },
];

export default function ProductSection({
  categoryId,
  onCategoryChange,
  quantities,
  countByCategory,
  onQuantityChange,
  showError,
}: {
  /** 지금 보고 있는 상품 종류 (첫 화면 입구 카드와 공유) */
  categoryId: ProductCategoryId;
  onCategoryChange: (categoryId: ProductCategoryId) => void;
  quantities: Selection["quantities"];
  countByCategory: Record<ProductCategoryId, number>;
  onQuantityChange: (productId: string, quantity: number) => void;
  showError: boolean;
}) {
  const [sort, setSort] = useState<SortKey>("price");
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  const category = getCategory(categoryId);
  const nextCategory = getNextCategory(categoryId);
  const canSort = category.products.length > 1;
  const products =
    canSort && sort === "rank" ? sortProductsByRank(category.products) : category.products;

  return (
    <section id={SECTION.items} className={`${sectionScrollMargin} px-5 pb-2 pt-4`}>
      <SectionHeading icon={<GridIcon />}>예약할 상품을 골라주세요</SectionHeading>
      <p className="mt-1.5 text-sm text-sub">
        {categoryNames} 모두 함께 담아 한 번에 예약할 수 있어요.
      </p>
      {showError && <ErrorText>상품을 1개 이상 담아주세요.</ErrorText>}

      <div role="tablist" aria-label="상품 종류" className="mt-4 grid auto-cols-fr grid-flow-col gap-2">
        {productCategories.map((item) => {
          const active = item.id === categoryId;
          const count = countByCategory[item.id];
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCategoryChange(item.id)}
              className={`flex h-12 items-center justify-center gap-1.5 rounded-xl border text-[15px] font-bold transition ${
                active
                  ? "border-brand bg-brand text-white"
                  : "border-field bg-white text-body hover:border-brand"
              }`}
            >
              {item.name}
              {count > 0 && (
                <span
                  className={`min-w-5 rounded-full px-1.5 text-[12px] leading-5 ${
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

      {category.notice && <CategoryNotice lines={category.notice} />}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-sub">{category.popularNote}</p>
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
      <p className="mt-1 text-[12px] text-faint">
        * 사진과 동일하게 제작은 어려워요. 색감과 크기 참고용으로 봐주세요.
      </p>
      <a
        href={siteLinksByCategory[category.id]}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex items-center justify-between rounded-xl border border-line bg-soft px-4 py-3 transition hover:border-brand"
      >
        <span>
          <span className="block text-[14px] font-bold text-ink">
            📷 {category.name} 사진·설명 더 보기
          </span>
          <span className="block text-[12px] text-sub">새순 소개 사이트에서 실제 제작 사례를 볼 수 있어요</span>
        </span>
        <ChevronIcon direction="right" className="h-4 w-4 shrink-0 text-sub" />
      </a>

      <ul role="tabpanel" aria-label={`${category.name} 목록`} className="mt-1 divide-y divide-line">
        {products.map((product) => (
          <ProductOption
            key={product.id}
            product={product}
            categoryName={category.name}
            quantity={quantities[product.id] ?? 0}
            onQuantityChange={(quantity) => onQuantityChange(product.id, quantity)}
            photosOpen={openProductId === product.id}
            onTogglePhotos={() =>
              setOpenProductId((current) => (current === product.id ? null : product.id))
            }
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
          className="mb-4 mt-1 flex w-full items-center justify-between rounded-xl border border-brand bg-brand-tint px-4 py-3.5 text-left transition hover:bg-white"
        >
          <span>
            <span className="block text-[15px] font-bold text-brand-dark">
              {nextCategory.name}도 보러 가기
            </span>
            <span className="text-[12px] text-sub">
              {nextCategory.tagline} · {formatPrice(nextCategory.startingPrice)}부터
            </span>
          </span>
          <ChevronIcon direction="right" className="h-5 w-5 text-brand-dark" />
        </button>
      )}
    </section>
  );
}
