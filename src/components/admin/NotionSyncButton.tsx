"use client";

import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { resyncReservationNotion } from "@/server/actions/admin";

/** 노션 날짜별 표에 다시 올리기 — 자동으로 올리다 실패했을 때 */
export default function NotionSyncButton({ id, pageTitle }: { id: string; pageTitle: string }) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sync = () => {
    setNotice(null);
    setError(null);
    startTransition(async () => {
      const result = await resyncReservationNotion(id);
      if (result.error) setError(result.error);
      setNotice(result.notice ?? null);
    });
  };

  return (
    <div className="print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-body">
          노션 페이지 <span className="font-semibold text-ink">‘{pageTitle}’</span>
        </p>
        <button
          type="button"
          onClick={sync}
          disabled={isPending}
          className="rounded-lg border border-field bg-white px-3 py-1.5 text-[13px] font-semibold text-body transition hover:border-brand disabled:cursor-wait disabled:text-sub"
        >
          {isPending ? "올리는 중…" : "노션에 다시 올리기"}
        </button>
      </div>
      {notice && <p className="mt-1 text-[13px] font-semibold text-brand-dark">{notice}</p>}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
