import { shop, siteUrl } from "@/data/shop";

export default function StoreHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-white px-5">
      <p className="truncate text-lg font-bold text-ink">{shop.name}</p>
      <a
        href={siteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-full border border-field px-3 py-1.5 text-[13px] font-semibold text-body transition hover:border-brand hover:text-brand-dark"
      >
        새순 소개 사이트 ›
      </a>
    </header>
  );
}
