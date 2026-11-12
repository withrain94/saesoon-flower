"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LookupReservationDetails from "@/components/lookup/LookupReservationDetails";
import ShareReservationButtons from "@/components/reservation/ShareReservationButtons";
import { forgetPendingPayment } from "@/components/reservation/tossCheckout";
import TossPaymentCard from "@/components/reservation/TossPaymentCard";
import ErrorText from "@/components/ui/ErrorText";
import { lookupPath } from "@/data/shop";
import { useT } from "@/hooks/useLocale";
import { confirmTossPaymentRedirect, type PaymentErrorCode } from "@/server/actions/payment";
import type { CustomerReservationView } from "@/types/reservation";

type State =
  | { kind: "checking" }
  | { kind: "done"; reservation: CustomerReservationView }
  | { kind: "error"; code: PaymentErrorCode; message?: string };

/** 결제창에서 돌아온 화면 — 결제 승인(카드 결제 완료 / 전용 입금 계좌 발급) 후 예약 내용을 보여줌 */
export default function TossPaymentSuccess({
  paymentKey,
  orderId,
  amount,
}: {
  paymentKey: string;
  orderId: string;
  amount: string;
}) {
  const t = useT();
  const [state, setState] = useState<State>({ kind: "checking" });
  // 개발 모드에서 두 번 실행돼도 한 번만 승인 요청
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    confirmTossPaymentRedirect({ paymentKey, orderId, amount })
      .then((result) => {
        if (result.ok) {
          forgetPendingPayment();
          setState({ kind: "done", reservation: result.reservation });
        } else {
          setState({ kind: "error", code: result.code, message: result.message });
        }
      })
      .catch(() => setState({ kind: "error", code: "failed" }));
  }, [paymentKey, orderId, amount]);

  if (state.kind === "checking") {
    return <p className="px-5 py-16 text-center text-[15px] text-body">{t.toss.checking}</p>;
  }

  if (state.kind === "error") {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-lg font-bold text-ink">{t.toss.failTitle}</p>
        <ErrorText>{t.toss.errors[state.code]}</ErrorText>
        {state.message && <p className="mt-1 text-[13px] text-sub">{t.toss.failReason(state.message)}</p>}
        <Link href={lookupPath} className="mt-4 inline-block text-[14px] font-bold text-brand-dark underline">
          {t.toss.goLookup}
        </Link>
      </div>
    );
  }

  const { reservation } = state;
  const { request, payment } = reservation;
  const waitingDeposit = payment?.status === "WAITING_FOR_DEPOSIT";

  return (
    <div className="space-y-4 px-5 py-8">
      <div role="status" className="rounded-2xl border border-brand px-5 py-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-2xl text-white">
          ✓
        </span>
        <p className="mt-4 text-lg font-bold text-ink">{waitingDeposit ? t.toss.successTitleBank : t.toss.successTitle}</p>
        <p className="mt-1 text-[16px] font-extrabold tracking-wide text-brand-dark">
          {t.complete.receiptNumber(reservation.receiptNumber)}
        </p>
        <p className="mt-0.5 text-[12.5px] text-sub">{t.complete.receiptNote}</p>
        <div className="mt-4 rounded-2xl bg-panel p-2">
          <TossPaymentCard
            reservationId={reservation.id}
            phone={request.ordererPhone}
            method={request.paymentMethod}
            status={reservation.status}
            payment={payment}
          />
        </div>
        <p className="mx-auto mt-3 max-w-sm rounded-xl bg-brand-tint px-4 py-2.5 text-[13px] font-bold text-brand-dark">
          📱 {t.complete.reminder}
        </p>
        <ShareReservationButtons id={reservation.id} request={request} />
      </div>
      <LookupReservationDetails reservation={reservation} phone={request.ordererPhone} />
      <p className="text-center">
        <Link href={lookupPath} className="text-[14px] font-bold text-brand-dark underline">
          {t.toss.goLookup}
        </Link>
      </p>
    </div>
  );
}
