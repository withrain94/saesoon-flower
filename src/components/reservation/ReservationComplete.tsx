import { useT } from "@/hooks/useLocale";
import { formatReceiptNumber } from "@/lib/format";
import type { SelectionSummary } from "@/lib/selection";
import {
  describeMessage,
  describeRecipient,
  describeTopper,
  getUnitLabel,
  type ResolvedUnit,
} from "@/lib/units";
import BankAccountCard from "./BankAccountCard";
import DocumentsPanel from "./DocumentsPanel";
import OrderSummary from "./OrderSummary";
import type { SubmittedReservation } from "./useReservation";

export default function ReservationComplete({
  submitted,
  summary,
  units,
}: {
  submitted: SubmittedReservation;
  summary: SelectionSummary;
  units: ResolvedUnit[];
}) {
  const t = useT();
  const reservation = submitted.request;
  const payment = t.payment.methods[reservation.paymentMethod];
  const { orchidDelivery } = reservation;

  return (
    <div role="status" className="mt-5 rounded-2xl border border-brand px-5 py-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-2xl text-white">
        ✓
      </span>
      <p className="mt-4 text-lg font-bold text-ink">{t.complete.title}</p>
      <p className="mt-1 text-[14px] font-bold text-brand-dark">
        {t.complete.receiptNumber(formatReceiptNumber(submitted.id))}
      </p>
      <p className="mt-1.5 text-[15px] text-body">{payment.complete}</p>
      <p className="mt-3 text-sm text-sub">{t.complete.orderer(reservation.ordererName, reservation.ordererPhone)}</p>

      {/* 결제 방법별 다음 할 일 */}
      <div className="mt-5 space-y-2 rounded-2xl bg-panel p-3 text-left">
        <p className="px-1 text-[13px] font-bold text-brand-dark">{t.complete.paymentMethod(payment.label)}</p>
        {reservation.paymentMethod === "bank" && (
          <>
            <BankAccountCard />
            {reservation.cashReceiptType !== "none" && (
              <p className="px-1 text-[13px] text-body">
                {t.complete.cashReceipt(
                  t.payment.cashReceiptOptions[reservation.cashReceiptType],
                  reservation.cashReceiptNumber,
                )}
              </p>
            )}
          </>
        )}
        {reservation.paymentMethod === "card" && (
          <p className="px-1 text-[13px] text-body">
            {t.complete.cardPayer(
              reservation.cardPayer === "other" ? reservation.cardPayerContact : t.complete.cardPayerSame,
            )}
          </p>
        )}
        {reservation.paymentMethod === "paypal" && (
          <p className="px-1 text-[13px] text-body">
            {t.complete.paypal(t.format.price(reservation.paypalAmount), reservation.paypalEmail)}
          </p>
        )}
      </div>

      {reservation.documents.length > 0 && <DocumentsPanel reservation={reservation} />}

      <div className="mt-3">
        <OrderSummary summary={summary} />
      </div>

      {orchidDelivery && (
        <p className="mt-3 rounded-xl border border-line px-4 py-3 text-left text-[13px] text-body">
          {t.complete.orchidDelivery(
            orchidDelivery.method === "restaurant"
              ? t.orchidDelivery.describeRestaurant(
                  t.restaurants[orchidDelivery.restaurant as keyof typeof t.restaurants] ?? orchidDelivery.restaurant,
                  orchidDelivery.reservationName,
                )
              : t.orchidDelivery.describePickup,
          )}
        </p>
      )}

      <ul className="mt-3 space-y-2 text-left text-[13px]">
        {units.map(({ unit, recipient, topper, topperAvailable, message }, index) => (
          <li key={unit.key} className="rounded-xl border border-line px-4 py-3">
            <p className="font-bold text-ink">
              {index + 1}. {getUnitLabel(unit, t)}
            </p>
            <p className="mt-1 text-body">{t.complete.recipient(describeRecipient(recipient, t))}</p>
            {topperAvailable && <p className="text-body">{describeTopper(topper, t)}</p>}
            <p className="text-body">{t.complete.message(describeMessage(message, t))}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
