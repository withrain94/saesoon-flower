import type { ReservationStatus } from "@/types/reservation";

/** 관리자 페이지 진행 상태 — 순서대로 진행, 새 예약은 첫 번째 */
export const reservationStatusOptions: { value: ReservationStatus; label: string; tone: "new" | "progress" | "done" | "canceled" }[] = [
  { value: "received", label: "접수", tone: "new" },
  { value: "confirmed", label: "입금·결제 확인", tone: "progress" },
  { value: "made", label: "제작 완료", tone: "progress" },
  { value: "delivered", label: "전달 완료", tone: "done" },
  { value: "canceled", label: "취소", tone: "canceled" },
];

export function getStatusOption(status: ReservationStatus) {
  return reservationStatusOptions.find((option) => option.value === status) ?? reservationStatusOptions[0];
}

export function isReservationStatus(value: string): value is ReservationStatus {
  return reservationStatusOptions.some((option) => option.value === value);
}
