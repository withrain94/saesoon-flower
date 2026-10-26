import { allSlots } from "@/data/reservationOptions";
import type { ProductCategoryId } from "@/types/reservation";

/** 특별한 날 종류 — 언어 파일 events의 키 */
export type EventKind = "institutePromotion" | "instituteLongCourse" | "pepero" | "christmasEve" | "christmas";

/**
 * 특별한 날 — 달력 표시, 그날 고를 수 있는 시간, 첫 화면 안내에 쓰임.
 * 첫 화면 안내는 예약 마감(전날 오후 5시)이 지나면 자동으로 빠지고 다음 일정이 나옴 (lib/events의 getOpenEvents).
 * 화면 문구(제목·안내·토퍼 제목)는 언어별 파일(src/i18n/ko.ts 등)의 events[kind] 에 있다.
 */
export type SpecialEvent = {
  id: string;
  kind: EventKind;
  /** 안내 앞에 붙는 그림글자 */
  icon: string;
  /** 기수 (제8기 → 8). 기수가 없는 행사는 0 */
  term: number;
  /** "YYYY-MM-DD" */
  date: string;
  /** 이 날 고를 수 있는 시간대 (나머지 시간대는 막힘) */
  slots: string[];
  /** 추천 상품 종류 — 안내 버튼을 누르면 이 종류 목록이 열림 */
  recommendedCategory: ProductCategoryId;
  /** 첫 화면 안내에 "○○ 예약하기" 버튼을 만들 상품 종류 */
  bannerCategories: ProductCategoryId[];
  /** 무료 토퍼를 넣어주는 상품 종류 — "행사 꽃이에요"를 고르면 상품 칸에 토퍼 입력칸이 생김 */
  topperCategories: ProductCategoryId[];
};

/** 지방자치인재개발원 승진식 — 토퍼: 보내는 분 이름 또는 팀 이름 한 칸 */
function institutePromotion(term: number, date: string): SpecialEvent {
  return {
    id: `institute-promotion-${term}`,
    kind: "institutePromotion",
    icon: "🎓",
    term,
    date,
    slots: ["08:00"],
    recommendedCategory: "basket",
    bannerCategories: ["bouquet", "basket"],
    topperCategories: ["bouquet", "basket"],
  };
}

/** 지방자치인재개발원 장기과정 수료식 — 토퍼: 보내는 분 이름 또는 팀 이름 (수료 과정은 매장에서 확인) */
function instituteLongCourse(date: string): SpecialEvent {
  return {
    id: `institute-long-course-${date}`,
    kind: "instituteLongCourse",
    icon: "🎓",
    term: 0,
    date,
    slots: ["08:00"],
    recommendedCategory: "basket",
    bannerCategories: ["bouquet", "basket"],
    topperCategories: ["bouquet", "basket"],
  };
}

/**
 * 빼빼로데이 (11월 11일) — 2026-10-12 사용자 요청.
 * 승진식과 달리 시간·마감은 평소와 같고(하루 종일 선택 가능) 토퍼도 없다. 첫 화면 안내만 띄운다.
 */
function pepero(date: string): SpecialEvent {
  return {
    id: `pepero-${date}`,
    kind: "pepero",
    icon: "🍫",
    term: 0,
    date,
    slots: allSlots,
    recommendedCategory: "bouquet",
    bannerCategories: ["bouquet", "basket"],
    topperCategories: [],
  };
}

/**
 * 크리스마스이브(12/24)·크리스마스(12/25) — 2026-10-26 사용자 요청.
 * 빼빼로데이와 같음: 시간·마감은 평소대로, 토퍼 없음, 첫 화면 안내·달력 표시만.
 */
function christmas(kind: "christmasEve" | "christmas", date: string): SpecialEvent {
  return {
    id: `${kind}-${date}`,
    kind,
    icon: "🎄",
    term: 0,
    date,
    slots: allSlots,
    recommendedCategory: "bouquet",
    bannerCategories: ["bouquet", "basket"],
    topperCategories: [],
  };
}

/** 날짜순. 새 일정이 잡히면 한 줄 추가 */
export const specialEvents: SpecialEvent[] = [
  institutePromotion(8, "2026-10-08"),
  institutePromotion(9, "2026-10-23"),
  pepero("2026-11-11"),
  instituteLongCourse("2026-11-27"),
  institutePromotion(10, "2026-12-04"),
  institutePromotion(11, "2026-12-18"),
  christmas("christmasEve", "2026-12-24"),
  christmas("christmas", "2026-12-25"),
];

export function getEventOn(dateKey: string): SpecialEvent | undefined {
  return specialEvents.find((event) => event.date === dateKey);
}
