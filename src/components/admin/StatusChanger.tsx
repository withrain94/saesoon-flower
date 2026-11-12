"use client";

import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { reservationStatusOptions } from "@/data/reservationStatus";
import { changeReservationStatus } from "@/server/actions/admin";
import type { ReservationStatus } from "@/types/reservation";

/**
 * 진행 상태 버튼 — 누르면 바로 저장.
 * onlinePayment: 토스로 결제됐거나(paid) 입금 기다리는(waiting) 예약 — [취소]만 누르면 돈·계좌는 그대로라 먼저 경고
 */
export default function StatusChanger({
  id,
  status,
  onlinePayment = null,
}: {
  id: string;
  status: ReservationStatus;
  onlinePayment?: "paid" | "waiting" | null;
}) {
  const [cancelWarning, setCancelWarning] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ReservationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const shown = isPending && pendingStatus ? pendingStatus : status;

  const change = (next: ReservationStatus, confirmed = false) => {
    if (next === status || isPending) return;
    if (next === "canceled" && onlinePayment && !confirmed) {
      setCancelWarning(true);
      return;
    }
    setCancelWarning(false);
    setPendingStatus(next);
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await changeReservationStatus(id, next);
      if (result.error) setError(result.error);
      setNotice(result.notice ?? null);
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
        {isPending ? "저장 중…" : "버튼을 누르면 바로 저장돼요. 노션 표도 같이 고쳐져요."}
      </p>
      {cancelWarning && (
        <div role="alert" className="mt-2 rounded-xl border-2 border-danger bg-white p-3">
          <p className="text-[14px] font-bold text-danger">
            {onlinePayment === "paid"
              ? "⚠️ 이 버튼은 상태만 바꾸고 돈은 돌려주지 않아요."
              : "⚠️ 이 버튼은 상태만 바꾸고 손님 전용 입금 계좌는 열려 있어요. (취소 뒤에도 입금될 수 있음)"}
          </p>
          <p className="mt-1 text-[13px] text-body">
            아래 <b>결제</b> 칸의 <b>{onlinePayment === "paid" ? "[결제 취소·환불]" : "[입금 계좌 닫기(취소)]"}</b>을 쓰면
            {onlinePayment === "paid" ? " 환불과 " : " 계좌 닫기와 "}예약 취소가 한 번에 돼요.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCancelWarning(false)}
              className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-bold text-white"
            >
              알겠어요 (닫기)
            </button>
            <button
              type="button"
              onClick={() => change("canceled", true)}
              className="rounded-lg border border-field bg-white px-3 py-1.5 text-[13px] font-semibold text-sub"
            >
              환불은 따로 했어요 — 상태만 취소
            </button>
          </div>
        </div>
      )}
      {notice && <p className="mt-1 text-[13px] font-semibold text-brand-dark">{notice}</p>}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
