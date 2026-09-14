"use client";

import Link from "next/link";
import { privacyPath } from "@/data/shop";
import { useT } from "@/hooks/useLocale";

/** 페이지 맨 아래 — 개인정보 처리방침 링크 (하단 고정 예약 버튼에 가리지 않게 아래 여백) */
export default function SiteFooter() {
  const t = useT();

  return (
    <footer className="border-t border-line px-5 pb-40 pt-5 text-center text-[12.5px] text-sub">
      <Link href={privacyPath} className="font-semibold underline underline-offset-2 hover:text-brand-dark">
        {t.footer.privacy}
      </Link>
      <p className="mt-1">© {t.shop.name}</p>
    </footer>
  );
}
