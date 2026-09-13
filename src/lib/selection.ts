import { getEventOn } from "@/data/events";
import { allProducts, getCategory, productCategories, type Product } from "@/data/products";
import { MAX_QUANTITY } from "@/data/reservationOptions";
import { formatDateLabel } from "@/lib/date";
import { formatTimeLabel, isSlotBookable, type Now } from "@/lib/time";
import type { ProductCategoryId, Selection, SelectionIssue } from "@/types/reservation";

export const emptySelection: Selection = { quantities: {}, date: null, time: null };

export type OrderItem = {
  product: Product;
  quantity: number;
};

export type SelectionSummary = {
  /** 담은 상품 (꽃다발 → 꽃바구니, 금액순) */
  items: OrderItem[];
  /** 종류별 담은 개수 — 탭 배지용 */
  countByCategory: Record<ProductCategoryId, number>;
  /** "9. 16(수) · 오후 3:00" (선택된 부분만, 없으면 ""). 특별한 날이면 뒤에 "· 제8기 승진식" */
  scheduleLabel: string;
  totalQuantity: number;
  totalPrice: number;
};

/** 0 ~ MAX_QUANTITY 범위의 정수로 보정 */
export function clampQuantity(quantity: number) {
  return Math.min(MAX_QUANTITY, Math.max(0, Math.floor(quantity)));
}

/** 수량을 바꾼 새 quantities (0이면 항목 제거) */
export function withQuantity(quantities: Selection["quantities"], productId: string, quantity: number) {
  const next = { ...quantities };
  const clamped = clampQuantity(quantity);
  if (clamped === 0) delete next[productId];
  else next[productId] = clamped;
  return next;
}

/** 수량이 1개 이상인 상품 */
export function getOrderItems(selection: Selection): OrderItem[] {
  return allProducts
    .map((product) => ({ product, quantity: selection.quantities[product.id] ?? 0 }))
    .filter((item) => item.quantity > 0);
}

/** 신청서에 "원하는 색감" 칸이 필요한지 — 아무것도 안 담았거나, 색감을 고르는 상품이 있을 때 */
export function needsColorChoice(items: OrderItem[]) {
  return items.length === 0 || items.some((item) => getCategory(item.product.category).colorChoice);
}

/** "꽃다발 6만원" */
export function getItemName(product: Product) {
  return `${getCategory(product.category).name} ${product.label}`;
}

/** 선택한 날짜·시간이 지금 기준으로 예약 가능한지 (now가 없으면 검사 생략) */
export function isScheduleBookable(selection: Selection, now: Now | null) {
  if (now === null || selection.date === null || selection.time === null) return true;
  return isSlotBookable(selection.time, selection.date, now);
}

/** 가장 먼저 채워야 할 항목. 모두 선택됐으면 null */
export function getSelectionIssue(selection: Selection, now: Now | null): SelectionIssue | null {
  if (getOrderItems(selection).length === 0) return "items";
  if (selection.date === null) return "date";
  if (selection.time === null || !isScheduleBookable(selection, now)) return "time";
  return null;
}

export function summarizeSelection(selection: Selection): SelectionSummary {
  const items = getOrderItems(selection);

  const countByCategory = Object.fromEntries(
    productCategories.map((category) => [
      category.id,
      items
        .filter((item) => item.product.category === category.id)
        .reduce((sum, item) => sum + item.quantity, 0),
    ]),
  ) as Record<ProductCategoryId, number>;

  return {
    items,
    countByCategory,
    scheduleLabel: [
      selection.date && formatDateLabel(selection.date),
      selection.time && formatTimeLabel(selection.time),
      selection.date && getEventOn(selection.date)?.shortTitle,
    ]
      .filter(Boolean)
      .join(" · "),
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  };
}
