"use client";

import { useState } from "react";
import { inputClassName } from "@/components/ui/Field";
import {
  CARD_PAYER_GUIDE,
  CARD_PAYMENT_GUIDE,
  cardPayerOptions,
  cashReceiptOptions,
  NAVER_BOOKING_GUIDE,
  paymentMethodOptions,
} from "@/data/reservationOptions";
import type { CardPayerType, CashReceiptType, PaymentMethod } from "@/types/reservation";
import BankAccountCard from "./BankAccountCard";
import { scrollToNaverLinks } from "./sections";

/**
 * 결제 방법 + 방법별 안내.
 * input name: paymentMethod
 *   / (계좌이체) cashReceiptType, cashReceiptNumber
 *   / (카드 결제) cardPayer, cardPayerContact
 */
export default function PaymentMethodField() {
  const [method, setMethod] = useState<PaymentMethod>(paymentMethodOptions[0].value);

  return (
    <fieldset>
      <legend className="text-[15px] font-bold text-ink">
        결제 방법 <span className="text-brand">*</span>
      </legend>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {paymentMethodOptions.map((option) => {
          const active = option.value === method;
          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border px-2 py-2.5 text-center transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
                active ? "border-brand bg-brand text-white" : "border-field bg-white text-ink hover:border-brand"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={active}
                onChange={() => setMethod(option.value)}
                className="sr-only"
              />
              <span className="block text-[15px] font-bold">{option.label}</span>
              <span className={`mt-0.5 block text-[11.5px] ${active ? "text-white/85" : "text-sub"}`}>
                {option.description}
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-3 space-y-3 rounded-2xl bg-panel p-3">
        {method === "bank" && (
          <>
            <BankAccountCard />
            <CashReceiptField />
          </>
        )}

        {method === "card" && (
          <>
            <ul className="space-y-1 rounded-xl bg-white px-4 py-3 text-sm text-body">
              {CARD_PAYMENT_GUIDE.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
            <CardPayerField />
          </>
        )}
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-x-1 px-1 text-[12.5px] text-sub">
        {NAVER_BOOKING_GUIDE.paymentNote}
        <button
          type="button"
          onClick={scrollToNaverLinks}
          className="font-semibold text-brand-dark underline underline-offset-2"
        >
          네이버 예약 바로가기 ›
        </button>
      </p>
    </fieldset>
  );
}

/** 카드 결제하실 분 연락처 — 예약자와 다르면 직접 적는 칸이 열림 */
function CardPayerField() {
  const [payer, setPayer] = useState<CardPayerType>(cardPayerOptions[0].value);

  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-[14px] font-bold text-ink">{CARD_PAYER_GUIDE.title}</p>
      <p className="mt-0.5 text-[12.5px] text-sub">{CARD_PAYER_GUIDE.description}</p>
      <div role="radiogroup" aria-label={CARD_PAYER_GUIDE.title} className="mt-2 grid gap-1.5">
        {cardPayerOptions.map((option, index) => {
          const active = option.value === payer;
          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-lg border px-3 py-2.5 text-left text-[14px] font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
                active ? "border-brand bg-brand-tint text-brand-dark" : "border-field text-body hover:border-brand"
              }`}
            >
              <input
                type="radio"
                name="cardPayer"
                value={option.value}
                checked={active}
                onChange={() => setPayer(option.value)}
                className="sr-only"
              />
              {index + 1}. {option.label}
            </label>
          );
        })}
      </div>

      {payer === "other" && (
        <textarea
          name="cardPayerContact"
          rows={2}
          required
          aria-label="카드 결제하실 분 성함·연락처"
          placeholder={CARD_PAYER_GUIDE.placeholder}
          className={`${inputClassName} mt-2 h-auto resize-none py-3 leading-relaxed`}
        />
      )}
    </div>
  );
}

/** 현금영수증 (소득공제·지출증빙) — 계좌이체일 때만 보임 */
function CashReceiptField() {
  const [type, setType] = useState<CashReceiptType>(cashReceiptOptions[0].value);
  const selected = cashReceiptOptions.find((option) => option.value === type);

  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-[14px] font-bold text-ink">현금영수증</p>
      <div role="radiogroup" aria-label="현금영수증" className="mt-2 grid grid-cols-3 gap-1.5">
        {cashReceiptOptions.map((option) => {
          const active = option.value === type;
          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-lg border py-2 text-center text-[13px] font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
                active ? "border-brand bg-brand-tint text-brand-dark" : "border-field text-body hover:border-brand"
              }`}
            >
              <input
                type="radio"
                name="cashReceiptType"
                value={option.value}
                checked={active}
                onChange={() => setType(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>

      {selected?.input && (
        <input
          key={selected.value}
          name="cashReceiptNumber"
          type="text"
          required
          inputMode={selected.input.inputMode}
          pattern={selected.input.pattern}
          title={selected.input.title}
          aria-label={`${selected.label} 번호`}
          placeholder={selected.input.placeholder}
          className={`${inputClassName} mt-2`}
        />
      )}
    </div>
  );
}
