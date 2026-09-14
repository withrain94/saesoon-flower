"use client";

import { useState } from "react";
import BusinessDocumentView from "@/components/reservation/BusinessDocumentView";
import { useElementWidth } from "@/hooks/useElementWidth";
import { buildBusinessDocument, DOCUMENT_WIDTH } from "@/lib/documents";
import type { BusinessDocumentType, ReservationRequest } from "@/types/reservation";

/** 고객이 요청한 견적서·거래명세표 — 인쇄 / PDF로 저장해서 고객 이메일로 보냄 */
export default function AdminDocuments({ request }: { request: ReservationRequest }) {
  const docs = request.documents.map((type) => buildBusinessDocument(type, request));
  const [activeType, setActiveType] = useState<BusinessDocumentType>(request.documents[0]);
  const [areaRef, areaWidth] = useElementWidth<HTMLDivElement>();
  const scale = areaWidth ? Math.min(1, areaWidth / DOCUMENT_WIDTH) : 1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        {docs.length > 1 ? (
          <div role="tablist" aria-label="서류 종류" className="flex gap-1.5">
            {docs.map((doc) => (
              <button
                key={doc.type}
                type="button"
                role="tab"
                aria-selected={doc.type === activeType}
                onClick={() => setActiveType(doc.type)}
                className={`rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition ${
                  doc.type === activeType ? "border-brand bg-white text-brand-dark" : "border-field bg-white/60 text-body"
                }`}
              >
                {doc.title}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-bold text-white transition hover:bg-brand-dark"
        >
          인쇄 / PDF 저장
        </button>
      </div>
      <p className="mt-1 text-[12px] text-sub print:hidden">
        인쇄 창에서 &lsquo;PDF로 저장&rsquo;을 고른 뒤 {request.documentEmail}로 보내주세요. (요청한 서류가 모두 한 장씩 저장돼요)
      </p>

      <div ref={areaRef} className="print-area mt-2 overflow-hidden rounded-xl border border-line bg-white">
        {docs.map((doc) => (
          <div key={doc.type} className={`print-page ${doc.type === activeType ? "" : "hidden print:block"}`}>
            <div className="document-scale" style={{ zoom: scale }}>
              <BusinessDocumentView document={doc} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
