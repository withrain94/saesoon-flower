"use client";

import { useState } from "react";
import Checkbox from "@/components/ui/Checkbox";
import { inputClassName } from "@/components/ui/Field";
import { BUSINESS_NUMBER_PATTERN, documentOptions } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import type { BusinessDocumentType } from "@/types/reservation";

/**
 * 견적서·거래명세표 요청.
 * input name: documents(체크된 서류마다 하나), documentCompany, documentBusinessNumber
 * 서류는 신청 완료 화면에서 PDF로 바로 받음 (이메일 발송 없음)
 */
export default function DocumentRequestField() {
  const t = useT();
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
        <span className="text-[15px] font-bold text-ink">{t.documents.toggle}</span>
      </Checkbox>
      <p className="mt-1 pl-7 text-[13px] text-sub">{t.documents.description}</p>

      {needed && (
        <div className="mt-3 space-y-2 rounded-2xl bg-panel p-3">
          <div role="group" aria-label={t.documents.groupAria} className="grid grid-cols-2 gap-2">
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
                  {t.documents.options[option.value]}
                </label>
              );
            })}
          </div>

          <input
            name="documentCompany"
            type="text"
            required
            autoComplete="organization"
            aria-label={t.documents.companyAria}
            placeholder={t.documents.companyPlaceholder}
            className={inputClassName}
          />
          <input
            name="documentBusinessNumber"
            type="text"
            inputMode="numeric"
            pattern={BUSINESS_NUMBER_PATTERN}
            title={t.documents.businessNumberTitle}
            aria-label={t.documents.businessNumberAria}
            placeholder={t.documents.businessNumberPlaceholder}
            className={inputClassName}
          />
        </div>
      )}
    </div>
  );
}
