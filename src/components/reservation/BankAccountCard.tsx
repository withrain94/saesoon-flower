"use client";

import { useState } from "react";
import { bankAccount } from "@/data/shop";
import { useT } from "@/hooks/useLocale";

const COPIED_MS = 2000;

/** 입금 계좌 + 계좌 복사 버튼 */
export default function BankAccountCard() {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(bankAccount.number.replaceAll("-", ""));
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 text-left">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-sub">{t.bankCard.title}</p>
        <p className="mt-0.5 text-[15px] font-bold text-ink">
          {t.bankCard.bank} <span className="whitespace-nowrap">{bankAccount.number}</span>
        </p>
        <p className="mt-0.5 text-sm text-body">
          {t.bankCard.holderNote(bankAccount.holder)}
        </p>
      </div>
      <button
        type="button"
        onClick={copyAccount}
        className="shrink-0 rounded-lg border border-field bg-white px-2.5 py-1.5 text-[13px] font-semibold text-brand-dark transition hover:border-brand"
      >
        {copied ? t.bankCard.copied : t.bankCard.copy}
      </button>
    </div>
  );
}
