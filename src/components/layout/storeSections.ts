import { storeContact } from "@/data/shop";

/** 매장 안내 섹션 id — 맨 위 [매장 위치] 버튼·한 줄 요약의 [지도]가 여기로 이동 */
export const STORE_INFO_ID = "store-info";

/** 전화 걸기 링크 (하이픈 뺀 번호) */
export const storeTelHref = `tel:${storeContact.phone.replace(/-/g, "")}`;
