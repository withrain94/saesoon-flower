import type { SelectionIssue } from "@/types/reservation";

/** 페이지 섹션 id — 탭 이동·스크롤·에러 이동이 모두 이 값을 참조 */
export const SECTION = {
  items: "products",
  dateTime: "datetime",
  reserve: "reserve",
} as const;

export type SectionId = (typeof SECTION)[keyof typeof SECTION];

export const sectionTabs: { id: SectionId; label: string }[] = [
  { id: SECTION.items, label: "꽃 고르기" },
  { id: SECTION.dateTime, label: "날짜·시간" },
  { id: SECTION.reserve, label: "신청하기" },
];

export const sectionIds = sectionTabs.map((tab) => tab.id);

/** 상단 고정 헤더 + 탭 높이만큼 스크롤 여백 */
export const sectionScrollMargin = "scroll-mt-32";

/** 하단 고정 버튼이 폼 밖에서 submit 하기 위한 form id */
export const RESERVATION_FORM_ID = "reservation-form";

/** 결제 방법 "네이버 예약" 안의 링크 목록 id */
export const NAVER_LINKS_ID = "naver-booking-links";

/** 빠진 항목 → 이동할 섹션 */
export const issueSection: Record<SelectionIssue, SectionId> = {
  items: SECTION.items,
  date: SECTION.dateTime,
  time: SECTION.dateTime,
};

export function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function scrollToNaverLinks() {
  document.getElementById(NAVER_LINKS_ID)?.scrollIntoView({ behavior: "smooth", block: "center" });
}
