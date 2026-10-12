/**
 * 꽃과 함께 더하는 초콜릿 (2026-10-12 사용자 요청 — 네이버 예약의 초콜릿 옵션과 같은 금액).
 * 화면에 보이는 이름·설명은 언어별 파일(src/i18n/ko.ts 등)의 chocolate.items 에 있다 —
 * 종류를 추가하면 타입 오류가 각 언어 파일의 빠진 곳을 알려준다.
 */
export type ChocolateId =
  | "happyhippo-1"
  | "ferrero-1"
  | "kinderjoy-1"
  | "happyhippo-10"
  | "ferrero-10"
  | "shoppingbag";

export type Chocolate = {
  id: ChocolateId;
  price: number;
  /** public/chocolates/ 안의 사진 (쇼핑백은 public/flowers/) */
  image: string;
  /**
   * "bag" = 꽃다발 쇼핑백 (2026-10-12 사용자 요청) — 초콜릿과 같은 길(수량만, 받는 분·메시지 없음)로 저장하지만
   * 초콜릿 칸이 아니라 꽃다발 목록 맨 위에 보인다. 없으면 초콜릿
   */
  kind?: "bag";
};

/** 화면에 보이는 순서 (금액 낮은 것부터, 10개 묶음은 뒤에) */
export const chocolates = [
  { id: "happyhippo-1", price: 1500, image: "/chocolates/happyhippo-1-01.jpg" },
  { id: "ferrero-1", price: 3000, image: "/chocolates/ferrero-1-01.jpg" },
  { id: "kinderjoy-1", price: 3000, image: "/chocolates/kinderjoy-1-01.jpg" },
  { id: "happyhippo-10", price: 15000, image: "/chocolates/happyhippo-10-01.jpg" },
  { id: "ferrero-10", price: 30000, image: "/chocolates/ferrero-10-01.jpg" },
  { id: "shoppingbag", price: 2000, image: "/flowers/shoppingbag-2000-01.jpg", kind: "bag" },
] as const satisfies readonly Chocolate[];

/** 초콜릿 칸·"초콜릿도 함께?" 창에 보이는 것 (쇼핑백 제외) */
export const chocolateChoices: readonly Chocolate[] = chocolates.filter((chocolate) => !("kind" in chocolate));

/** 꽃다발 목록 맨 위에 보이는 쇼핑백 */
export const shoppingBag: Chocolate = chocolates.find((chocolate) => "kind" in chocolate)!;

/** 매장용 표시 앞 그림글자 — 쇼핑백 🛍️, 초콜릿 🍫 */
export function getAddOnIcon(id: string) {
  return id === shoppingBag.id ? "🛍️" : "🍫";
}

/** 초콜릿 한 종류당 최대 수량 */
export const MAX_CHOCOLATE_QUANTITY = 20;

export function getChocolate(id: string): Chocolate | undefined {
  return chocolates.find((chocolate) => chocolate.id === id);
}
