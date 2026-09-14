import type { Locale } from "@/types/i18n";
import { lookupEn } from "./en";
import { lookupJa } from "./ja";
import { lookupKo, type LookupMessages } from "./ko";
import { lookupVi } from "./vi";
import { lookupZh } from "./zh";

export type { LookupMessages };

/** 손님 예약 조회·취소 화면 문구 — 언어를 추가하면 여기서 타입 오류로 알려줌 */
export const lookupMessages: Record<Locale, LookupMessages> = {
  ko: lookupKo,
  en: lookupEn,
  ja: lookupJa,
  zh: lookupZh,
  vi: lookupVi,
};
