"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronIcon } from "@/components/ui/icons";
import { privacyPath } from "@/data/shop";
import { useT } from "@/hooks/useLocale";

/** [필수] 개인정보 수집·이용 동의 — input name: privacyConsent (value "agree") */
export default function PrivacyConsentField() {
  const t = useT();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-2xl border border-line px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <label className="flex cursor-pointer items-start gap-2.5 text-[14.5px] font-bold text-ink">
          <input
            type="checkbox"
            name="privacyConsent"
            value="agree"
            required
            // 체크하지 않고 제출하면 브라우저가 이 문구로 알려줌
            onInvalid={(event) => event.currentTarget.setCustomValidity(t.validation.privacy)}
            onChange={(event) => event.currentTarget.setCustomValidity("")}
            className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
          />
          <span>{t.privacy.consentLabel}</span>
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
