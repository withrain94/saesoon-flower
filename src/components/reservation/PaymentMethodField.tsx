"use client";

import { useState } from "react";
import { inputClassName } from "@/components/ui/Field";
import {
  cardPayerTypes,
  cashReceiptOptions,
  paymentMethodOptions,
} from "@/data/reservationOptions";
import { DEFAULT_LOCALE } from "@/i18n";
import { useLocale, useT } from "@/hooks/useLocale";
import { getPaypalAmount, getPaypalFee, PAYPAL_FEE_PERCENT } from "@/lib/payment";
import type { CardPayerType, CashReceiptType, PaymentMethod } from "@/types/reservation";
import BankAccountCard from "./BankAccountCard";
import { scrollToNaverLinks } from "./sections";

/**
 * 결제 방법 + 방법별 안내.
 * input name: paymentMethod
 *   / (계좌이체) cashReceiptType, cashReceiptNumber
 *   / (카드 결제) cardPayer, cardPayerContact
 *   / (PayPal) paypalEmail
 */
export default function PaymentMethodField({ totalPrice }: { totalPrice: number }) {
  const t = useT();
  const locale = useLocale();
  const [method, setMethod] = useState<PaymentMethod>(paymentMethodOptions[0].value);
  // 외국어 화면이면 해외 결제(PayPal) 안내를 결제 방법 위에 크게
  const foreign = locale !== DEFAULT_LOCALE;

  return (
    <fieldset>
      <legend className="text-[15px] font-bold text-ink">
        {t.payment.legend} <span className="text-brand">*</span>
      </legend>

      {foreign && method !== "paypal" && (
        <div className="mt-2 rounded-xl border border-brand bg-brand-tint px-4 py-3">
          <p className="text-[14px] font-bold text-brand-dark">🌏 {t.payment.overseasTitle}</p>
          <p className="mt-0.5 text-[13px] text-body">{t.payment.overseasBody}</p>
          <button
            type="button"
            onClick={() => setMethod("paypal")}
            className="mt-2 rounded-lg bg-brand px-3 py-1.5 text-[13px] font-bold text-white transition hover:bg-brand-dark"
          >
            {t.payment.methods.paypal.label} ›
          </button>
        </div>
      )}

      <div className="mt-2 grid grid-cols-3 gap-2">
        {paymentMethodOptions.map(({ value }) => {
          const active = value === method;
          return (
            <label
              key={value}
              className={`cursor-pointer rounded-xl border px-1.5 py-2.5 text-center transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
                active ? "border-brand bg-brand text-white" : "border-field bg-white text-ink hover:border-brand"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={value}
                checked={active}
                onChange={() => setMethod(value)}
                className="sr-only"
              />
              <span className="block text-[15px] font-bold leading-snug">{t.payment.methods[value].label}</span>
              <span className={`mt-0.5 block text-[11px] leading-snug ${active ? "text-white/85" : "text-sub"}`}>
                {t.payment.methods[value].description}
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
              {t.payment.cardGuide.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
            <CardPayerField />
          </>
        )}

        {method === "paypal" && <PaypalField totalPrice={totalPrice} />}
      </div>

      {!foreign && (
        <p className="mt-2 px-1 text-[12.5px] text-sub">
          🌏 {t.payment.overseasTitle} {t.payment.overseasBody}
        </p>
      )}

      <p className="mt-2 flex flex-wrap items-center gap-x-1 px-1 text-[12.5px] text-sub">
        {t.payment.naverNote}
        <button
          type="button"
          onClick={scrollToNaverLinks}
          className="font-semibold text-brand-dark underline underline-offset-2"
        >
          {t.payment.naverLink}
        </button>
      </p>
    </fieldset>
  );
}

/** PayPal — 수수료를 더한 결제 금액 + 결제 요청 받을 이메일 */
function PaypalField({ totalPrice }: { totalPrice: number }) {
  const t = useT();

  return (
    <>
      <ul className="space-y-1 rounded-xl bg-white px-4 py-3 text-sm text-body">
        {t.payment.paypalGuide.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
      <dl className="rounded-xl bg-white px-4 py-3 text-[14px]">
        <div className="flex justify-between gap-3">
          <dt className="text-sub">{t.payment.paypalProducts}</dt>
          <dd className="text-body">{t.format.price(totalPrice)}</dd>
        </div>
        <div className="mt-1 flex justify-between gap-3">
          <dt className="text-sub">{t.payment.paypalFee(PAYPAL_FEE_PERCENT)}</dt>
          <dd className="text-body">+{t.format.price(getPaypalFee(totalPrice))}</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-line pt-2">
          <dt className="font-bold text-ink">{t.payment.paypalTotal}</dt>
          <dd className="text-[17px] font-bold text-brand-dark">{t.format.price(getPaypalAmount(totalPrice))}</dd>
        </div>
      </dl>
      <label className="block rounded-xl bg-white px-4 py-3">
        <span className="text-[14px] font-bold text-ink">{t.payment.paypalEmail}</span>
        <input
          name="paypalEmail"
          type="email"
          required
          autoComplete="email"
          placeholder={t.payment.paypalEmailPlaceholder}
          className={`${inputClassName} mt-2`}
        />
      </label>
    </>
  );
}

/** 카드 결제하실 분 연락처 — 예약자와 다르면 직접 적는 칸이 열림 */
function CardPayerField() {
  const t = useT();
  const [payer, setPayer] = useState<CardPayerType>(cardPayerTypes[0]);

  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-[14px] font-bold text-ink">{t.payment.cardPayerTitle}</p>
      <p className="mt-0.5 text-[12.5px] text-sub">{t.payment.cardPayerDescription}</p>
      <div role="radiogroup" aria-label={t.payment.cardPayerTitle} className="mt-2 grid gap-1.5">
        {cardPayerTypes.map((value, index) => {
          const active = value === payer;
          return (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border px-3 py-2.5 text-left text-[14px] font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
                active ? "border-brand bg-brand-tint text-brand-dark" : "border-field text-body hover:border-brand"
              }`}
            >
              <input
                type="radio"
                name="cardPayer"
                value={value}
                checked={active}
                onChange={() => setPayer(value)}
                className="sr-only"
              />
              {index + 1}. {t.payment.cardPayerOptions[value]}
            </label>
          );
        })}
      </div>

      {payer === "other" && (
        <textarea
          name="cardPayerContact"
          rows={2}
          required
          aria-label={t.payment.cardPayerAria}
          placeholder={t.payment.cardPayerPlaceholder}
          className={`${inputClassName} mt-2 h-auto resize-none py-3 leading-relaxed`}
        />
      )}
    </div>
  );
}

