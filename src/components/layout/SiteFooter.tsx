"use client";

import Link from "next/link";
import { guidePages, guidePath } from "@/data/guidePages";
import { businessInfo, lookupPath, privacyPath } from "@/data/shop";
import { useLookupT } from "@/hooks/useLookupT";
import { useT } from "@/hooks/useLocale";

/** 페이지 맨 아래 — 개인정보 처리방침 링크 (하단 고정 예약 버튼에 가리지 않게 아래 여백) */
export default function SiteFooter() {
  const t = useT();
  const l = useLookupT();

  return (
    <footer className="border-t border-line px-5 pb-40 pt-5 text-center text-[12.5px] text-sub">
      <Link href={lookupPath} className="mb-2 block font-semibold text-brand-dark underline underline-offset-2">
        {l.lookupLink}
      </Link>
      <Link href={privacyPath} className="font-semibold underline underline-offset-2 hover:text-brand-dark">
        {t.footer.privacy}
      </Link>
      <nav aria-label={t.footer.guidesTitle} className="mt-4">
        <p className="font-semibold text-ink">{t.footer.guidesTitle}</p>
        <ul className="mt-1 space-y-0.5">
          {guidePages.map((page) => (
            <li key={page.slug}>
              <Link href={guidePath(page.slug)} className="underline underline-offset-2 hover:text-brand-dark">
                {t.footer.guides[page.slug]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-3 leading-relaxed">{t.footer.area}</p>
      <p className="mt-1 leading-relaxed">{t.footer.occasions}</p>
      <p className="mt-1 leading-relaxed">{t.footer.seasons}</p>
      <p className="mt-1">{businessInfo.address}</p>
      <p className="mt-1">© {t.shop.name}</p>
    </footer>
  );
}
