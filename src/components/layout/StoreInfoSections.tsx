"use client";

import { useState } from "react";
import { deliveryFreeRules } from "@/data/reservationOptions";
import { businessInfo, storeContact } from "@/data/shop";
import { useT } from "@/hooks/useLocale";
import { useStoreInfoT } from "@/hooks/useStoreInfoT";
import { STORE_INFO_ID, storeTelHref } from "./storeSections";

/**
 * 예약 신청서 아래 — 손님 후기 · 매장 안내(주소·영업·결제·지도·전화·카톡) · 무료배송 기준 · 자주 묻는 질문 · 다시 예약하러 가기.
 * 검색으로 들어온 분이 매장을 알고 믿고 예약하도록 (2026-10-26 사용자 요청, 소개 사이트 내용 참고)
 */
export default function StoreInfoSections({ bookHref }: { bookHref: string }) {
  const s = useStoreInfoT();

  return (
    <div className="bg-soft px-5 pb-8 pt-8">
      <Reviews />
      <StoreDetails />
      <FreeDelivery />
      <Faq />

      <div className="mt-8 rounded-2xl bg-white px-5 py-6 text-center shadow-sm">
        <p className="text-[16px] font-extrabold text-ink">{s.bottomCta.title}</p>
        <a
          href={bookHref}
          className="mt-3 inline-block w-full rounded-xl bg-brand py-3.5 text-[16px] font-extrabold text-white transition hover:bg-brand-dark"
        >
          {s.bottomCta.button}
        </a>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[18px] font-extrabold text-ink">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[13px] text-sub">{subtitle}</p>}
    </div>
  );
}

function Reviews() {
  const s = useStoreInfoT();

  return (
    <section aria-label={s.reviews.title}>
      <SectionTitle title={`💬 ${s.reviews.title}`} subtitle={s.reviews.subtitle} />
      <ul className="grid grid-cols-2 gap-2">
        {s.reviews.items.map((review) => (
          <li key={review.tag} className="rounded-2xl bg-white px-3.5 py-3 shadow-sm">
            <p className="text-[13.5px] font-semibold leading-snug text-ink">“{review.text}”</p>
            <p className="mt-2 text-[11.5px] font-semibold text-brand-dark">{review.tag}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StoreDetails() {
  const s = useStoreInfoT();
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(businessInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 복사가 막힌 브라우저 — 주소는 화면에 그대로 보이므로 넘어감
    }
  }

  const rows: { icon: string; label: string; value: string }[] = [
    { icon: "🕐", label: s.store.hoursLabel, value: s.store.hours },
    { icon: "🙋", label: s.store.staffLabel, value: s.store.staff },
    { icon: "🛒", label: s.store.buyLabel, value: s.store.buy },
    { icon: "💳", label: s.store.payLabel, value: s.store.pay },
    { icon: "📞", label: s.store.phoneLabel, value: storeContact.phone },
  ];

  const outlineButton =
    "rounded-xl border border-field bg-white py-3 text-center text-[14px] font-bold text-body transition hover:border-brand hover:text-brand-dark";

  return (
    <section id={STORE_INFO_ID} aria-label={s.store.title} className="mt-9 scroll-mt-20">
      <SectionTitle title={`🏠 ${s.store.title}`} />
      <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
        <p className="text-[16px] font-extrabold text-ink">{s.store.name}</p>

        <div className="mt-3 rounded-xl bg-brand-tint px-3.5 py-3">
          <p className="text-[12px] font-bold text-brand-dark">📍 {s.store.addressLabel}</p>
          <p className="mt-0.5 text-[14px] font-semibold leading-snug text-ink">{businessInfo.address}</p>
          <p className="mt-0.5 text-[13px] text-body">{s.store.landmark}</p>
          <button
            type="button"
            onClick={copyAddress}
            className="mt-2 rounded-full border border-brand bg-white px-3 py-1 text-[12px] font-bold text-brand-dark"
          >
            {copied ? `✓ ${s.store.copied}` : s.store.copyAddress}
          </button>
        </div>

        <dl className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <div key={row.label} className="flex gap-2.5 text-[13.5px]">
              <dt className="w-[92px] shrink-0 font-bold text-ink">
                {row.icon} {row.label}
              </dt>
              <dd className="min-w-0 leading-snug text-body">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[12.5px] text-sub">※ {s.store.basketNote}</p>

        <a
          href={storeContact.naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block rounded-xl bg-strong py-3.5 text-center text-[15px] font-bold text-white transition hover:opacity-90"
        >
          🗺️ {s.store.naverMap}
        </a>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <a href={storeTelHref} className={outlineButton}>
            📞 {s.store.call}
          </a>
          <a
            href={storeContact.kakaoChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-kakao py-3 text-center text-[14px] font-bold text-kakao-ink transition hover:opacity-90"
          >
            💬 {s.store.kakao}
          </a>
        </div>
        <a
          href={storeContact.coupangEatsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-2 block ${outlineButton}`}
        >
          🛵 {s.store.coupang} <span className="text-[12px] font-normal text-sub">({s.store.coupangNote})</span>
        </a>
        <div className="mt-3 flex justify-center gap-4 text-[13px] font-semibold text-sub">
          <a href={storeContact.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-brand-dark">
            {s.store.instagram}
          </a>
          <a href={storeContact.blogUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-brand-dark">
            {s.store.blog}
          </a>
        </div>
      </div>
    </section>
  );
}

function FreeDelivery() {
  const t = useT();
  const s = useStoreInfoT();

  return (
    <section aria-label={s.delivery.title} className="mt-9">
      <SectionTitle title={`🚚 ${s.delivery.title}`} subtitle={s.delivery.subtitle} />
      <ul className="space-y-1.5 rounded-2xl bg-white px-4 py-4 shadow-sm">
        {deliveryFreeRules.map((rule) => (
          <li key={rule.id} className="flex gap-2 text-[13.5px] leading-snug text-body">
            <span className="text-brand">✓</span>
            <span>{t.receive.freeRules[rule.id](t.format.price(rule.minPrice))}</span>
          </li>
        ))}
        <li className="pt-1 text-[12.5px] leading-snug text-sub">※ {s.delivery.otherArea}</li>
      </ul>
    </section>
  );
}

function Faq() {
  const s = useStoreInfoT();

  return (
    <section aria-label={s.faq.title} className="mt-9">
      <SectionTitle title={`❓ ${s.faq.title}`} />
      <div className="space-y-2">
        {s.faq.items.map((item) => (
          <details key={item.q} className="group rounded-2xl bg-white px-4 py-3 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[14px] font-bold text-ink">
              <span>Q. {item.q}</span>
              <span className="text-sub transition group-open:rotate-180">⌄</span>
            </summary>
            <p className="mt-2 text-[13.5px] leading-relaxed text-body">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
