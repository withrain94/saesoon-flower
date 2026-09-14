import Link from "next/link";
import { ko } from "@/i18n/ko";
import { formatAdminDateTime, formatAdminTime, localeNames, summarizeItems } from "@/lib/adminFormat";
import type { StoredReservation } from "@/types/reservation";
import StatusBadge from "./StatusBadge";

/** 목록의 예약 한 건 — 누르면 상세 */
export default function ReservationListItem({ reservation }: { reservation: StoredReservation }) {
  const { request } = reservation;
  const tags = [
    request.documents.length > 0 && "서류 요청",
    request.orchidDelivery?.method === "restaurant" && "식당 배송",
    request.locale && request.locale !== "ko" && localeNames[request.locale],
    reservation.adminMemo && "메모",
  ].filter(Boolean);

  return (
    <Link
      href={`/admin/${reservation.id}`}
      className={`block rounded-xl border border-line bg-white px-4 py-3 transition hover:border-brand ${
        reservation.status === "canceled" ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[16px] font-extrabold text-ink">
          {formatAdminTime(request.time)}
          <span className="ml-2 text-[15px] font-bold text-body">{request.ordererName}</span>
        </p>
        <StatusBadge status={reservation.status} />
      </div>
      <p className="mt-1 text-[14px] text-body">{summarizeItems(request)}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-sub">
        <span className="font-semibold text-strong">{ko.format.price(request.totalPrice)}</span>
        <span>{ko.payment.methods[request.paymentMethod].label}</span>
        <span>접수 {formatAdminDateTime(reservation.createdAt)}</span>
        {tags.map((tag) => (
          <span key={String(tag)} className="rounded bg-soft px-1.5 py-0.5 text-body">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
