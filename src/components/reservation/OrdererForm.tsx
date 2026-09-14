"use client";

import type { FormEvent } from "react";
import Field, { inputClassName } from "@/components/ui/Field";
import { PHONE_PATTERN } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import { needsColorChoice, type SelectionSummary } from "@/lib/selection";
import type { ResolvedUnit } from "@/lib/units";
import ColorField from "./ColorField";
import OrderSummary from "./OrderSummary";
import DocumentRequestField from "./DocumentRequestField";
import OrchidDeliveryField from "./OrchidDeliveryField";
import PaymentMethodField from "./PaymentMethodField";
import RecipientMessageField from "./RecipientMessageField";
import { RESERVATION_FORM_ID } from "./sections";
import type { UnitActions } from "./useReservation";

/** 신청서 — 예약자·색감은 input name(ReservationFormField)으로, 받는 분·메시지는 상태로 관리 */
export default function OrdererForm({
  summary,
  units,
  unitActions,
  onSubmit,
}: {
  summary: SelectionSummary;
  units: ResolvedUnit[];
  unitActions: UnitActions;
  onSubmit: (formData: FormData) => void;
}) {
  const t = useT();
  const hasOrchid = summary.items.some((item) => item.product.category === "orchid");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
  }

  return (
    <form id={RESERVATION_FORM_ID} onSubmit={handleSubmit} className="mt-5 space-y-6">
      <OrderSummary summary={summary} />

      <Field label={t.reserve.ordererName} htmlFor="ordererName" required>
        <input
          id="ordererName"
          name="ordererName"
          type="text"
          required
          autoComplete="name"
          placeholder={t.reserve.ordererNamePlaceholder}
          className={inputClassName}
        />
      </Field>

      <Field label={t.reserve.ordererPhone} htmlFor="ordererPhone" required>
        <input
          id="ordererPhone"
          name="ordererPhone"
          type="tel"
          inputMode="tel"
          required
          pattern={PHONE_PATTERN}
          title={t.reserve.phoneTitle}
          autoComplete="tel"
          placeholder={t.reserve.phonePlaceholder}
          className={inputClassName}
        />
      </Field>

      {needsColorChoice(summary.items) && <ColorField />}

      {hasOrchid && <OrchidDeliveryField />}

      <div className="h-px bg-line" />

      <RecipientMessageField units={units} actions={unitActions} />

      <div className="h-px bg-line" />

      <PaymentMethodField totalPrice={summary.totalPrice} />

      <div className="h-px bg-line" />

      <DocumentRequestField />
    </form>
  );
}
