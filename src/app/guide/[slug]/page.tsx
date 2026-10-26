import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuidePage, guidePages, guidePath } from "@/data/guidePages";
import { getCategory } from "@/data/products";
import { deliveryFreeRules } from "@/data/reservationOptions";
import { businessInfo } from "@/data/shop";
import { ko } from "@/i18n/ko";
import { formatDateLong } from "@/lib/date";
import { getEventCopy, getOpenEvents } from "@/lib/events";
import { getProductCopy } from "@/lib/selection";
import { resolveSlotPhotos } from "@/lib/sitePhotos";
import { toNowInTimeZone } from "@/lib/time";
import { getPhotoOverrides } from "@/server/sitePhotos";

/** 행사 일정(마감 지나면 빠짐)·관리자가 바꾼 사진이 한 시간 안에 반영되게 */
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return guidePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guide/[slug]">): Promise<Metadata> {
  const page = getGuidePage((await params).slug);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: guidePath(page.slug) },
    openGraph: { title: page.metaTitle, description: page.description, url: guidePath(page.slug) },
  };
}

/** 구글 검색용 주제별 소개 페이지 — 내용은 data/guidePages.ts (한국어) */
export default async function GuidePage({ params }: PageProps<"/guide/[slug]">) {
  const page = getGuidePage((await params).slug);
  if (!page) notFound();

  const overrides = await getPhotoOverrides();
  const photos = page.photoProducts.map((id) => resolveSlotPhotos(id, overrides)).map((p) => p.images[p.cover] ?? p.images[0]);
  const events = page.showInstituteEvents
    ? getOpenEvents(toNowInTimeZone(new Date())).filter((event) => event.kind !== "pepero")
    : [];

  return (
    <div className="mx-auto w-full max-w-lg flex-1 bg-white px-5 pb-16 pt-6 shadow-[0_0_24px_rgba(0,0,0,0.04)]">
      <Link href="/" className="text-[14px] font-semibold text-brand-dark hover:underline">
        ‹ {ko.shop.name} 예약 페이지
      </Link>

      <h1 className="mt-4 text-[24px] font-extrabold leading-tight text-ink">{page.heading}</h1>
      <div className="mt-2 space-y-1.5 text-[14.5px] leading-relaxed text-body">
        {page.intro.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {photos.map((src, index) => (
          <div
            key={src}
            className={`relative overflow-hidden rounded-2xl bg-soft ${photos.length === 1 || (photos.length === 3 && index === 0) ? "col-span-2 aspect-[4/3]" : "aspect-square"}`}
          >
            <Image
              src={src}
              alt={`${page.heading} 예시 사진 ${index + 1}`}
              fill
              sizes="(max-width: 512px) 100vw, 512px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {events.length > 0 && (
          <section>
            <h2 className="text-[16px] font-bold text-ink">다가오는 행사 일정</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-body">
              {events.map((event) => (
                <li key={event.id}>
                  {formatDateLong(event.date)} — {getEventCopy(event).title}
                </li>
              ))}
            </ul>
          </section>
        )}

        {page.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-[16px] font-bold text-ink">{section.title}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-body">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        {page.priceCategories.map((categoryId) => (
          <section key={categoryId}>
            <h2 className="text-[16px] font-bold text-ink">{ko.categories[categoryId].name} 금액</h2>
            <ul className="mt-2 divide-y divide-line rounded-2xl border border-line text-[14px]">
              {[...getCategory(categoryId).products]
                .sort((a, b) => a.price - b.price)
                .map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="text-body">{getProductCopy(product).title}</span>
                    <span className="shrink-0 font-bold text-ink">{ko.format.price(product.price)}</span>
                  </li>
                ))}
            </ul>
          </section>
        ))}

        {page.showDeliveryRules && (
          <section>
            <h2 className="text-[16px] font-bold text-ink">무료배송 기준</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-body">
              {deliveryFreeRules.map((rule) => (
                <li key={rule.id}>{ko.receive.freeRules[rule.id](ko.format.priceShort(rule.minPrice))}</li>
              ))}
              <li>{ko.receive.feeContact}</li>
            </ul>
          </section>
        )}
      </div>

      <Link
        href="/"
        className="mt-8 block rounded-2xl bg-brand px-5 py-4 text-center text-[16px] font-extrabold text-white shadow-sm hover:bg-brand-dark"
      >
        {page.ctaLabel} ›
      </Link>

      <section className="mt-10 border-t border-line pt-5">
        <h2 className="text-[14px] font-bold text-ink">다른 안내</h2>
        <ul className="mt-2 space-y-1 text-[14px]">
          {guidePages
            .filter((other) => other.slug !== page.slug)
            .map((other) => (
              <li key={other.slug}>
                <Link href={guidePath(other.slug)} className="text-brand-dark underline underline-offset-2">
                  {other.linkLabel}
                </Link>
              </li>
            ))}
        </ul>
        <p className="mt-4 text-[13px] leading-relaxed text-sub">
          {ko.shop.name} · {ko.shop.tagline}
          <br />
          {businessInfo.address}
          <br />
          전화 {businessInfo.phone}
        </p>
      </section>
    </div>
  );
}
