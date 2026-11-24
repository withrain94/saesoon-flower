"use client";

import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { inputClassName } from "@/components/ui/Field";
import { PHONE_PATTERN } from "@/data/reservationOptions";
import { businessInfo } from "@/data/shop";
import { useLookupT } from "@/hooks/useLookupT";
import { useT } from "@/hooks/useLocale";
import { useNow } from "@/hooks/useNow";
import { parseDateKey } from "@/lib/date";
import { canEditRecipients, getRecipientEditDeadline } from "@/lib/recipientEdit";
import { getSavedItemName } from "@/lib/selection";
import { needsDeliveryAddress } from "@/lib/units";
import { editRecipientsByCustomer } from "@/server/actions/lookup";
import type { CustomerReservationView } from "@/types/reservation";

const fieldCodes = ["recipientName", "recipientPhone", "recipientAddress", "orchidRestaurant", "orchidReservationName"] as const;

/**
 * 예약 조회 화면 "받는 분 정보 고치기" — 받는 분 성함·연락처·배송지, 호접난 식당만 (2026-11-24 사용자 요청).
 * 기한은 lib/recipientEdit, 저장은 server/actions/lookup의 editRecipientsByCustomer (접수번호 직접 입력 필요)
 */
export default function LookupRecipientEditPanel({
  reservation,
  name,
  phone,
  onChange,
}: {
  reservation: CustomerReservationView;
  name: string;
  phone: string;
  onChange: (reservation: CustomerReservationView) => void;
}) {
  const t = useT();
  const l = useLookupT();
  const now = useNow();
  const { request } = reservation;
  const [open, setOpen] = useState(false);
  const [deliveries, setDeliveries] = useState(() =>
    request.deliveries.map(({ recipientName, recipientPhone, recipientAddress }) => ({
      recipientName,
      recipientPhone,
      recipientAddress,
    })),
  );
  const orchidRestaurant = request.orchidDelivery?.method === "restaurant" ? request.orchidDelivery : null;
  const [orchid, setOrchid] = useState(() =>
    orchidRestaurant ? { restaurant: orchidRestaurant.restaurant, reservationName: orchidRestaurant.reservationName } : null,
  );
  const [typedReceipt, setTypedReceipt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = reservation.status !== "canceled" && reservation.status !== "delivered" && !reservation.cancelRequestedAt;
  if (!active || !now) return null;
  const editable = canEditRecipients(
    { status: reservation.status, cancelRequested: false, date: request.date, time: request.time },
    now,
  );

  const deadline = getRecipientEditDeadline(request.date, request.time);
  const deadlineDate = parseDateKey(deadline.dateKey);
  const deadlineText = `${t.format.dateLong(deadlineDate.getMonth() + 1, deadlineDate.getDate(), deadlineDate.getDay())} ${t.format.time(deadline.hour)}`;
  const quantities = Object.fromEntries(request.items.map((item) => [item.productId, item.quantity]));

  if (!editable) {
    return (
      <section className="rounded-2xl border border-line px-4 py-3">
        <h2 className="text-[13px] font-bold text-sub">{l.edit.title}</h2>
        <p className="mt-1 text-[14px] text-body">{l.edit.closedInfo}</p>
        <a
          href={`tel:${businessInfo.phone.replaceAll("-", "")}`}
          className="mt-2 inline-flex rounded-lg border border-field bg-white px-3 py-2 text-[14px] font-bold text-brand-dark"
        >
          📞 {l.cancel.call}
        </a>
      </section>
    );
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await editRecipientsByCustomer({
          receipt: reservation.receiptNumber,
          typedReceipt,
          name,
          phone,
          edit: { deliveries, orchid },
        });
        if (result.ok) {
          onChange(result.reservation);
          return;
        }
        const code = result.code;
        setError(fieldCodes.some((field) => field === code) ? t.validation[code as (typeof fieldCodes)[number]] : l.errors[code as keyof typeof l.errors]);
      } catch {
        setError(l.errors.failed);
      }
    });
  };

  const setDelivery = (index: number, key: keyof (typeof deliveries)[number], value: string) =>
    setDeliveries((current) => current.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  return (
    <section className="rounded-2xl border border-line px-4 py-3">
      <h2 className="text-[13px] font-bold text-sub">{l.edit.title}</h2>
      <p className="mt-1 text-[13px] font-semibold text-brand-dark">{l.edit.deadline(deadlineText)}</p>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 w-full rounded-lg border border-brand/60 bg-white py-3 text-[14px] font-bold text-brand-dark"
        >
          {l.edit.open}
        </button>
      ) : (
        <form onSubmit={submit} className="mt-2 space-y-3">
          <p className="text-[13px] text-body">{l.edit.scope}</p>
          <p className="text-[12px] text-sub">{l.edit.rule}</p>
          {request.deliveries.map((delivery, index) => {
            const itemName = getSavedItemName(delivery, t);
            const quantity = quantities[delivery.productId] ?? 1;
            const needsAddress = needsDeliveryAddress(request.receiveMethod, delivery.category);
            const value = deliveries[index];
            return (
              <fieldset key={`${delivery.productId}-${delivery.unitNo}`} className="space-y-2 rounded-xl bg-soft px-3 py-2.5">
                <legend className="sr-only">{itemName}</legend>
                <p className="text-[14px] font-bold text-ink">
                  {quantity > 1 ? t.format.unitName(itemName, delivery.unitNo, quantity) : itemName}
                </p>
                <input
                  aria-label={t.recipient.nameAria}
                  value={value.recipientName}
                  onChange={(event) => setDelivery(index, "recipientName", event.target.value)}
                  required={needsAddress}
                  maxLength={50}
                  placeholder={needsAddress ? t.recipient.namePlaceholderDelivery : t.recipient.namePlaceholder}
                  className={inputClassName}
                />
                <input
                  aria-label={t.recipient.phoneAria}
                  value={value.recipientPhone}
                  onChange={(event) => setDelivery(index, "recipientPhone", event.target.value)}
                  required={needsAddress}
                  type="tel"
                  inputMode="tel"
                  pattern={PHONE_PATTERN}
                  maxLength={25}
                  placeholder={t.recipient.phonePlaceholder}
                  className={inputClassName}
                />
                {needsAddress && (
                  <input
                    aria-label={t.recipient.addressAria}
                    value={value.recipientAddress}
                    onChange={(event) => setDelivery(index, "recipientAddress", event.target.value)}
                    required
                    maxLength={200}
                    placeholder={t.recipient.addressPlaceholder}
                    className={inputClassName}
                  />
                )}
              </fieldset>
            );
          })}
          {orchid && (
            <fieldset className="space-y-2 rounded-xl bg-soft px-3 py-2.5">
              <legend className="sr-only">{t.orchidDelivery.restaurantTitle}</legend>
              <p className="text-[14px] font-bold text-ink">{t.orchidDelivery.restaurantTitle}</p>
              <input
                aria-label={t.orchidDelivery.restaurant}
                value={orchid.restaurant}
                onChange={(event) => setOrchid({ ...orchid, restaurant: event.target.value })}
                required
                maxLength={200}
                placeholder={t.orchidDelivery.restaurantOtherPlaceholder}
                className={inputClassName}
              />
              <input
                aria-label={t.orchidDelivery.reservationName}
                value={orchid.reservationName}
                onChange={(event) => setOrchid({ ...orchid, reservationName: event.target.value })}
                maxLength={50}
                placeholder={t.orchidDelivery.reservationNamePlaceholder}
                className={inputClassName}
              />
            </fieldset>
          )}
          <label className="block">
            <span className="text-[14px] font-bold text-ink">
              {l.cancel.receiptLabel} <span className="text-brand">*</span>
            </span>
            <span className="mt-0.5 block text-[12px] text-sub">{l.cancel.receiptHint}</span>
            <input
              value={typedReceipt}
              onChange={(event) => setTypedReceipt(event.target.value)}
              required
              maxLength={12}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder={l.cancel.receiptPlaceholder}
              className={`${inputClassName} mt-1 font-mono uppercase`}
            />
          </label>
          {error && <ErrorText>{error}</ErrorText>}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              className="rounded-lg border border-field bg-white py-3 text-[14px] font-semibold text-body"
            >
              {l.edit.close}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-brand py-3 text-[14px] font-bold text-white transition hover:bg-brand-dark disabled:bg-disabled"
            >
              {isPending ? l.edit.saving : l.edit.submit}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
