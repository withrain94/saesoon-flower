"use client";

import Image from "next/image";
import { useT } from "@/hooks/useLocale";
import { usePhotos } from "@/hooks/usePhotos";
import { useStoreInfoT } from "@/hooks/useStoreInfoT";
import { getCategoryNames } from "@/lib/selection";
import { HERO_SLOT } from "@/lib/sitePhotos";

/**
 * 맨 위 큰 사진 — 한 줄 소개 + 매장 강점 + [꽃 예약하기]·[매장 위치] 버튼.
 * 버튼이 가는 곳(섹션 id)은 page.tsx가 내려줌 (layout에서 reservation을 import 하지 않게)
 */
export default function Hero({ bookHref, storeHref }: { bookHref: string; storeHref: string }) {
  const t = useT();
  const s = useStoreInfoT();
  const photos = usePhotos();

  return (
    <section className="relative overflow-hidden">
      <Image
        src={photos(HERO_SLOT).images[0]}
        alt={t.hero.imageAlt}
        fill
        preload
        sizes="(max-width: 512px) 100vw, 512px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-hero-shade/95" />
      <div className="relative px-6 pb-12 pt-24 text-white">
        <p className="text-[13.5px] font-semibold text-white/90">{s.hero.eyebrow}</p>
        <h1 className="mt-1.5 text-[28px] font-extrabold leading-tight">{t.hero.title(getCategoryNames(t))}</h1>
        <p className="mt-2 text-[14.5px] text-white/90">{t.shop.tagline}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {s.hero.badges.map((badge) => (
            <li
              key={badge}
              className="rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-semibold backdrop-blur-sm"
            >
              {badge}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-2">
          <a
            href={bookHref}
            className="flex-[3] rounded-xl bg-brand py-3.5 text-center text-[16px] font-extrabold text-white shadow-md transition hover:bg-brand-dark"
          >
            {s.hero.book}
          </a>
          <a
            href={storeHref}
            className="flex-[2] rounded-xl bg-white/95 py-3.5 text-center text-[15px] font-bold text-ink transition hover:bg-white"
          >
            📍 {s.hero.location}
          </a>
        </div>
      </div>
    </section>
  );
}
