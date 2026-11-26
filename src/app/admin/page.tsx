import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import ReservationListItem from "@/components/admin/ReservationListItem";
import StatusFilterTabs from "@/components/admin/StatusFilterTabs";
import { getStatusFilter } from "@/data/reservationStatus";
import { formatAdminDate } from "@/lib/adminFormat";
import { AUTO_DELIVERED_AFTER_DAYS, autoDeliveredCutoffKey } from "@/lib/autoStatus";
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

/** "진행 중"에서 숨긴 지난 예약 안내 */
function HiddenNotice({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <p className="mt-3 px-1 text-[12.5px] text-sub">
      받는 날로부터 {AUTO_DELIVERED_AFTER_DAYS}일이 지난 예약 {count}건은 숨겼어요 ·{" "}
      <Link href="/admin?status=all" className="font-semibold text-brand-dark underline">
        전체에서 보기
      </Link>
    </p>
  );
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

  // "진행 중"에서는 받는 날로부터 7일이 지난 예약을 숨김 (2026-11-26 사용자 요청 — 입금 전이라 자동 전달 완료가 안 된 예약)
  // 상태는 그대로라 "접수"·"전체" 탭에서는 보임
  const cutoff = autoDeliveredCutoffKey(today);
  const allListed = result?.[0] ?? [];
  const listed = filter.id === "active" ? allListed.filter((r) => r.request.date > cutoff) : allListed;
  const hiddenCount = allListed.length - listed.length;

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <StatusFilterTabs activeId={filter.id} counts={result?.[1] ?? null} hiddenActiveCount={hiddenCount} />

        {/* 백업 — 가끔 눌러서 예약 전체를 PC에 저장해 두면 DB에 문제가 생겨도 내용이 남음 */}
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5">
          <p className="text-[12.5px] text-sub">예약 자료를 PC에 저장해 두세요 (엑셀 파일)</p>
          <a
            href="/admin/export"
            download
            className="shrink-0 rounded-lg border border-field bg-white px-3 py-1.5 text-[13px] font-semibold text-brand-dark transition hover:border-brand"
          >
            ⬇ 예약 전체 내려받기
          </a>
        </div>
        <Link
          href="/admin/cash-receipts"
          className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 text-[13.5px] font-semibold text-ink transition hover:text-brand-dark"
        >
          🧾 현금영수증 신청 내역 (달별 · 발급 체크)
          <span className="text-sub">›</span>
        </Link>
        <Link
          href="/admin/photos"
          className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 text-[13.5px] font-semibold text-ink transition hover:text-brand-dark"
        >
          🖼 사진 관리 (올리기 · 지우기 · 순서 · 대표 사진)
          <span className="text-sub">›</span>
        </Link>

        {!result ? (
          <p className="mt-6 rounded-xl bg-white px-4 py-5 text-[14px] text-danger">
            예약을 불러오지 못했어요. Supabase에 reservations 표가 만들어졌는지 확인하고 새로고침해 주세요.
          </p>
        ) : listed.length === 0 ? (
          <>
            <HiddenNotice count={hiddenCount} />
            <p className="mt-10 text-center text-[14px] text-sub">{filter.label} 예약이 없어요.</p>
          </>
        ) : (
          <div className="mt-4 space-y-5">
            <HiddenNotice count={hiddenCount} />
            {groupByDate(listed).map(([dateKey, reservations]) => (
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
