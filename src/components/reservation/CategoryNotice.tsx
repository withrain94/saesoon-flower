"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/ui/icons";
import { useT } from "@/hooks/useLocale";
import type { CategoryCopy } from "@/i18n/types";

/** 상품 종류별 "꼭 확인해 주세요!" — 요약을 먼저 보여주고, 전체 안내는 펼쳐보기 (줄바꿈 그대로) */
export default function CategoryNotice({ notice }: { notice: NonNullable<CategoryCopy["notice"]> }) {
  const t = useT();
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="mt-4 rounded-xl bg-panel px-4 py-3">
      <p className="text-[15px] font-bold text-ink">{t.notice.title}</p>
      <ul className="mt-2 space-y-1 text-[13.5px] leading-relaxed text-body">
        {notice.summary.map((line) => (
          <li key={line} className="flex gap-1.5">
            <span aria-hidden="true" className="text-brand">
              ✓
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-expanded={showFull}
        onClick={() => setShowFull((value) => !value)}
        className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-lg border border-panel-line bg-white py-2 text-[13px] font-semibold text-brand-dark transition hover:border-brand"
      >
        {showFull ? t.notice.hideFull : t.notice.showFull}
        <ChevronIcon direction="down" className={`h-3.5 w-3.5 transition ${showFull ? "rotate-180" : ""}`} />
      </button>

      {showFull && (
        <div className="mt-3 space-y-3 whitespace-pre-line border-t border-panel-line pt-3 text-[13.5px] leading-relaxed text-body">
          {notice.full.map((paragraph, index) => (
            <p key={paragraph} className={index === 0 ? "font-bold text-ink" : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
