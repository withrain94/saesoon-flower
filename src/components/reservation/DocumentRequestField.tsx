"use client";

import { useState } from "react";
import Checkbox from "@/components/ui/Checkbox";
import { inputClassName } from "@/components/ui/Field";
import {
  BUSINESS_NUMBER_PATTERN,
  DOCUMENT_GUIDE,
  documentOptions,
} from "@/data/reservationOptions";
import type { BusinessDocumentType } from "@/types/reservation";

/**
 * 견적서·거래명세표 요청.
 * input name: documents(체크된 서류마다 하나), documentEmail, documentCompany, documentBusinessNumber
 */
export default function DocumentRequestField() {
  const [needed, setNeeded] = useState(false);
  const [documents, setDocuments] = useState<BusinessDocumentType[]>(
    documentOptions.map((option) => option.value),
  );

  function toggleDocument(value: BusinessDocumentType, checked: boolean) {
    setDocuments((current) =>
      checked ? [...current, value] : current.filter((item) => item !== value),
    );
  }

  return (
    <div>
      <Checkbox checked={needed} onChange={setNeeded}>
        <span className="text-[15px] font-bold text-ink">{DOCUMENT_GUIDE.toggle}</span>
      </Checkbox>
      <p className="mt-1 pl-7 text-[13px] text-sub">{DOCUMENT_GUIDE.description}</p>

      {needed && (
        <div className="mt-3 space-y-2 rounded-2xl bg-panel p-3">
          <div role="group" aria-label="필요한 서류" className="grid grid-cols-2 gap-2">
            {documentOptions.map((option) => {
              const checked = documents.includes(option.value);
              // 최소 1개는 남겨둠
              const locked = checked && documents.length === 1;
              return (
                <label
                  key={option.value}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border bg-white py-2.5 text-[14px] font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
                    checked ? "border-brand text-brand-dark" : "border-field text-body"
                  } ${locked ? "cursor-default" : "cursor-pointer hover:border-brand"}`}
                >
                  <input
                    type="checkbox"
                    name="documents"
                    value={option.value}
                    checked={checked}
                    disabled={locked}
                    onChange={(event) => toggleDocument(option.value, event.target.checked)}
                    className="sr-only"
                  />
                  {/* 비활성 체크박스는 FormData에 안 들어가므로 값을 따로 넘김 */}
                  {locked && <input type="hidden" name="documents" value={option.value} />}
                  <span aria-hidden="true">{checked ? "✓" : "○"}</span>
                  {option.label}
                </label>
              );
            })}
          </div>

          <input
            name="documentEmail"
            type="email"
            required
            autoComplete="email"
            aria-label="서류 받을 이메일"
            placeholder={DOCUMENT_GUIDE.emailPlaceholder}
            className={inputClassName}
          />
          <input
            name="documentCompany"
            type="text"
            required
            autoComplete="organization"
            aria-label="상호·기관명"
            placeholder={DOCUMENT_GUIDE.companyPlaceholder}
            className={inputClassName}
          />
          <input
            name="documentBusinessNumber"
            type="text"
            inputMode="numeric"
            pattern={BUSINESS_NUMBER_PATTERN}
            title="사업자등록번호 10자리를 확인해 주세요. (예: 123-45-67890)"
            aria-label="사업자등록번호"
            placeholder={DOCUMENT_GUIDE.businessNumberPlaceholder}
            className={inputClassName}
          />
        </div>
      )}
    </div>
  );
}
