"use client";

import type { FormEvent } from "react";
import Field, { inputClassName } from "@/components/ui/Field";
import { PHONE_PATTERN } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import { needsColorChoice, type SelectionSummary } from "@/lib/selection";
import type { OrdererContact, ResolvedUnit } from "@/lib/units";
import type { ReceiveMethod } from "@/types/reservation";
import type { SpecialEvent } from "@/data/events";
import ColorField from "./ColorField";
import EventOrderField from "./EventOrderField";
import OrderSummary from "./OrderSummary";
import DocumentRequestField from "./DocumentRequestField";
import PaymentMethodField from "./PaymentMethodField";
import PrivacyConsentField from "./PrivacyConsentField";
import ReceiveMethodField from "./ReceiveMethodField";
import RecipientMessageField from "./RecipientMessageField";
import { RESERVATION_FORM_ID } from "./sections";
import type { UnitActions } from "./useReservation";

/**
 * 신청서 — 예약자·색감은 input name(ReservationFormField)으로, 받는 분·메시지는 상태로 관리.
 * 예약자 성함·연락처와 받는 방법은 받는 분 칸("예약자와 같음"·배송지)에 바로 쓰이므로 상태로도 둠
 */
export default function OrdererForm({
  summary,
  units,
  unitActions,
  orderer,
  onOrdererChange,
  receiveMethod,
  onReceiveMethodChange,
  event,
  forEvent,
  onForEventChange,
  onSubmit,
}: {
  summary: SelectionSummary;
  units: ResolvedUnit[];
  unitActions: UnitActions;
  orderer: OrdererContact;
  onOrdererChange: (patch: Partial<OrdererContact>) => void;
  receiveMethod: ReceiveMethod;
  onReceiveMethodChange: (value: ReceiveMethod) => void;
  /** 받는 날이 특별한 날이면 그 행사 (아니면 null) */
  event: SpecialEvent | null;
  forEvent: boolean | null;
  onForEventChange: (value: boolean) => void;
  onSubmit: (formData: FormData) => void;
}) {
  const t = useT();
  const hasOrchid = summary.items.some((item) => item.product.category === "orchid");
  const hasAddressItems = summary.items.some((item) => item.product.category !== "orchid");
  /** 토퍼를 넣을 수 있는 상품(꽃다발·꽃바구니)을 특별한 날에 담았으면 "승진식 꽃인가요?" */
  const asksForEvent = event !== null && summary.items.some((item) => event.topperCategories.includes(item.product.category));

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
          value={orderer.name}
          onChange={(event) => onOrdererChange({ name: event.target.value })}
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
          value={orderer.phone}
          onChange={(event) => onOrdererChange({ phone: event.target.value })}
          placeholder={t.reserve.phonePlaceholder}
          className={inputClassName}
        />
      </Field>

      {needsColorChoice(summary.items) && <ColorField />}

      <div className="h-px bg-line" />

      {asksForEvent && <EventOrderField event={event} value={forEvent} onChange={onForEventChange} />}

      <ReceiveMethodField
        value={receiveMethod}
        onChange={onReceiveMethodChange}
        hasOrchid={hasOrchid}
        hasAddressItems={hasAddressItems}
      />

      <RecipientMessageField units={units} actions={unitActions} receiveMethod={receiveMethod} />

      <div className="h-px bg-line" />

      <PaymentMethodField totalPrice={summary.totalPrice} />

      <div className="h-px bg-line" />

      <DocumentRequestField />

      <PrivacyConsentField />
    </form>
  );
}
