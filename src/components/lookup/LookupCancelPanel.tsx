"use client";

import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { inputClassName } from "@/components/ui/Field";
import { businessInfo } from "@/data/shop";
import { useLookupT } from "@/hooks/useLookupT";
import { getCustomerCancelOption, REFUND_TEXT_MAX } from "@/lib/customerLookup";
import { cancelReservationByCustomer } from "@/server/actions/lookup";
import type { CustomerReservationView } from "@/types/reservation";

/**
 * 예약 조회 화면 아래 "예약 취소"
 * 입금 전: 바로 취소 / "이미 입금했어요" → 취소 요청 · 입금 후: 취소 요청 · 제작 완료 이후: 전화 안내
 */
export default function LookupCancelPanel({
  reservation,
  phone,
  onChange,
}: {
  reservation: CustomerReservationView;
  /** 조회할 때 넣은 연락처 — 취소할 때 서버에서 다시 확인 */
  phone: string;
  onChange: (reservation: CustomerReservationView, done: "canceled" | "requested") => void;
}) {
  const l = useLookupT();
  const option = getCustomerCancelOption(reservation.status, reservation.cancelRequestedAt !== null);
  const [open, setOpen] = useState(false);
  const [paid, setPaid] = useState<boolean | null>(option === "request" ? true : null);
  const [refund, setRefund] = useState({ bank: "", account: "", holder: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const telLink = (
    <a
      href={`tel:${businessInfo.phone.replaceAll("-", "")}`}
      className="mt-2 inline-flex rounded-lg border border-field bg-white px-3 py-2 text-[14px] font-bold text-brand-dark"
    >
      📞 {l.cancel.call}
    </a>
  );

  if (option === "none") return null;
  if (option === "requested" || option === "call") {
    return (
      <section className="rounded-2xl border border-line px-4 py-3">
        <h2 className="text-[13px] font-bold text-sub">{l.cancel.title}</h2>
        <p className="mt-1 text-[14px] text-body">{option === "requested" ? l.cancel.requestedInfo : l.cancel.callInfo}</p>
        {telLink}
      </section>
    );
  }

  const method = reservation.request.paymentMethod;
  const sendsRequest = paid === true;
  const needsAccount = sendsRequest && method === "bank";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (paid === null || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await cancelReservationByCustomer({
        receipt: reservation.receiptNumber,
        phone,
        alreadyPaid: paid,
        refund,
      });
      if (!result.ok) {
        setError(l.errors[result.code]);
        return;
      }
      onChange(result.reservation, result.reservation.status === "canceled" ? "canceled" : "requested");
    });
  };

  const field = (key: keyof typeof refund, label: string, placeholder: string, inputMode?: "numeric") => (
    <label className="block">
      <span className="text-[13px] font-semibold text-body">{label}</span>
      <input
        value={refund[key]}
        onChange={(event) => setRefund((current) => ({ ...current, [key]: event.target.value }))}
        required
        maxLength={key === "account" ? 30 : REFUND_TEXT_MAX}
        inputMode={inputMode}
        pattern={key === "account" ? "[0-9\\-\\s]{6,30}" : undefined}
        placeholder={placeholder}
        className={`${inputClassName} mt-1`}
      />
    </label>
  );

  return (
    <section className="rounded-2xl border border-line px-4 py-3">
      <h2 className="text-[13px] font-bold text-sub">{l.cancel.title}</h2>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 w-full rounded-lg border border-danger/50 bg-white py-3 text-[14px] font-bold text-danger"
        >
          {l.cancel.open}
        </button>
      ) : (
        <form onSubmit={submit} className="mt-2 space-y-3">
          {option === "cancel" ? (
            <fieldset>
              <legend className="text-[14px] font-bold text-ink">
                {l.cancel.paidQuestion[method]} <span className="text-brand">*</span>
              </legend>
              <div className="mt-2 grid gap-2">
                {[
                  { value: false, label: l.cancel.notPaid[method], hint: l.cancel.notPaidHint },
                  { value: true, label: l.cancel.paid[method], hint: l.cancel.paidHint },
                ].map((choice) => (
                  <label
                    key={String(choice.value)}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 ${
                      paid === choice.value ? "border-brand bg-brand-tint" : "border-field"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paid"
                      required
                      checked={paid === choice.value}
                      onChange={() => setPaid(choice.value)}
                      className="mt-1 accent-brand"
                    />
                    <span>
                      <span
                        className={`block text-[14px] font-semibold ${paid === choice.value ? "text-brand-dark" : "text-body"}`}
                      >
                        {choice.label}
                      </span>
                      <span className="block text-[12px] text-sub">{choice.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="rounded-lg bg-brand-tint px-3 py-2 text-[13px] font-semibold text-brand-dark">
              {l.cancel.confirmedNote[method]}
            </p>
          )}

          {needsAccount && (
            <div className="space-y-2 rounded-xl bg-soft p-3">
              <p className="text-[14px] font-bold text-ink">{l.cancel.refundTitle}</p>
              <p className="rounded-lg bg-white px-3 py-2 text-[13px] font-semibold text-danger">⚠️ {l.cancel.refundWarning}</p>
              {field("bank", l.cancel.refundBank, l.cancel.refundBankPlaceholder)}
              {field("account", l.cancel.refundAccount, l.cancel.refundAccountPlaceholder, "numeric")}
              {field("holder", l.cancel.refundHolder, l.cancel.refundHolderPlaceholder)}
              <p className="text-[12px] text-sub">{l.cancel.refundPrivacy}</p>
            </div>
          )}
          {sendsRequest && method === "card" && <p className="text-[13px] text-body">{l.cancel.cardRefund}</p>}
          {sendsRequest && method === "paypal" && <p className="text-[13px] text-body">{l.cancel.paypalRefund}</p>}

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
              {l.cancel.close}
            </button>
            <button
              type="submit"
              disabled={paid === null || isPending}
              className="rounded-lg bg-danger py-3 text-[14px] font-bold text-white disabled:bg-disabled"
            >
              {isPending ? l.cancel.sending : sendsRequest ? l.cancel.submitRequest : l.cancel.submitCancel}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
