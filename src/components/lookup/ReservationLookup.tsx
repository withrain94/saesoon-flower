"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { inputClassName } from "@/components/ui/Field";
import { PHONE_PATTERN } from "@/data/reservationOptions";
import { useLookupT } from "@/hooks/useLookupT";
import { lookupReservations } from "@/server/actions/lookup";
import type { CustomerReservationView } from "@/types/reservation";
import LookupCancelPanel from "./LookupCancelPanel";
import LookupReservationDetails from "./LookupReservationDetails";
import LookupResultList from "./LookupResultList";

/** 손님 예약 조회 — 예약자 이름 + 연락처 → (여러 건이면 목록) → 예약 내용 + 취소 */
export default function ReservationLookup() {
  const l = useLookupT();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  /** null = 아직 조회 전 */
  const [results, setResults] = useState<CustomerReservationView[] | null>(null);
  /** 자세히 보는 예약의 접수번호 (결과가 1건이면 바로 그 예약) */
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"canceled" | "requested" | null>(null);
  const [isPending, startTransition] = useTransition();

  const reservation = results?.find((item) => item.receiptNumber === selected) ?? null;

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setDone(null);
    startTransition(async () => {
      try {
        const result = await lookupReservations(name, phone);
        if (result.ok) {
          setResults(result.reservations);
          setSelected(result.reservations.length === 1 ? result.reservations[0].receiptNumber : null);
        } else {
          setError(l.errors[result.code]);
        }
      } catch {
        setError(l.errors.failed);
      }
    });
  };

  const reset = () => {
    setResults(null);
    setSelected(null);
    setPhone("");
    setDone(null);
  };

  const otherButton = (
    <button
      type="button"
      onClick={reset}
      className="w-full rounded-lg border border-field bg-white py-3 text-[14px] font-semibold text-body"
    >
      {l.otherReservation}
    </button>
  );

  return (
    <div className="px-5 pb-10 pt-5">
      <Link href="/" className="text-[14px] font-semibold text-brand-dark hover:underline">
        {l.backToReservation}
      </Link>
      <h1 className="mt-3 text-[24px] font-extrabold text-ink">{l.pageTitle}</h1>

      {results === null ? (
        <form onSubmit={search} className="mt-4 space-y-3">
          <p className="text-[14px] text-body">{l.intro}</p>
          <label className="block">
            <span className="text-[14px] font-bold text-ink">{l.nameLabel}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="name"
              maxLength={50}
              placeholder={l.namePlaceholder}
              className={`${inputClassName} mt-1`}
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
      ) : reservation === null ? (
        <div className="mt-4 space-y-3">
          <LookupResultList
            reservations={results}
            onSelect={(receiptNumber) => {
              setSelected(receiptNumber);
              setDone(null);
              window.scrollTo({ top: 0 });
            }}
          />
          {otherButton}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {results.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setDone(null);
              }}
              className="text-[14px] font-semibold text-brand-dark hover:underline"
            >
              {l.backToList}
            </button>
          )}
          {done && (
            <p role="status" className="rounded-xl bg-brand px-4 py-3 text-[14px] font-bold text-white">
              {done === "canceled" ? l.cancel.canceledDone : l.cancel.requestedDone}
            </p>
          )}
          <LookupReservationDetails reservation={reservation} />
          <LookupCancelPanel
            key={`${reservation.receiptNumber}-${reservation.status}-${reservation.cancelRequestedAt}`}
            reservation={reservation}
            name={name}
            phone={phone}
            onChange={(next, result) => {
              setResults((current) =>
                (current ?? []).map((item) => (item.receiptNumber === next.receiptNumber ? next : item)),
              );
              setDone(result);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          {otherButton}
        </div>
      )}
    </div>
  );
}
