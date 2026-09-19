"use client";

import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { formatAdminDateTime } from "@/lib/adminFormat";
import { setReminderSent } from "@/server/actions/admin";

/** 예약 전 안내 문자 — 매장이 문자를 보낸 뒤 눌러서 표시 (다시 누르면 취소) */
export default function ReminderToggle({ id, sentAt }: { id: string; sentAt: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (sent: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setReminderSent(id, sent);
      if (result.error) setError(result.error);
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[14px] font-semibold text-ink">
          {sentAt ? `✅ 안내 문자 보냄 · ${formatAdminDateTime(sentAt)}` : "📱 안내 문자 아직 안 보냄"}
        </p>
        {sentAt ? (
          <button
            type="button"
            onClick={() => toggle(false)}
            disabled={isPending}
            className="rounded-lg border border-field bg-white px-3 py-1.5 text-[13px] font-semibold text-body transition hover:border-brand disabled:cursor-wait disabled:text-sub"
          >
            {isPending ? "저장 중…" : "보냄 표시 지우기"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => toggle(true)}
            disabled={isPending}
            className="rounded-lg bg-brand px-3 py-2 text-[14px] font-bold text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
          >
            {isPending ? "저장 중…" : "안내 문자 보냈어요"}
          </button>
        )}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
