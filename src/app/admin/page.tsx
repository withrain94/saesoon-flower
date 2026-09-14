import AdminHeader from "@/components/admin/AdminHeader";
import ReservationListItem from "@/components/admin/ReservationListItem";
import StatusFilterTabs from "@/components/admin/StatusFilterTabs";
import { getStatusFilter } from "@/data/reservationStatus";
import { formatAdminDate } from "@/lib/adminFormat";
import { addDaysToKey } from "@/lib/date";
import { toNowInTimeZone } from "@/lib/time";
import { requireAdmin } from "@/server/auth";
import { countReservationsByStatus, listReservations } from "@/server/reservations";
import type { StoredReservation } from "@/types/reservation";

/** 받는 날짜별로 묶기 (목록 순서 유지) */
function groupByDate(reservations: StoredReservation[]) {
  const groups = new Map<string, StoredReservation[]>();
  for (const reservation of reservations) {
    const list = groups.get(reservation.request.date) ?? [];
    list.push(reservation);
    groups.set(reservation.request.date, list);
  }
  return [...groups];
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const email = await requireAdmin();
  const { status } = await searchParams;
  const filter = getStatusFilter(typeof status === "string" ? status : undefined);

  const result = await Promise.all([
    listReservations({ statuses: filter.statuses, newestFirst: filter.newestFirst }),
    countReservationsByStatus(),
  ]).catch(() => null);

  // 서버 시계가 UTC여도 "오늘"은 한국 날짜 기준
  const today = toNowInTimeZone(new Date()).dateKey;
  const tomorrow = addDaysToKey(today, 1);

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <StatusFilterTabs activeId={filter.id} counts={result?.[1] ?? null} />

        {!result ? (
          <p className="mt-6 rounded-xl bg-white px-4 py-5 text-[14px] text-danger">
            예약을 불러오지 못했어요. Supabase에 reservations 표가 만들어졌는지 확인하고 새로고침해 주세요.
          </p>
        ) : result[0].length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-sub">{filter.label} 예약이 없어요.</p>
        ) : (
          <div className="mt-4 space-y-5">
            {groupByDate(result[0]).map(([dateKey, reservations]) => (
              <section key={dateKey}>
                <h2
                  className={`mb-2 flex items-baseline gap-2 px-1 text-[15px] font-extrabold ${
                    dateKey < today ? "text-sub" : "text-ink"
                  }`}
                >
                  {dateKey === today && <span className="text-brand-dark">오늘</span>}
                  {dateKey === tomorrow && <span className="text-brand-dark">내일</span>}
                  {formatAdminDate(dateKey)}
                  <span className="text-[12px] font-semibold text-sub">{reservations.length}건</span>
                </h2>
                <ul className="space-y-2">
                  {reservations.map((reservation) => (
                    <li key={reservation.id}>
                      <ReservationListItem reservation={reservation} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
