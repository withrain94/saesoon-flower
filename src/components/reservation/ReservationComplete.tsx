import { cashReceiptOptions, paymentMethodOptions } from "@/data/reservationOptions";
import type { SelectionSummary } from "@/lib/selection";
import { describeMessage, describeRecipient, getUnitLabel, type ResolvedUnit } from "@/lib/units";
import type { ReservationRequest } from "@/types/reservation";
import BankAccountCard from "./BankAccountCard";
import DocumentsPanel from "./DocumentsPanel";
import OrderSummary from "./OrderSummary";

export default function ReservationComplete({
  reservation,
  summary,
  units,
}: {
  reservation: ReservationRequest;
  summary: SelectionSummary;
  units: ResolvedUnit[];
}) {
  const payment = paymentMethodOptions.find((option) => option.value === reservation.paymentMethod);
  const cashReceipt = cashReceiptOptions.find((option) => option.value === reservation.cashReceiptType);

  return (
    <div role="status" className="mt-5 rounded-2xl border border-brand px-5 py-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-2xl text-white">
        ✓
      </span>
      <p className="mt-4 text-lg font-bold text-ink">작성이 완료되었습니다! 🎉</p>
      <p className="mt-1.5 text-[15px] text-body">{payment?.completeMessage}</p>
      <p className="mt-3 text-sm text-sub">
        예약자 {reservation.ordererName} · {reservation.ordererPhone}
      </p>

      {/* 결제 방법별 다음 할 일 */}
      <div className="mt-5 space-y-2 rounded-2xl bg-panel p-3 text-left">
        <p className="px-1 text-[13px] font-bold text-brand-dark">결제 방법 · {payment?.label}</p>
        {reservation.paymentMethod === "bank" && (
          <>
            <BankAccountCard />
            {reservation.cashReceiptType !== "none" && (
              <p className="px-1 text-[13px] text-body">
                현금영수증 · {cashReceipt?.label} {reservation.cashReceiptNumber}
              </p>
            )}
          </>
        )}
        {reservation.paymentMethod === "card" && (
          <p className="px-1 text-[13px] text-body">
            결제하실 분 ·{" "}
            {reservation.cardPayer === "other" ? reservation.cardPayerContact : "예약자와 동일"}
          </p>
        )}
      </div>

      {reservation.documents.length > 0 && <DocumentsPanel reservation={reservation} />}

      <div className="mt-3">
        <OrderSummary summary={summary} />
      </div>

      <ul className="mt-3 space-y-2 text-left text-[13px]">
        {units.map(({ unit, recipient, message }, index) => (
          <li key={unit.key} className="rounded-xl border border-line px-4 py-3">
            <p className="font-bold text-ink">
              {index + 1}. {getUnitLabel(unit)}
            </p>
            <p className="mt-1 text-body">받는 분 · {describeRecipient(recipient)}</p>
            <p className="text-body">메시지 · {describeMessage(message)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
