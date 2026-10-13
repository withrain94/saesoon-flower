"use client";

import Image from "next/image";
import { useT } from "@/hooks/useLocale";
import { usePhotos } from "@/hooks/usePhotos";
import { getCategoryNames } from "@/lib/selection";
import { HERO_SLOT } from "@/lib/sitePhotos";

export default function Hero() {
  const t = useT();
  const photos = usePhotos();

  return (
    <section className="relative h-[230px] overflow-hidden">
      <Image
        src={photos(HERO_SLOT).images[0]}
        alt={t.hero.imageAlt}
        fill
        preload
        sizes="(max-width: 512px) 100vw, 512px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-hero-shade/90" />
      <div className="absolute inset-x-0 bottom-9 px-6 text-white">
        <h1 className="text-[28px] font-extrabold leading-tight">{t.hero.title(getCategoryNames(t))}</h1>
        <p className="mt-2 text-[15px] text-white/90">{t.shop.tagline}</p>
      </div>
    </section>
  );
}
