import type { ProductCategoryId } from "@/types/reservation";

/**
 * 특별한 날 — 달력 표시, 그날 고를 수 있는 시간, 첫 화면 안내에 쓰임.
 * 화면 문구(제목·안내)는 언어별 파일(src/i18n/ko.ts 등)의 events[kind] 에 있다.
 */
export type SpecialEvent = {
  id: string;
  /** 문구 종류 — 언어 파일 events의 키 */
  kind: "institutePromotion";
  /** 기수 (제8기 → 8) */
  term: number;
  /** "YYYY-MM-DD" */
  date: string;
  /** 이 날 고를 수 있는 시간대 (나머지 시간대는 막힘) */
  slots: string[];
  /** 추천 상품 종류 — 안내 버튼을 누르면 이 종류 목록이 열림 */
  recommendedCategory: ProductCategoryId;
  /** 무료 토퍼(이름·직급)를 넣어주는 상품 종류 — 신청서 상품 칸에 토퍼 입력칸이 생김 */
  topperCategories: ProductCategoryId[];
};

/** 지방자치인재개발원 승진식 공통 안내 */
function institutePromotion(term: number, date: string): SpecialEvent {
  return {
    id: `institute-promotion-${term}`,
    kind: "institutePromotion",
    term,
    date,
    slots: ["08:00", "09:00"],
    recommendedCategory: "basket",
    topperCategories: ["bouquet", "basket"],
  };
}

/** 날짜순. 새 승진식이 잡히면 한 줄 추가 */
export const specialEvents: SpecialEvent[] = [
  institutePromotion(8, "2026-10-08"),
  institutePromotion(9, "2026-10-30"),
];

export function getEventOn(dateKey: string): SpecialEvent | undefined {
  return specialEvents.find((event) => event.date === dateKey);
}
