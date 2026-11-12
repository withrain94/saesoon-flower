"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { readPendingPayment } from "@/components/reservation/tossCheckout";
import { TossPayButton } from "@/components/reservation/TossPaymentCard";
import { lookupPath } from "@/data/shop";
import { useT } from "@/hooks/useLocale";

const noSubscribe = () => () => {};
/** 같은 값을 돌려주도록 문자열로 (객체는 매번 새로 만들어지므로) */
const readPendingText = () => JSON.stringify(readPendingPayment());

/**
 * 결제창에서 실패·취소로 돌아온 화면 — 예약은 저장돼 있으므로 다시 결제하거나 예약 조회에서 결제.
 * 다시 결제에 쓸 예약 id·연락처는 이 브라우저 탭에 잠깐 보관한 값 (없으면 예약 조회 안내)
 */
export default function TossPaymentFail({ code, message }: { code: string; message: string }) {
  const t = useT();
  const pendingText = useSyncExternalStore(noSubscribe, readPendingText, () => "null");
  const pending = JSON.parse(pendingText) as ReturnType<typeof readPendingPayment>;
  const closedByCustomer = code === "PAY_PROCESS_CANCELED" || code === "USER_CANCEL";

  return (
    <div className="px-5 py-10 text-center">
      <p className="text-lg font-bold text-ink">{t.toss.failTitle}</p>
      <p className="mt-2 text-[14px] text-body">{t.toss.failBody}</p>
      {message && !closedByCustomer && <p className="mt-1 text-[13px] text-sub">{t.toss.failReason(message)}</p>}
      {pending && (
        <div className="mx-auto mt-4 max-w-sm">
          <TossPayButton reservationId={pending.reservationId} phone={pending.phone} bank={false} />
        </div>
      )}
      <p className="mt-5">
        <Link href={lookupPath} className="text-[14px] font-bold text-brand-dark underline">
          {t.toss.goLookup}
        </Link>
      </p>
      <p className="mt-2">
        <Link href="/" className="text-[13px] text-sub underline">
          {t.toss.goHome}
        </Link>
      </p>
    </div>
  );
}
