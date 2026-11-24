import { useSyncExternalStore } from "react";

/** 토스 심사용 주소 표시 — 예약 페이지 주소에 ?toss=test 가 붙어 있으면 true (서버 렌더링 중에는 false) */
export const TOSS_REVIEW_PARAM = { name: "toss", value: "test" } as const;

const subscribe = () => () => {};
const getSnapshot = () =>
  new URLSearchParams(window.location.search).get(TOSS_REVIEW_PARAM.name) === TOSS_REVIEW_PARAM.value;

export function useTossReviewParam() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
