import { storeInfoMessages, type StoreInfoMessages } from "@/i18n/storeInfo";
import { useLocale } from "./useLocale";

/** 첫 화면 매장 소개 문구 (지금 화면 언어) */
export function useStoreInfoT(): StoreInfoMessages {
  return storeInfoMessages[useLocale()];
}
