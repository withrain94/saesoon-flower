import type { ProductCategoryId } from "@/types/reservation";

/** 특별한 날 — 달력 표시, 그날 고를 수 있는 시간, 첫 화면 안내에 쓰임 */
export type SpecialEvent = {
  id: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** 달력 날짜 아래 짧은 표시 */
  calendarLabel: string;
  /** "제8기 승진식" — 요약·버튼용 짧은 이름 */
  shortTitle: string;
  /** "지방자치인재개발원 제8기 승진식" */
  title: string;
  /** 이 날 고를 수 있는 시간대 (나머지 시간대는 막힘) */
  slots: string[];
  /** 추천 상품 종류 — 안내 버튼을 누르면 이 종류 목록이 열림 */
  recommendedCategory: ProductCategoryId;
  /** 안내 문구 (예약 마감 시각은 자동으로 붙음) */
  highlights: string[];
};

/** 지방자치인재개발원 승진식 공통 안내 */
function institutePromotion(term: number, date: string): SpecialEvent {
  return {
    id: `institute-promotion-${term}`,
    date,
    calendarLabel: "승진식",
    shortTitle: `제${term}기 승진식`,
    title: `지방자치인재개발원 제${term}기 승진식`,
    slots: ["08:00", "09:00"],
    recommendedCategory: "basket",
    highlights: [
      "전국에서 완주로 모이는 자리라 멀리서 오신 분들이 많아 꽃바구니 선호도가 높아요.",
      "무료 승진 토퍼를 함께 제공해 드려요.",
      "받으실 시간은 오전 8시·9시 중에서 골라주세요.",
    ],
  };
}

/** 날짜순. 새 승진식이 잡히면 한 줄 추가 */
export const specialEvents: SpecialEvent[] = [
  institutePromotion(8, "2026-10-08"),
  institutePromotion(9, "2026-10-26"),
];

export function getEventOn(dateKey: string): SpecialEvent | undefined {
  return specialEvents.find((event) => event.date === dateKey);
}
