"use client";

import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { tossBankName } from "@/data/tossBanks";
import { useT } from "@/hooks/useLocale";
import { formatTossDueDate, isTossActive } from "@/lib/tossPayment";
import { startTossPayment } from "@/server/actions/payment";
import type { CustomerPaymentView, PaymentMethod, ReservationStatus } from "@/types/reservation";
import { isUserCancel, openTossCheckout, rememberPendingPayment } from "./tossCheckout";

const COPIED_MS = 2000;

/**
 * 손님 화면의 온라인 결제 상태 — 완료 화면·결제 후 화면·예약 조회에서 같이 씀.
 * 결제 전: [카드 결제하기]/[입금 계좌 받기] · 입금 대기: 전용 계좌 · 완료: 완료 + 영수증 · 기한 지남/취소: 안내
 */
export default function TossPaymentCard({
  reservationId,
  phone,
  method,
  status,
  payment,
}: {
  reservationId: string;
  /** 예약자 연락처 — 결제창을 다시 열 때 확인용 (모르면 버튼 대신 예약 조회 안내) */
  phone: string | null;
  method: PaymentMethod;
  status: ReservationStatus;
  payment: CustomerPaymentView | null;
}) {
  const t = useT();
  const bank = method === "bank";
  const active = isTossActive(payment);

  if (payment?.status === "DONE") {
    return (
      <div className="rounded-xl bg-white px-4 py-3 text-left">
        <p className="text-[14px] font-bold text-brand-dark">{bank ? t.toss.bankDone : t.toss.cardDone}</p>
        {payment.receiptUrl && (
          <a
            href={payment.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-[13px] font-semibold text-brand-dark underline underline-offset-2"
          >
            {t.toss.receipt}
          </a>
        )}
      </div>
    );
  }

  if (payment?.status === "WAITING_FOR_DEPOSIT" && payment.virtualAccount) {
    return <VirtualAccountCard account={payment.virtualAccount} amount={payment.amount} />;
  }

  if (payment?.status === "CANCELED" || payment?.status === "PARTIAL_CANCELED" || status === "canceled") {
    return <p className="rounded-xl bg-white px-4 py-3 text-left text-[13px] text-body">{t.toss.canceled}</p>;
  }

  if (payment?.status === "EXPIRED") {
    return <p className="rounded-xl bg-white px-4 py-3 text-left text-[13px] text-body">{t.toss.expired}</p>;
  }

  // 아직 결제 전 (결제창을 닫았거나 실패) — 접수 상태일 때만 다시 결제
  if (active || status !== "received") return null;
  return (
    <div className="rounded-xl bg-white px-4 py-3 text-left">
      <p className="text-[13px] text-body">{bank ? t.toss.pendingBank : t.toss.pending}</p>
      {phone ? (
        <TossPayButton reservationId={reservationId} phone={phone} bank={bank} />
      ) : (
        <p className="mt-1 text-[13px] text-sub">{t.toss.failBody}</p>
      )}
    </div>
  );
}

/** 결제창 다시 열기 버튼 */
export function TossPayButton({ reservationId, phone, bank }: { reservationId: string; phone: string; bank: boolean }) {
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pay = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await startTossPayment(reservationId, phone);
        if (!result.ok) {
          setError(t.toss.errors[result.code]);
          return;
        }
        rememberPendingPayment({ reservationId, phone });
        await openTossCheckout(result.checkout);
      } catch (caught) {
        if (!isUserCancel(caught)) setError(t.toss.errors.failed);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={pay}
        disabled={isPending}
        className="mt-2 w-full rounded-xl bg-brand px-4 py-3 text-[15px] font-bold text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? t.toss.opening : bank ? t.toss.payNowBank : t.toss.payNow}
      </button>
      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
}

/** 이 예약 전용 입금 계좌 + 복사 */
function VirtualAccountCard({
  account,
  amount,
}: {
  account: NonNullable<CustomerPaymentView["virtualAccount"]>;
  amount: number;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-brand bg-white px-4 py-3 text-left">
      <p className="text-[13px] text-body">{t.toss.bankWaiting}</p>
      <div className="mt-2 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-sub">{t.toss.accountLabel}</p>
          <p className="mt-0.5 text-[16px] font-extrabold text-ink">
            {tossBankName(account.bankCode)} <span className="whitespace-nowrap">{account.accountNumber}</span>
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-brand-dark">{t.toss.amount(t.format.price(amount))}</p>
          {account.dueDate && <p className="mt-0.5 text-[13px] text-body">{t.toss.dueDate(formatTossDueDate(account.dueDate))}</p>}
        </div>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg border border-field bg-white px-2.5 py-1.5 text-[13px] font-semibold text-brand-dark transition hover:border-brand"
        >
          {copied ? t.bankCard.copied : t.bankCard.copy}
        </button>
      </div>
    </div>
  );
}
