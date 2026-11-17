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
  | "shoppingbag"
  | "doll-chiikawa"
  | "doll-hachiware"
  | "doll-usagi"
  | "dollset-chiikawa"
  | "dollset-hachiware"
  | "dollset-usagi";

export type Chocolate = {
  id: ChocolateId;
  price: number;
  /** public/chocolates/ 안의 사진 (쇼핑백은 public/flowers/) */
  image: string;
  /**
   * "bag" = 꽃다발 쇼핑백 (2026-10-12 사용자 요청) — 초콜릿과 같은 길(수량만, 받는 분·메시지 없음)로 저장하지만
   * 초콜릿 칸이 아니라 꽃다발 목록 맨 위에 보인다.
   * "doll" = 치이카와 인형 단품 (2026-11-17 사용자 요청) — 초콜릿 칸 안 초콜릿 아래에 같이 보인다.
   * 없으면 초콜릿
   */
  kind?: "bag" | "doll";
};

/** 화면에 보이는 순서 (금액 낮은 것부터, 10개 묶음은 뒤에) */
export const chocolates = [
  { id: "happyhippo-1", price: 1500, image: "/chocolates/happyhippo-1-01.jpg" },
  { id: "ferrero-1", price: 3000, image: "/chocolates/ferrero-1-01.jpg" },
  { id: "kinderjoy-1", price: 3000, image: "/chocolates/kinderjoy-1-01.jpg" },
  { id: "happyhippo-10", price: 15000, image: "/chocolates/happyhippo-10-01.jpg" },
  { id: "ferrero-10", price: 30000, image: "/chocolates/ferrero-10-01.jpg" },
  { id: "shoppingbag", price: 2000, image: "/flowers/shoppingbag-2000-01.jpg", kind: "bag" },
  { id: "doll-chiikawa", price: 8000, image: "/chocolates/doll-chiikawa-01.jpg", kind: "doll" },
  { id: "doll-hachiware", price: 8000, image: "/chocolates/doll-hachiware-01.jpg", kind: "doll" },
  { id: "doll-usagi", price: 8000, image: "/chocolates/doll-usagi-01.jpg", kind: "doll" },
  // 뜨개꽃 하트 2개 + 인형 세트 (2026-11-17 사용자 요청, 2만원 — 인형 단품 아래에 같이 보임). 사진은 매장 꽃다발 사진에서 인형·하트만 확대
  { id: "dollset-chiikawa", price: 20000, image: "/chocolates/dollset-chiikawa-02.jpg", kind: "doll" },
  { id: "dollset-hachiware", price: 20000, image: "/chocolates/dollset-hachiware-02.jpg", kind: "doll" },
  { id: "dollset-usagi", price: 20000, image: "/chocolates/dollset-usagi-02.jpg", kind: "doll" },
] as const satisfies readonly Chocolate[];

const kindOf = (chocolate: Chocolate) => chocolate.kind;

/** 초콜릿만 (쇼핑백·인형 제외) — 초콜릿 칸·"초콜릿·인형도 함께?" 창 위쪽 */
export const chocolateChoices: readonly Chocolate[] = chocolates.filter((chocolate) => kindOf(chocolate) === undefined);

/** 초콜릿 칸·"함께?" 창 안 초콜릿 아래에 보이는 인형 단품 */
export const dollChoices: readonly Chocolate[] = chocolates.filter((chocolate) => kindOf(chocolate) === "doll");

/** 꽃다발 목록 맨 위에 보이는 쇼핑백 */
export const shoppingBag: Chocolate = chocolates.find((chocolate) => kindOf(chocolate) === "bag")!;

/** 매장용 표시 앞 그림글자 — 쇼핑백 🛍️, 인형 🧸, 초콜릿 🍫 */
export function getAddOnIcon(id: string) {
  const kind = getChocolate(id)?.kind;
  return kind === "bag" ? "🛍️" : kind === "doll" ? "🧸" : "🍫";
}

/** 초콜릿 한 종류당 최대 수량 */
export const MAX_CHOCOLATE_QUANTITY = 20;

export function getChocolate(id: string): Chocolate | undefined {
  return (chocolates as readonly Chocolate[]).find((chocolate) => chocolate.id === id);
}
