import { getCategory } from "@/data/products";
import { minPricePeriods, type MinPricePeriod } from "@/data/reservationOptions";
import { ko, type Messages } from "@/i18n/ko";
import type { Now } from "@/lib/time";
import type { ProductCategoryId } from "@/types/reservation";

/**
 * 바쁜 시기(졸업시즌 등) 최소 금액 규칙 — 화면(상품·날짜)과 서버 검사가 같이 씀.
 * 기준은 **꽃 받는 날짜**. 날짜 키는 "YYYY-MM-DD"라 글자 비교로 앞뒤를 잴 수 있음.
 */

/** 그 날짜에 걸리는 기간 (없으면 undefined) */
export function getMinPricePeriodOn(dateKey: string): MinPricePeriod | undefined {
  return minPricePeriods.find((period) => period.start <= dateKey && dateKey <= period.end);
}

/** 이 금액의 꽃 상품을 그 날짜에 받을 수 있는지 */
export function isPriceBookableOn(price: number, dateKey: string) {
  const period = getMinPricePeriodOn(dateKey);
  return !period || price >= period.minPrice;
}

/** 담은 상품 중 그 날짜에 안 되는 것 */
/** 담은 상품 중 그 날짜에 안 되는 것 — 크리스마스 식물트리처럼 빠지는 종류(minPriceExempt)는 제외 */
export function getBlockedByMinPrice<T extends { price: number; category: ProductCategoryId }>(
  items: T[],
  dateKey: string | null,
) {
  if (dateKey === null) return [];
  return items.filter((item) => !getCategory(item.category).minPriceExempt && !isPriceBookableOn(item.price, dateKey));
}

/**
 * 상품 칸에 붙일 안내 — 날짜를 골랐으면 그날 기준("blocked"), 안 골랐으면 아직 안 끝난 기간 중 걸리는 것("upcoming").
 * 해당 없으면 null.
 */
export function getMinPriceNotice(
  price: number,
  dateKey: string | null,
  now: Now | null,
): { kind: "blocked" | "upcoming"; period: MinPricePeriod } | null {
  if (dateKey !== null) {
    const period = getMinPricePeriodOn(dateKey);
    return period && price < period.minPrice ? { kind: "blocked", period } : null;
  }
  if (now === null) return null;
  const period = minPricePeriods.find((item) => item.end >= now.dateKey && price < item.minPrice);
  return period ? { kind: "upcoming", period } : null;
}

/** "졸업시즌(12/23~2/26)" 같은 기간 이름 */
export function describeMinPricePeriod(period: MinPricePeriod, t: Messages = ko) {
  const [, sm, sd] = period.start.split("-").map(Number);
  const [, em, ed] = period.end.split("-").map(Number);
  return t.minPrice.period(t.minPrice.names[period.id], sm, sd, em, ed);
}

/** 상품 칸 안내 문구 (해당 없으면 null) */
export function getMinPriceNoticeText(price: number, dateKey: string | null, now: Now | null, t: Messages = ko) {
  const notice = getMinPriceNotice(price, dateKey, now);
  if (!notice) return null;
  const args = [describeMinPricePeriod(notice.period, t), t.format.price(notice.period.minPrice)] as const;
  return { kind: notice.kind, text: notice.kind === "blocked" ? t.minPrice.blocked(...args) : t.minPrice.upcoming(...args) };
}
