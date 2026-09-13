"use client";

import type { FormEvent } from "react";
import Field, { inputClassName } from "@/components/ui/Field";
import { PHONE_PATTERN } from "@/data/reservationOptions";
import { needsColorChoice, type SelectionSummary } from "@/lib/selection";
import type { ResolvedUnit } from "@/lib/units";
import ColorField from "./ColorField";
import OrderSummary from "./OrderSummary";
import DocumentRequestField from "./DocumentRequestField";
import PaymentMethodField from "./PaymentMethodField";
import RecipientMessageField from "./RecipientMessageField";
import { RESERVATION_FORM_ID } from "./sections";
import type { UnitActions } from "./useReservation";

const PHONE_TITLE = "연락처를 다시 확인해 주세요. (예: 010-1234-5678)";

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
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
  }

  return (
    <form id={RESERVATION_FORM_ID} onSubmit={handleSubmit} className="mt-5 space-y-6">
      <OrderSummary summary={summary} />

      <Field label="예약자 성함" htmlFor="ordererName" required>
        <input
          id="ordererName"
          name="ordererName"
          type="text"
          required
          autoComplete="name"
          placeholder="성함을 입력해 주세요"
          className={inputClassName}
        />
      </Field>

      <Field label="예약자 연락처" htmlFor="ordererPhone" required>
        <input
          id="ordererPhone"
          name="ordererPhone"
          type="tel"
          inputMode="tel"
          required
          pattern={PHONE_PATTERN}
          title={PHONE_TITLE}
          autoComplete="tel"
          placeholder="010-0000-0000"
          className={inputClassName}
        />
      </Field>

      {needsColorChoice(summary.items) && <ColorField />}

      <div className="h-px bg-line" />

      <RecipientMessageField units={units} actions={unitActions} />

      <div className="h-px bg-line" />

      <PaymentMethodField />

      <div className="h-px bg-line" />

      <DocumentRequestField />
    </form>
  );
}
