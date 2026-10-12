/**
 * 꽃과 함께 더하는 초콜릿 (2026-10-12 사용자 요청 — 네이버 예약의 초콜릿 옵션과 같은 금액).
 * 화면에 보이는 이름·설명은 언어별 파일(src/i18n/ko.ts 등)의 chocolate.items 에 있다 —
 * 종류를 추가하면 타입 오류가 각 언어 파일의 빠진 곳을 알려준다.
 */
export type ChocolateId = "happyhippo-1" | "ferrero-1" | "kinderjoy-1" | "happyhippo-10" | "ferrero-10";

export type Chocolate = {
  id: ChocolateId;
  price: number;
  /** public/chocolates/ 안의 사진 */
  image: string;
};

/** 화면에 보이는 순서 (금액 낮은 것부터, 10개 묶음은 뒤에) */
export const chocolates = [
  { id: "happyhippo-1", price: 1500, image: "/chocolates/happyhippo-1-01.jpg" },
  { id: "ferrero-1", price: 3000, image: "/chocolates/ferrero-1-01.jpg" },
  { id: "kinderjoy-1", price: 3000, image: "/chocolates/kinderjoy-1-01.jpg" },
  { id: "happyhippo-10", price: 15000, image: "/chocolates/happyhippo-10-01.jpg" },
  { id: "ferrero-10", price: 30000, image: "/chocolates/ferrero-10-01.jpg" },
] as const satisfies readonly Chocolate[];

/** 초콜릿 한 종류당 최대 수량 */
export const MAX_CHOCOLATE_QUANTITY = 20;

export function getChocolate(id: string): Chocolate | undefined {
  return chocolates.find((chocolate) => chocolate.id === id);
}
