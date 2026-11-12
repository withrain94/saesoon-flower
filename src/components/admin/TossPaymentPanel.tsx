"use client";

import { useActionState, useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { guessTossBankCode, tossBanks } from "@/data/tossBanks";
import { formatAdminDateTime } from "@/lib/adminFormat";
import { describeTossPayment } from "@/lib/tossPayment";
import type { AdminFormState } from "@/server/actions/admin";
import { cancelTossPaymentByAdmin, refreshTossPayment } from "@/server/actions/adminPayment";
import type { StoredReservation } from "@/types/reservation";

const initialState: AdminFormState = { error: null };

const inputClass =
  "w-full rounded-lg border border-field bg-white px-3 py-2 text-[14px] text-ink placeholder:text-faint focus:border-brand focus:outline-none";

/**
 * 관리자 상세 — 토스페이먼츠 온라인 결제 상태 + [토스에서 다시 확인] + [결제 취소·환불].
 * 입금된 전용 계좌 결제를 환불할 땐 손님 환불 계좌가 필요 (손님 취소 요청에 적힌 계좌를 미리 채움)
 */
export default function TossPaymentPanel({ reservation }: { reservation: StoredReservation }) {
  const { id, payment, request, cancelRequest } = reservation;
  const [refreshState, setRefreshState] = useState<AdminFormState>(initialState);
  const [isRefreshing, startRefresh] = useTransition();
  const [cancelState, cancelAction, canceling] = useActionState(cancelTossPaymentByAdmin.bind(null, id), initialState);
  const [open, setOpen] = useState(false);

  const cancelable = payment?.paymentKey && (payment.status === "DONE" || payment.status === "WAITING_FOR_DEPOSIT");
  const needsRefundAccount = payment?.status === "DONE" && payment.virtualAccount !== null;

  return (
    <div className="space-y-2">
      <p className="text-[14px] font-semibold text-ink">{describeTossPayment(payment, request)}</p>
      {payment?.approvedAt && <p className="text-[12.5px] text-sub">완료 {formatAdminDateTime(payment.approvedAt)}</p>}
      {payment?.method && <p className="text-[12.5px] text-sub">토스 결제수단 · {payment.method}</p>}
      {payment?.cashReceipt && (
        <p className="text-[13px] text-body">
          🧾 현금영수증 {payment.cashReceipt.type} 발급됨{" "}
          <a href={payment.cashReceipt.receiptUrl} target="_blank" rel="noopener noreferrer" className="underline">
            보기
          </a>
        </p>
      )}
      {payment?.receiptUrl && (
        <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-[13px] text-brand-dark underline">
          {payment.virtualAccount ? "입금 명세서 보기" : "카드 매출전표 보기"}
        </a>
      )}

      <div className="flex flex-wrap gap-2 pt-1 print:hidden">
        {payment && (
          <button
            type="button"
            disabled={isRefreshing}
            onClick={() =>
              startRefresh(async () => {
                setRefreshState(await refreshTossPayment(id));
              })
            }
            className="rounded-lg border border-field bg-white px-3 py-1.5 text-[13px] font-semibold text-body transition hover:border-brand disabled:cursor-wait"
          >
            {isRefreshing ? "확인 중…" : "토스에서 다시 확인"}
          </button>
        )}
        {cancelable && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-danger bg-white px-3 py-1.5 text-[13px] font-semibold text-danger transition hover:bg-danger/5"
          >
            {payment.status === "DONE" ? "결제 취소·환불" : "입금 계좌 닫기(취소)"}
          </button>
        )}
      </div>
      {!isRefreshing && refreshState.notice && <p className="text-[12.5px] text-brand-dark">{refreshState.notice}</p>}
      {refreshState.error && <ErrorText>{refreshState.error}</ErrorText>}

      {cancelable && open && (
        <form action={cancelAction} className="space-y-2 rounded-xl border border-danger/40 p-3 print:hidden">
          <p className="text-[13px] font-bold text-danger">
            {payment.status === "DONE"
              ? `${request.totalPrice.toLocaleString("ko-KR")}원 전액을 취소(환불)하고 예약도 '취소'로 바꿔요.`
              : "입금 기다리는 계좌를 닫고 예약도 '취소'로 바꿔요. 닫은 계좌로는 입금이 안 돼요."}
          </p>
          <input name="reason" maxLength={200} placeholder="취소 이유 (예: 손님 요청)" className={inputClass} />
          {needsRefundAccount && (
            <>
              <p className="text-[12.5px] text-body">이미 입금된 돈은 손님 계좌로 돌려보내요 (토스가 보통 2일 안쪽에 보냄).</p>
              <select
                name="refundBank"
                required
                defaultValue={guessTossBankCode(cancelRequest?.refundBank ?? "") ?? ""}
                className={inputClass}
              >
                <option value="" disabled>
                  환불받을 은행 고르기{cancelRequest?.refundBank ? ` (손님이 적은 은행: ${cancelRequest.refundBank})` : ""}
                </option>
                {tossBanks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
              <input
                name="refundAccount"
                required
                inputMode="numeric"
                defaultValue={cancelRequest?.refundAccount ?? ""}
                placeholder="계좌번호 (숫자만)"
                className={inputClass}
              />
              <input
                name="refundHolder"
                required
                defaultValue={cancelRequest?.refundHolder ?? ""}
                placeholder="예금주"
                className={inputClass}
              />
            </>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={canceling}
              className="rounded-lg bg-danger px-4 py-2 text-[13px] font-bold text-white disabled:cursor-wait disabled:opacity-60"
            >
              {canceling ? "취소하는 중…" : "취소 확정"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-field bg-white px-4 py-2 text-[13px] font-semibold text-body"
            >
              닫기
            </button>
          </div>
          {cancelState.error && <ErrorText>{cancelState.error}</ErrorText>}
        </form>
      )}
      {!canceling && cancelState.notice && <p className="text-[12.5px] text-brand-dark">{cancelState.notice}</p>}
    </div>
  );
}
