import { lookupMessages, type LookupMessages } from "@/i18n/lookup";
import { useLocale } from "./useLocale";

/** 예약 조회·취소 화면 문구 (지금 화면 언어) */
export function useLookupT(): LookupMessages {
  return lookupMessages[useLocale()];
}
