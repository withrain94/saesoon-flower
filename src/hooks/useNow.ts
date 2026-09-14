import { useSyncExternalStore } from "react";
import { toNowInTimeZone, type Now } from "@/lib/time";

const TICK_MS = 30_000;

/** 30초마다 다시 읽어서, 페이지를 오래 열어둬도 지난 시간대가 자동으로 막히게 함 */
function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, TICK_MS);
  return () => clearInterval(timer);
}

function getSnapshot() {
  // 해외에서 접속해도 예약 가능 시간은 매장(한국) 시각 기준
  const now = toNowInTimeZone(new Date());
  return `${now.dateKey}|${now.minutes}`;
}

/**
 * 매장(한국) 기준 현재 날짜·시각.
 * 서버 렌더링 중에는 null → 날짜 의존 UI가 hydration 오류 없이 클라이언트에서만 그려진다.
 */
export function useNow(): Now | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);
  if (!snapshot) return null;
  const [dateKey, minutes] = snapshot.split("|");
  return { dateKey, minutes: Number(minutes) };
}
