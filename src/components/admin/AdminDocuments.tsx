"use client";

import { useState } from "react";
import BusinessDocumentView from "@/components/reservation/BusinessDocumentView";
import DocumentDownloadButton from "@/components/ui/DocumentDownloadButton";
import { useElementWidth } from "@/hooks/useElementWidth";
import { buildBusinessDocument, DOCUMENT_WIDTH } from "@/lib/documents";
import type { BusinessDocumentType, ReservationRequest } from "@/types/reservation";

/** 고객이 요청한 견적서·거래명세표 — PDF 다운로드 + 미리보기 */
export default function AdminDocuments({ id, request }: { id: string; request: ReservationRequest }) {
  const docs = request.documents.map((type) => buildBusinessDocument(type, request));
  const [activeType, setActiveType] = useState<BusinessDocumentType>(request.documents[0]);
  const [areaRef, areaWidth] = useElementWidth<HTMLDivElement>();
  const scale = areaWidth ? Math.min(1, areaWidth / DOCUMENT_WIDTH) : 1;

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2 print:hidden">
        {docs.map((doc) => (
          <DocumentDownloadButton
            key={doc.type}
            id={id}
            type={doc.type}
            label={`⬇ ${doc.title} PDF 다운로드`}
            busyLabel="파일 만드는 중…"
            failedText="파일을 만들지 못했어요. 잠시 후 다시 눌러주세요."
          />
        ))}
      </div>

      {docs.length > 1 && (
        <div role="tablist" aria-label="서류 종류" className="mt-3 flex gap-1.5 print:hidden">
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
      )}

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
