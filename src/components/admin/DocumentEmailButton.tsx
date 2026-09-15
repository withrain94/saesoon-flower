"use client";

import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { resendDocumentEmail } from "@/server/actions/admin";

/** 견적서·거래명세표 이메일 다시 보내기 — 신청 직후 자동 발송이 실패했거나 손님이 못 받았다고 할 때 */
export default function DocumentEmailButton({ id }: { id: string }) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const send = () => {
    setNotice(null);
    setError(null);
    startTransition(async () => {
      const result = await resendDocumentEmail(id);
      setError(result.error);
      setNotice(result.notice ?? null);
    });
  };

  return (
    <div className="mb-3 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-body">신청 직후 손님 이메일로 PDF를 자동으로 보내요.</p>
        <button
          type="button"
          onClick={send}
          disabled={isPending}
          className="rounded-lg border border-field bg-white px-3 py-1.5 text-[13px] font-semibold text-body transition hover:border-brand disabled:cursor-wait disabled:text-sub"
        >
          {isPending ? "보내는 중…" : "서류 이메일 다시 보내기"}
        </button>
      </div>
      {notice && <p className="mt-1 text-[13px] font-semibold text-brand-dark">{notice}</p>}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
