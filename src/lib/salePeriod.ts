import { getCategory, productCategories, type ProductCategory } from "@/data/products";
import { ko, type Messages } from "@/i18n/ko";
import type { Now } from "@/lib/time";
import type { ProductCategoryId } from "@/types/reservation";

/**
 * 기간 한정 종류(크리스마스 식물트리 등 — data/products의 lastDate) 규칙. 화면·서버가 같이 씀.
 * 받는 날이 lastDate(포함)까지만 예약되고, 오늘(한국 시각)이 lastDate를 지나면 탭·입구 카드에서 빠진다.
 */

/** 오늘 보여줄 종류인지 — now가 없으면(서버 렌더링 중) 일단 보여줌 */
export function isCategoryOnSale(category: ProductCategory, now: Now | null) {
  return !category.lastDate || now === null || now.dateKey <= category.lastDate;
}

/** 탭·입구 카드에 보여줄 종류 */
export function getOnSaleCategories(now: Now | null) {
  return productCategories.filter((category) => isCategoryOnSale(category, now));
}

/** 그 날짜에 받을 수 있는 종류인지 */
export function isCategoryBookableOn(categoryId: ProductCategoryId, dateKey: string) {
  const lastDate = getCategory(categoryId).lastDate;
  return !lastDate || dateKey <= lastDate;
}

/** 담은 상품 중 그 날짜에 받을 수 없는 것 */
export function getOutOfSalePeriod<T extends { category: ProductCategoryId }>(items: T[], dateKey: string | null) {
  return dateKey === null ? [] : items.filter((item) => !isCategoryBookableOn(item.category, dateKey));
}

/** "2026-12-28" → [12, 28] */
export function monthDayOf(dateKey: string): [number, number] {
  const [, month, day] = dateKey.split("-").map(Number);
  return [month, day];
}

/** 상품 칸 안내 — 고른 날짜가 판매 기간 밖이면 문구, 아니면 null */
export function getSalePeriodNoticeText(categoryId: ProductCategoryId, dateKey: string | null, t: Messages = ko) {
  const lastDate = getCategory(categoryId).lastDate;
  if (!lastDate || dateKey === null || dateKey <= lastDate) return null;
  return t.salePeriod.blocked(...monthDayOf(lastDate));
}
