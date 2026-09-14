"use client";

import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { reservationStatusOptions } from "@/data/reservationStatus";
import { changeReservationStatus } from "@/server/actions/admin";
import type { ReservationStatus } from "@/types/reservation";

/** 진행 상태 버튼 — 누르면 바로 저장 */
export default function StatusChanger({ id, status }: { id: string; status: ReservationStatus }) {
  const [pendingStatus, setPendingStatus] = useState<ReservationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const shown = isPending && pendingStatus ? pendingStatus : status;

  const change = (next: ReservationStatus) => {
    if (next === status || isPending) return;
    setPendingStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await changeReservationStatus(id, next);
      if (result.error) setError(result.error);
    });
  };

  return (
    <div>
      <div role="radiogroup" aria-label="진행 상태" className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {reservationStatusOptions.map((option) => {
          const selected = option.value === shown;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={isPending}
              onClick={() => change(option.value)}
              className={`rounded-lg border px-2 py-2.5 text-[13px] font-bold transition disabled:cursor-wait ${
                selected
                  ? option.tone === "canceled"
                    ? "border-danger bg-danger text-white"
                    : "border-brand bg-brand text-white"
                  : "border-field bg-white text-body hover:border-brand"
              } ${option.tone === "canceled" ? "col-span-2 sm:col-span-1" : ""}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-1.5 text-[12px] text-sub">
        {isPending ? "저장 중…" : "버튼을 누르면 바로 저장돼요."}
      </p>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
