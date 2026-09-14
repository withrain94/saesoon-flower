"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { inputClassName } from "@/components/ui/Field";
import { PHONE_PATTERN } from "@/data/reservationOptions";
import { useLookupT } from "@/hooks/useLookupT";
import { lookupReservation } from "@/server/actions/lookup";
import type { CustomerReservationView } from "@/types/reservation";
import LookupCancelPanel from "./LookupCancelPanel";
import LookupReservationDetails from "./LookupReservationDetails";

/** 손님 예약 조회 — 접수번호 + 예약자 연락처 → 예약 내용 + 취소 */
export default function ReservationLookup({ initialReceipt }: { initialReceipt: string }) {
  const l = useLookupT();
  const [receipt, setReceipt] = useState(initialReceipt);
  const [phone, setPhone] = useState("");
  const [reservation, setReservation] = useState<CustomerReservationView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"canceled" | "requested" | null>(null);
  const [isPending, startTransition] = useTransition();

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setDone(null);
    startTransition(async () => {
      try {
        const result = await lookupReservation(receipt, phone);
        if (result.ok) setReservation(result.reservation);
        else setError(l.errors[result.code]);
      } catch {
        setError(l.errors.failed);
      }
    });
  };

  return (
    <div className="px-5 pb-10 pt-5">
      <Link href="/" className="text-[14px] font-semibold text-brand-dark hover:underline">
        {l.backToReservation}
      </Link>
      <h1 className="mt-3 text-[24px] font-extrabold text-ink">{l.pageTitle}</h1>

      {!reservation ? (
        <form onSubmit={search} className="mt-4 space-y-3">
          <p className="text-[14px] text-body">{l.intro}</p>
          <label className="block">
            <span className="text-[14px] font-bold text-ink">{l.receiptLabel}</span>
            <input
              value={receipt}
              onChange={(event) => setReceipt(event.target.value)}
              required
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={12}
              placeholder={l.receiptPlaceholder}
              className={`${inputClassName} mt-1 uppercase`}
            />
          </label>
          <label className="block">
            <span className="text-[14px] font-bold text-ink">{l.phoneLabel}</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              pattern={PHONE_PATTERN}
              placeholder={l.phonePlaceholder}
              className={`${inputClassName} mt-1`}
            />
          </label>
          {error && <ErrorText>{error}</ErrorText>}
          <button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-lg bg-brand text-[15px] font-bold text-white transition hover:bg-brand-dark disabled:bg-disabled"
          >
            {isPending ? l.searching : l.submit}
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-3">
          {done && (
            <p role="status" className="rounded-xl bg-brand px-4 py-3 text-[14px] font-bold text-white">
              {done === "canceled" ? l.cancel.canceledDone : l.cancel.requestedDone}
            </p>
          )}
          <LookupReservationDetails reservation={reservation} />
          <LookupCancelPanel
            key={`${reservation.status}-${reservation.cancelRequestedAt}`}
            reservation={reservation}
            phone={phone}
            onChange={(next, result) => {
              setReservation(next);
              setDone(result);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          <button
            type="button"
            onClick={() => {
              setReservation(null);
              setPhone("");
              setDone(null);
            }}
            className="w-full rounded-lg border border-field bg-white py-3 text-[14px] font-semibold text-body"
          >
            {l.otherReservation}
          </button>
        </div>
      )}
    </div>
  );
}
