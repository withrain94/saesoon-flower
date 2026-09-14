import Image from "next/image";
import type { Product } from "@/data/products";
import { siteLinksByCategory } from "@/data/shop";
import { useT } from "@/hooks/useLocale";

/** 가로로 넘겨보는 실제 제작 사진 — 끝에는 소개 사이트로 가는 칸 */
export default function ProductPhotos({
  product,
  itemName,
  large = false,
}: {
  product: Product;
  /** "꽃다발 6만원" — 사진 설명용 */
  itemName: string;
  /** 사진을 먼저 크게 보여주는 화면 (호접난) */
  large?: boolean;
}) {
  const t = useT();
  const total = product.images.length;

  return (
    <ul className="-mx-5 mt-4 flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
      {product.images.map((src, index) => (
        <li
          key={src}
          className={`relative shrink-0 snap-start overflow-hidden rounded-xl bg-soft ${
            large ? "aspect-[4/5] w-[86%]" : "aspect-[3/4] w-[62%]"
          }`}
        >
          <Image
            src={src}
            alt={t.productOption.photoAlt(itemName, index + 1)}
            fill
            // 크게 보여줄 때 첫 사진은 바로 보이는 자리라 먼저 불러옴
            preload={large && index === 0}
            sizes={large ? "(max-width: 512px) 86vw, 440px" : "(max-width: 512px) 62vw, 320px"}
            className="object-cover"
          />
          <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white">
            {index + 1} / {total}
          </span>
        </li>
      ))}
      <li className={`shrink-0 snap-start ${large ? "aspect-[4/5] w-[45%]" : "aspect-[3/4] w-[40%]"}`}>
        <a
          href={siteLinksByCategory[product.category]}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand bg-brand-tint px-3 text-center transition hover:bg-white"
        >
          <span aria-hidden="true" className="text-2xl">
            📷
          </span>
          <span className="text-[14px] font-bold text-brand-dark">{t.productOption.morePhotos}</span>
          <span className="text-[12px] leading-snug text-sub">{t.productOption.morePhotosSub}</span>
        </a>
      </li>
    </ul>
  );
}
