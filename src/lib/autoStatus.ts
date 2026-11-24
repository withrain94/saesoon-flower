import { addDaysToKey } from "@/lib/date";
import type { ReservationStatus, StoredReservation } from "@/types/reservation";

/**
 * 진행 상태 자동으로 바꾸기 (2026-11-24 사용자 요청)
 * ① 완성 사진을 올리면 "입금·결제 확인" → "제작 완료" (접수·입금 전이면 그대로 — 입금 확인을 놓치지 않게, 사용자 선택)
 * ② 받는 날로부터 7일이 지나면 "입금·결제 확인"·"제작 완료" → "전달 완료" (접수·입금 전, 취소 요청 중인 예약은 그대로)
 */

/** 받는 날에서 며칠 지나면 전달 완료로 바꾸나 */
export const AUTO_DELIVERED_AFTER_DAYS = 7;

/** 완성 사진을 올렸을 때 바꿀 상태 — 바꾸지 않으면 null */
export function statusAfterCompletionPhoto(status: ReservationStatus): ReservationStatus | null {
  return status === "confirmed" ? "made" : null;
}

/** 받는 날이 이 날짜(한국 날짜) 이전·같으면 자동 전달 완료 대상 */
export function autoDeliveredCutoffKey(todayKey: string) {
  return addDaysToKey(todayKey, -AUTO_DELIVERED_AFTER_DAYS);
}

/** 받는 날로부터 7일이 지나 "전달 완료"로 바꿀 예약인지 (예: 11/20 받는 예약은 11/27부터) */
export function shouldAutoDeliver(
  reservation: Pick<StoredReservation, "status" | "cancelRequest" | "request">,
  todayKey: string,
): boolean {
  if (reservation.status !== "confirmed" && reservation.status !== "made") return false;
  if (reservation.cancelRequest) return false;
  const date = reservation.request.date;
  return !!date && date <= autoDeliveredCutoffKey(todayKey);
}
