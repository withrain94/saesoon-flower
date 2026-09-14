/** 상품 종류 하나의 화면 문구 */
export type CategoryCopy = {
  name: string;
  /** 첫 화면 입구 카드 설명 */
  tagline: string;
  /** 목록 위 한 줄 안내 — 없으면 인기 순위로 "인기 금액: …" 자동 작성 */
  popularNote?: string;
  /** "꼭 확인해 주세요!" — 요약(먼저 보임) + 전체 안내(펼쳐보기, 줄바꿈 \n 그대로) */
  notice?: { summary: string[]; full: string[] };
};

/** 상품 하나의 화면 문구 (네이버 예약 옵션명 스타일 제목 + 설명) */
export type ProductCopy = {
  title: string;
  points: string[];
};

/** 특별한 날 종류 하나의 화면 문구 */
export type EventCopy = {
  /** 달력 날짜 아래 짧은 표시 */
  calendarLabel: string;
  /** "제8기 승진식" — 요약·버튼용 짧은 이름 */
  shortTitle: (term: number) => string;
  title: (term: number) => string;
  highlights: string[];
};
