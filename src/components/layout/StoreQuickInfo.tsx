"use client";

import { searchInfo, storeContact } from "@/data/shop";
import { useStoreInfoT } from "@/hooks/useStoreInfoT";
import { storeTelHref } from "./storeSections";

/** 맨 위 사진 바로 아래 — 매장 위치·영업 시간 한 줄 요약 + 전화·지도·카톡 (자세한 안내는 아래 매장 안내) */
export default function StoreQuickInfo() {
  const s = useStoreInfoT();

  const buttonClass =
    "flex-1 rounded-lg border border-field bg-white py-2 text-center text-[13px] font-bold text-body transition hover:border-brand hover:text-brand-dark";

  return (
    <section aria-label={s.quick.ariaLabel} className="px-5 pb-2 pt-3">
      <div className="rounded-2xl border border-line bg-soft px-4 py-3">
        <p className="text-[13.5px] font-semibold leading-snug text-ink">
          📍 {searchInfo.postalAddress.street}{" "}
          <span className="font-normal text-sub">· {s.quick.landmark}</span>
        </p>
        <p className="mt-1 text-[13px] text-body">🕐 {s.quick.hours}</p>
        <div className="mt-2.5 flex gap-1.5">
          <a href={storeTelHref} className={buttonClass}>
            📞 {s.quick.call}
          </a>
          <a href={storeContact.naverMapUrl} target="_blank" rel="noopener noreferrer" className={buttonClass}>
            🗺️ {s.quick.map}
          </a>
          <a
            href={storeContact.kakaoChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-kakao py-2 text-center text-[13px] font-bold text-kakao-ink transition hover:opacity-90"
          >
            💬 {s.quick.kakao}
          </a>
        </div>
      </div>
    </section>
  );
}
