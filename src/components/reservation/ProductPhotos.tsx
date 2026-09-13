import Image from "next/image";
import type { Product } from "@/data/products";
import { siteLinksByCategory } from "@/data/shop";

/** 가로로 넘겨보는 실제 제작 사진 — 끝에는 소개 사이트로 가는 칸 */
export default function ProductPhotos({
  product,
  categoryName,
}: {
  product: Product;
  categoryName: string;
}) {
  const total = product.images.length;

  return (
    <ul className="-mx-5 mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
      {product.images.map((src, index) => (
        <li
          key={src}
          className="relative aspect-[3/4] w-[62%] shrink-0 snap-start overflow-hidden rounded-xl bg-soft"
        >
          <Image
            src={src}
            alt={`${product.label} ${categoryName} 실제 제작 사진 ${index + 1}`}
            fill
            sizes="(max-width: 512px) 62vw, 320px"
            className="object-cover"
          />
          <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white">
            {index + 1} / {total}
          </span>
        </li>
      ))}
      <li className="aspect-[3/4] w-[40%] shrink-0 snap-start">
        <a
          href={siteLinksByCategory[product.category]}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand bg-brand-tint px-3 text-center transition hover:bg-white"
        >
          <span aria-hidden="true" className="text-2xl">
            📷
          </span>
          <span className="text-[14px] font-bold text-brand-dark">사진 더 보기</span>
          <span className="text-[12px] leading-snug text-sub">새순 소개 사이트로 이동</span>
        </a>
      </li>
    </ul>
  );
}
