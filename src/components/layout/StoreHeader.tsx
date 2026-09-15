"use client";

import Link from "next/link";
import { lookupPath, siteUrl } from "@/data/shop";
import { useT } from "@/hooks/useLocale";
import LanguageSwitcher from "./LanguageSwitcher";

/** showLookupLink: 예약 조회 화면(/check)에서는 자기 자신이라 숨김 */
export default function StoreHeader({ showLookupLink = true }: { showLookupLink?: boolean }) {
  const t = useT();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-line bg-white px-5">
      <p className="min-w-0 truncate text-lg font-bold text-ink">{t.shop.name}</p>
      <div className="flex shrink-0 items-center gap-1.5">
        {showLookupLink && (
          <Link
            href={lookupPath}
            className="whitespace-nowrap rounded-full border border-brand bg-brand-tint px-2.5 py-1.5 text-[13px] font-bold text-brand-dark transition hover:bg-white"
          >
            {t.header.lookupLink}
          </Link>
        )}
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-full border border-field px-2.5 py-1.5 text-[13px] font-semibold text-body transition hover:border-brand hover:text-brand-dark"
        >
          {t.header.siteLink}
        </a>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
