"use client";

import { useState } from "react";
import { useElementWidth } from "@/hooks/useElementWidth";
import { useT } from "@/hooks/useLocale";
import { buildBusinessDocument, DOCUMENT_WIDTH } from "@/lib/documents";
import type { BusinessDocumentType, ReservationRequest } from "@/types/reservation";
import BusinessDocumentView from "./BusinessDocumentView";

/** 완료 화면 — 요청한 서류 미리보기 + 인쇄/PDF 저장 */
export default function DocumentsPanel({ reservation }: { reservation: ReservationRequest }) {
  const t = useT();
  const docs = reservation.documents.map((type) => buildBusinessDocument(type, reservation));
  const [activeType, setActiveType] = useState<BusinessDocumentType>(reservation.documents[0]);
  // 화면 미리보기는 폭에 맞춰 축소 (인쇄는 globals.css에서 원래 크기)
  const [areaRef, areaWidth] = useElementWidth<HTMLDivElement>();
  const scale = areaWidth ? Math.min(1, areaWidth / DOCUMENT_WIDTH) : 1;

  return (
    <div className="mt-3 rounded-2xl bg-panel p-3 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-[13px] font-bold text-brand-dark">{t.documents.panelTitle}</p>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-bold text-white transition hover:bg-brand-dark"
        >
          {t.documents.print}
        </button>
      </div>
      <p className="mt-0.5 px-1 text-[12px] text-sub">
        {t.documents.emailNote(reservation.documentEmail)} {t.documents.koreanOnly}
      </p>

      {docs.length > 1 && (
        <div role="tablist" aria-label={t.documents.tabsAria} className="mt-2 grid grid-cols-2 gap-1.5">
          {docs.map((doc) => (
            <button
              key={doc.type}
              type="button"
              role="tab"
              aria-selected={doc.type === activeType}
              onClick={() => setActiveType(doc.type)}
              className={`rounded-lg border py-2 text-[13px] font-semibold transition ${
                doc.type === activeType
                  ? "border-brand bg-white text-brand-dark"
                  : "border-field bg-white/60 text-body"
              }`}
            >
              {t.documents.options[doc.type]}
            </button>
          ))}
        </div>
      )}

      {/* 화면: 선택한 서류만 가로 스크롤 미리보기 / 인쇄: 모든 서류를 한 장씩 */}
      <div ref={areaRef} className="print-area mt-2 overflow-hidden rounded-xl border border-line bg-white">
        {docs.map((doc) => (
          <div
            key={doc.type}
            className={`print-page ${doc.type === activeType ? "" : "hidden print:block"}`}
          >
            <div className="document-scale" style={{ zoom: scale }}>
              <BusinessDocumentView document={doc} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
