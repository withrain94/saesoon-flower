import type { Locale } from "@/types/i18n";
import { storeInfoEn } from "./en";
import { storeInfoJa } from "./ja";
import { storeInfoKo, type StoreInfoMessages } from "./ko";
import { storeInfoVi } from "./vi";
import { storeInfoZh } from "./zh";

export type { StoreInfoMessages };

/** 첫 화면 매장 소개 문구 — 언어를 추가하면 여기서 타입 오류로 알려줌 */
export const storeInfoMessages: Record<Locale, StoreInfoMessages> = {
  ko: storeInfoKo,
  en: storeInfoEn,
  ja: storeInfoJa,
  zh: storeInfoZh,
  vi: storeInfoVi,
};
