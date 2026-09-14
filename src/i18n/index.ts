import type { Locale } from "@/types/i18n";
import { en } from "./en";
import { ja } from "./ja";
import { ko, type Messages } from "./ko";
import { vi } from "./vi";
import { zh } from "./zh";

export type { Messages };
export { ko };

/** 🌐 언어 탭 순서 — 첫 번째가 기본 언어 */
export const localeOptions: { code: Locale; label: string; short: string }[] = [
  { code: "ko", label: "한국어", short: "KO" },
  { code: "en", label: "English", short: "EN" },
  { code: "ja", label: "日本語", short: "JA" },
  { code: "zh", label: "中文(简体)", short: "中文" },
  { code: "vi", label: "Tiếng Việt", short: "VI" },
];

export const DEFAULT_LOCALE: Locale = "ko";

export const messages: Record<Locale, Messages> = { ko, en, ja, zh, vi };

export function isLocale(value: unknown): value is Locale {
  return localeOptions.some((option) => option.code === value);
}
