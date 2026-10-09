import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import CashReceiptIssuedCheckbox from "@/components/admin/CashReceiptIssuedCheckbox";
import StatusBadge from "@/components/admin/StatusBadge";
import { ko } from "@/i18n/ko";
import { formatAdminDateTime } from "@/lib/adminFormat";
import { cashReceiptMonthKey, formatMonthLabel, groupCashReceiptsByMonth, needsCashReceipt } from "@/lib/cashReceipts";
import { formatReceiptNumber } from "@/lib/format";
import { requireAdmin } from "@/server/auth";
import { listCashReceiptReservations } from "@/server/reservations";

/** 현금영수증 신청 내역 — 접수한 달별 (매장 전용) */
export default async function CashReceiptsPage({ searchParams }: PageProps<"/admin/cash-receipts">) {
  const email = await requireAdmin();
  const { month } = await searchParams;

  const reservations = await listCashReceiptReservations().catch(() => null);
  const months = groupCashReceiptsByMonth(reservations ?? []);
  const thisMonth = cashReceiptMonthKey(new Date().toISOString());
  // 이번 달은 신청이 없어도 탭에 보여줌
  const monthKeys = [...new Set([thisMonth, ...months.map((group) => group.monthKey)])].sort((a, b) => b.localeCompare(a));
  const activeKey = typeof month === "string" && monthKeys.includes(month) ? month : thisMonth;
  const active = months.find((group) => group.monthKey === activeKey);

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-[18px] font-extrabold text-ink">🧾 현금영수증 신청 내역</h1>
          <Link href="/admin" className="text-[13px] font-semibold text-brand-dark">
            ‹ 예약 목록
          </Link>
        </div>
        <p className="mt-1 text-[12.5px] text-sub">예약을 접수한 날(한국 시각) 기준으로 달별로 모았어요. 손님 화면에는 보이지 않아요.</p>

        <nav aria-label="달 선택" className="-mx-4 mt-3 overflow-x-auto px-4">
          <ul className="flex gap-1.5 whitespace-nowrap">
            {monthKeys.map((key) => {
              const pending = months.find((group) => group.monthKey === key)?.pendingCount ?? 0;
              const selected = key === activeKey;
              return (
                <li key={key}>
                  <Link
                    href={`/admin/cash-receipts?month=${key}`}
                    aria-current={selected ? "page" : undefined}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
                      selected ? "border-brand bg-brand text-white" : "border-field bg-white text-body hover:border-brand"
                    }`}
                  >
                    {formatMonthLabel(key)}
                    {pending > 0 && <span className={selected ? "text-white/80" : "text-danger"}>대기 {pending}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {!reservations ? (
          <p className="mt-6 rounded-xl bg-white px-4 py-5 text-[14px] text-danger">
            내역을 불러오지 못했어요. 잠시 후 새로고침해 주세요.
          </p>
        ) : !active ? (
          <p className="mt-10 text-center text-[14px] text-sub">{formatMonthLabel(activeKey)}에는 현금영수증 신청이 없어요.</p>
        ) : (
          <>
            <p className="mt-4 rounded-xl bg-white px-3 py-2.5 text-[13.5px] text-body">
              {active.reservations.length}건 · 합계 <span className="font-bold text-ink">{ko.format.price(active.totalPrice)}</span>
              <span className="text-sub"> (취소 제외)</span> · 발급 대기{" "}
              <span className={`font-bold ${active.pendingCount > 0 ? "text-danger" : "text-ink"}`}>{active.pendingCount}건</span>
            </p>
            <ul className="mt-3 space-y-2">
              {active.reservations.map((reservation) => {
                const { request } = reservation;
                const canceled = reservation.status === "canceled";
                return (
                  <li
                    key={reservation.id}
                    className={`rounded-xl bg-white px-3.5 py-3 ring-1 ${
                      needsCashReceipt(reservation) ? "ring-brand/50" : "ring-line"
                    } ${canceled ? "opacity-60" : ""}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link href={`/admin/${reservation.id}`} className="text-[14px] font-bold text-ink hover:text-brand-dark">
                        {request.ordererName}{" "}
                        <span className="text-[12px] font-semibold text-sub">{formatReceiptNumber(reservation.id)} ›</span>
                      </Link>
                      <StatusBadge status={reservation.status} />
                    </div>
                    <dl className="mt-1.5 grid grid-cols-[5.5rem_1fr] gap-y-0.5 text-[13px]">
                      <dt className="text-sub">접수</dt>
                      <dd className="text-body">{formatAdminDateTime(reservation.createdAt)}</dd>
                      <dt className="text-sub">금액</dt>
                      <dd className="font-semibold text-ink">{ko.format.price(request.totalPrice)}</dd>
                      <dt className="text-sub">종류·번호</dt>
                      <dd className="text-body">
                        {ko.payment.cashReceiptOptions[request.cashReceiptType]} · {request.cashReceiptNumber}
                      </dd>
                    </dl>
                    <div className="mt-2 border-t border-line pt-2">
                      {canceled && reservation.cashReceiptIssuedAt === null ? (
                        <p className="text-[13px] text-sub">취소된 예약 — 발급하지 않아도 돼요</p>
                      ) : (
                        <CashReceiptIssuedCheckbox id={reservation.id} issuedAt={reservation.cashReceiptIssuedAt} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
