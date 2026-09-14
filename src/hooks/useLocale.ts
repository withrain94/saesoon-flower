import { useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, isLocale, messages, type Messages } from "@/i18n";
import type { Locale } from "@/types/i18n";

const STORAGE_KEY = "saesoon-locale";
const CHANGE_EVENT = "saesoon-locale-change";

/** 저장소를 못 쓰는 브라우저(사생활 보호 모드 등)에서도 이번 방문 동안은 바꾼 언어가 유지되게 */
let fallbackLocale: Locale = DEFAULT_LOCALE;

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getSnapshot(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : fallbackLocale;
  } catch {
    return fallbackLocale;
  }
}

/** 언어 바꾸기 — 다음 방문에도 기억 */
export function setLocale(locale: Locale) {
  fallbackLocale = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // 저장 못 해도 이번 방문 동안은 fallbackLocale로 유지
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * 지금 화면 언어.
 * 서버 렌더링·첫 화면은 한국어 → 브라우저에서 기억해 둔 언어로 바로 바뀜 (hydration 오류 없음).
 */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_LOCALE);
}

/** 지금 언어의 화면 문구 */
export function useT(): Messages {
  return messages[useLocale()];
}
