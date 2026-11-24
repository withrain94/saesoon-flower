import "server-only";

import { autoDeliveredCutoffKey, shouldAutoDeliver } from "@/lib/autoStatus";
import { toNowInTimeZone } from "@/lib/time";
import { syncReservationToNotionById } from "./notion";
import { listPaidReservationsUntil, updateReservation } from "./reservations";

/**
 * 받는 날로부터 7일 지난 "입금·결제 확인"·"제작 완료" 예약을 "전달 완료"로 (규칙은 lib/autoStatus).
 * 자동 실행(app/cron)에서 부름 — 여러 번 불러도 같은 결과. 바꾼 뒤 노션 표도 맞춤(실패해도 상태는 저장됨)
 */
export async function autoDeliverOldReservations(now: Date = new Date()) {
  const todayKey = toNowInTimeZone(now).dateKey;
  const candidates = await listPaidReservationsUntil(autoDeliveredCutoffKey(todayKey));
  let delivered = 0;
  for (const reservation of candidates) {
    if (!shouldAutoDeliver(reservation, todayKey)) continue;
    await updateReservation(reservation.id, { status: "delivered" });
    delivered += 1;
    await syncReservationToNotionById(reservation.id);
  }
  return { delivered };
}
