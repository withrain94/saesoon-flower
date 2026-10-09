import { toNowInTimeZone } from "@/lib/time";
import type { StoredReservation } from "@/types/reservation";

/**
 * 관리자 "현금영수증" 화면 — 현금영수증을 신청한 예약을 접수한 달(한국 시각)별로 묶음.
 * 발급 대기 = 취소가 아니고 아직 발급 표시가 없는 예약.
 */

/** 접수 시각(ISO) → "2026-10" (한국 시각 기준 달) */
export function cashReceiptMonthKey(createdAt: string) {
  return toNowInTimeZone(new Date(createdAt)).dateKey.slice(0, 7);
}

/** "2026-10" → "2026년 10월" */
export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return `${year}년 ${Number(month)}월`;
}

export type CashReceiptMonth = {
  monthKey: string;
  reservations: StoredReservation[];
  /** 취소 제외 금액 합계 */
  totalPrice: number;
  /** 취소 제외, 아직 발급 안 한 건수 */
  pendingCount: number;
};

export const needsCashReceipt = (reservation: StoredReservation) =>
  reservation.status !== "canceled" && reservation.cashReceiptIssuedAt === null;

/** 달별로 묶기 — 최근 달부터, 달 안에서는 받은 순서 유지 */
export function groupCashReceiptsByMonth(reservations: StoredReservation[]): CashReceiptMonth[] {
  const groups = new Map<string, StoredReservation[]>();
  for (const reservation of reservations) {
    const key = cashReceiptMonthKey(reservation.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), reservation]);
  }
  return [...groups]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, list]) => ({
      monthKey,
      reservations: list,
      totalPrice: list
        .filter((reservation) => reservation.status !== "canceled")
        .reduce((sum, reservation) => sum + reservation.request.totalPrice, 0),
      pendingCount: list.filter(needsCashReceipt).length,
    }));
}
