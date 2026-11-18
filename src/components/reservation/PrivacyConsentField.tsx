"use client";

import Link from "next/link";
import { useState, type InvalidEvent } from "react";
import { ChevronIcon } from "@/components/ui/icons";
import { privacyPath } from "@/data/shop";
import { useT } from "@/hooks/useLocale";

/**
 * [필수] 개인정보 수집·이용 동의 — input name: privacyConsent (value "agree").
 * 체크 전에는 눈에 띄게 보여주고, 체크 없이 예약하기를 누르면 이 칸으로 이동해 빨갛게 안내함
 * (브라우저 기본 말풍선은 하단 고정 버튼에 가려질 수 있어서 쓰지 않음)
 */
export default function PrivacyConsentField() {
  const t = useT();
  const [showDetails, setShowDetails] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showError, setShowError] = useState(false);

  function handleInvalid(event: InvalidEvent<HTMLInputElement>) {
    event.preventDefault();
    setShowError(true);
    // 앞에 빠진 칸(성함 등)이 있으면 브라우저가 그 칸부터 알려주므로, 이 칸이 첫 번째일 때만 이동
    const input = event.currentTarget;
    const firstInvalid = [...(input.form?.elements ?? [])].find(
      (element) => element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement
        ? element.willValidate && !element.validity.valid
        : false,
    );
    if (firstInvalid !== input) return;
    input.focus({ preventScroll: true });
    input.closest("[data-privacy-consent]")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div
      data-privacy-consent
      className={`rounded-2xl border-2 px-4 py-3.5 transition-colors ${
        checked ? "border-line" : showError ? "border-danger bg-brand-tint" : "border-brand bg-brand-tint"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <label className="flex cursor-pointer items-start gap-2.5 text-[14.5px] font-bold text-ink">
          <input
            type="checkbox"
            name="privacyConsent"
            value="agree"
            required
            aria-invalid={showError && !checked}
            onInvalid={handleInvalid}
            onChange={(event) => {
              setChecked(event.currentTarget.checked);
              setShowError(false);
            }}
            className="mt-0.5 h-6 w-6 shrink-0 accent-brand"
          />
          <span>
            {t.privacy.consentLabel}
            {!checked && !showError && (
              <span className="mt-0.5 block text-[13px] font-semibold text-brand-dark">{t.privacy.consentHint}</span>
            )}
            {!checked && showError && (
              <span role="alert" className="mt-0.5 block text-[13px] font-semibold text-danger">
                ⚠️ {t.privacy.consentError}
              </span>
            )}
          </span>
        </label>
        <button
          type="button"
          aria-expanded={showDetails}
          onClick={() => setShowDetails((value) => !value)}
          className="flex shrink-0 items-center gap-0.5 pt-0.5 text-[13px] font-semibold text-sub hover:text-brand-dark"
        >
          {showDetails ? t.privacy.hideDetails : t.privacy.showDetails}
          <ChevronIcon direction="down" className={`h-3.5 w-3.5 transition ${showDetails ? "rotate-180" : ""}`} />
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 space-y-2 rounded-xl bg-soft px-3.5 py-3 text-[13px] leading-relaxed text-body">
          <dl className="space-y-2">
            {t.privacy.items.map((item) => (
              <div key={item.title}>
                <dt className="font-bold text-ink">{item.title}</dt>
                <dd>{item.body}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sub">{t.privacy.refusal}</p>
          <Link
            href={privacyPath}
            target="_blank"
            className="inline-block font-semibold text-brand-dark underline underline-offset-2"
          >
            {t.privacy.policyLink}
          </Link>
        </div>
      )}
    </div>
  );
}
