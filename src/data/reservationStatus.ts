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

/** 관리자 목록 위 필터 — 첫 번째가 기본값. 끝난 예약(전달 완료·취소·전체)은 최근 날짜부터 */
export const adminStatusFilters: {
  id: "active" | ReservationStatus | "all";
  label: string;
  statuses: ReservationStatus[] | null;
  newestFirst: boolean;
}[] = [
  { id: "active", label: "진행 중", statuses: ["received", "confirmed", "made"], newestFirst: false },
  ...reservationStatusOptions.map((option) => ({
    id: option.value,
    label: option.label,
    statuses: [option.value],
    newestFirst: option.tone === "done" || option.tone === "canceled",
  })),
  { id: "all", label: "전체", statuses: null, newestFirst: true },
];

export function getStatusFilter(id: string | undefined) {
  return adminStatusFilters.find((filter) => filter.id === id) ?? adminStatusFilters[0];
}
