import Link from "next/link";
import { adminStatusFilters } from "@/data/reservationStatus";
import type { ReservationStatus } from "@/types/reservation";

/** 목록 위 상태 필터 — 주소(?status=)로 바뀌므로 새로고침·뒤로가기에도 유지 */
export default function StatusFilterTabs({
  activeId,
  counts,
}: {
  activeId: string;
  counts: Record<ReservationStatus, number> | null;
}) {
  return (
    <nav aria-label="예약 상태" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1.5 whitespace-nowrap">
        {adminStatusFilters.map((filter) => {
          const active = filter.id === activeId;
          const count =
            counts &&
            (filter.statuses ?? (Object.keys(counts) as ReservationStatus[])).reduce(
              (sum, status) => sum + counts[status],
              0,
            );
          return (
            <li key={filter.id}>
              <Link
                href={filter.id === adminStatusFilters[0].id ? "/admin" : `/admin?status=${filter.id}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-field bg-white text-body hover:border-brand"
                }`}
              >
                {filter.label}
                {count !== null && (
                  <span className={active ? "text-white/80" : "text-sub"}>{count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
