"use client";

import { siteUrl } from "@/data/shop";
import { useT } from "@/hooks/useLocale";
import LanguageSwitcher from "./LanguageSwitcher";

export default function StoreHeader() {
  const t = useT();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-line bg-white px-5">
      <p className="min-w-0 truncate text-lg font-bold text-ink">{t.shop.name}</p>
      <div className="flex shrink-0 items-center gap-1.5">
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-field px-3 py-1.5 text-[13px] font-semibold text-body transition hover:border-brand hover:text-brand-dark"
        >
          {t.header.siteLink}
        </a>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
