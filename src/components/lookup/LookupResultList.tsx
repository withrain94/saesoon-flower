"use client";

import { ChevronIcon } from "@/components/ui/icons";
import { useLookupT } from "@/hooks/useLookupT";
import { useT } from "@/hooks/useLocale";
import { parseDateKey } from "@/lib/date";
import { getSlotHour } from "@/lib/time";
import type { CustomerReservationView } from "@/types/reservation";

/** 같은 예약자 이름·연락처로 찾은 예약이 여러 건일 때 — 하나를 눌러 자세히 보기·취소 */
export default function LookupResultList({
  reservations,
  onSelect,
}: {
  reservations: CustomerReservationView[];
  onSelect: (receiptNumber: string) => void;
}) {
  const t = useT();
  const l = useLookupT();

  return (
    <div>
      <p className="text-[16px] font-bold text-ink">{l.resultsTitle(reservations.length)}</p>
      <p className="mt-0.5 text-[13px] text-sub">{l.resultsHint}</p>
      <ul className="mt-3 space-y-2">
        {reservations.map(({ receiptNumber, status, cancelRequestedAt, request }) => {
          const date = parseDateKey(request.date);
          const canceled = status === "canceled";
          const items = request.items
            .map(
              (item) =>
                `${t.format.itemName(t.categories[item.category].name, t.format.priceShort(item.price))} × ${item.quantity}`,
            )
            .join(", ");
          return (
            <li key={receiptNumber}>
              <button
                type="button"
                onClick={() => onSelect(receiptNumber)}
                className="flex w-full items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-left transition hover:border-brand"
              >
                <span className="min-w-0 flex-1">
                  <span className={`block text-[15px] font-extrabold ${canceled ? "text-sub" : "text-ink"}`}>
                    {t.format.dateLong(date.getMonth() + 1, date.getDate(), date.getDay())}{" "}
                    {t.format.time(getSlotHour(request.time))}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-body">{items}</span>
                  <span
                    className={`mt-0.5 block text-[12px] font-semibold ${
                      canceled ? "text-sub" : cancelRequestedAt ? "text-danger" : "text-brand-dark"
                    }`}
                  >
                    {cancelRequestedAt && !canceled ? l.cancelRequested : l.status[status]}
                  </span>
                </span>
                <ChevronIcon direction="right" className="h-4 w-4 shrink-0 text-sub" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