/** 현금영수증 (소득공제·지출증빙) — 계좌이체일 때만 보임 */
function CashReceiptField() {
  const t = useT();
  const [type, setType] = useState<CashReceiptType>(cashReceiptOptions[0].value);
  const selected = cashReceiptOptions.find((option) => option.value === type);

  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-[14px] font-bold text-ink">{t.payment.cashReceiptTitle}</p>
      <div role="radiogroup" aria-label={t.payment.cashReceiptTitle} className="mt-2 grid grid-cols-3 gap-1.5">
        {cashReceiptOptions.map((option) => {
          const active = option.value === type;
          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-lg border px-1 py-2 text-center text-[13px] font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
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
              {t.payment.cashReceiptOptions[option.value]}
            </label>
          );
        })}
      </div>

      {selected?.input && selected.value !== "none" && (
        <input
          key={selected.value}
          name="cashReceiptNumber"
          type="text"
          required
          inputMode={selected.input.inputMode}
          pattern={selected.input.pattern}
          title={t.payment.cashReceiptInputs[selected.value].title}
          aria-label={t.payment.cashReceiptNumberAria(t.payment.cashReceiptOptions[selected.value])}
          placeholder={t.payment.cashReceiptInputs[selected.value].placeholder}
          className={`${inputClassName} mt-2`}
        />
      )}
    </div>
  );
}
