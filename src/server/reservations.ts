import "server-only";

import { isReservationStatus } from "@/data/reservationStatus";
import type { ReservationRequest, ReservationStatus, StoredReservation } from "@/types/reservation";
import { createDatabaseClient } from "./supabase";

/** supabase/schema.sql 의 reservations 테이블 */
const TABLE = "reservations";

type ReservationRow = {
  id: string;
  created_at: string;
  status: string;
  admin_memo: string | null;
  request: ReservationRequest;
};

function fromRow(row: ReservationRow): StoredReservation {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: isReservationStatus(row.status) ? row.status : "received",
    adminMemo: row.admin_memo ?? "",
    request: row.request,
  };
}

/** 검사를 통과한 예약 저장 → 새 예약 id */
export async function insertReservation(request: ReservationRequest): Promise<string> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .insert({
      reservation_date: request.date,
      reservation_time: request.time,
      orderer_name: request.ordererName,
      orderer_phone: request.ordererPhone,
      payment_method: request.paymentMethod,
      total_price: request.totalPrice,
      total_quantity: request.totalQuantity,
      privacy_agreed_at: request.submittedAt,
      request,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

const COLUMNS = "id, created_at, status, admin_memo, request";

/**
 * 관리자 목록 — 받는 날짜·시간 순 (statuses가 null이면 전체). 호출 전에 requireAdmin() 필수
 * newestFirst: 끝난 예약을 볼 때 최근 날짜부터
 */
export async function listReservations({
  statuses,
  newestFirst,
}: {
  statuses: ReservationStatus[] | null;
  newestFirst: boolean;
}): Promise<StoredReservation[]> {
  let query = createDatabaseClient()
    .from(TABLE)
    .select(COLUMNS)
    .order("reservation_date", { ascending: !newestFirst })
    .order("reservation_time", { ascending: !newestFirst })
    .limit(500);
  if (statuses) query = query.in("status", statuses);

  const { data, error } = await query;
  if (error) throw error;
  return (data as ReservationRow[]).map(fromRow);
}

/** 상태별 예약 수 (필터 옆 숫자). 호출 전에 requireAdmin() 필수 */
export async function countReservationsByStatus(): Promise<Record<ReservationStatus, number>> {
  const { data, error } = await createDatabaseClient().from(TABLE).select("status").limit(10000);
  if (error) throw error;

  const counts: Record<ReservationStatus, number> = {
    received: 0,
    confirmed: 0,
    made: 0,
    delivered: 0,
    canceled: 0,
  };
  for (const row of data as { status: string }[]) {
    if (isReservationStatus(row.status)) counts[row.status] += 1;
  }
  return counts;
}

/** 관리자 상세. 호출 전에 requireAdmin() 필수 */
export async function getReservation(id: string): Promise<StoredReservation | null> {
  const { data, error } = await createDatabaseClient().from(TABLE).select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as ReservationRow) : null;
}

/** 관리자 상태·메모 수정. 호출 전에 requireAdmin() 필수 */
export async function updateReservation(
  id: string,
  patch: { status?: ReservationStatus; adminMemo?: string },
) {
  const { error } = await createDatabaseClient()
    .from(TABLE)
    .update({
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.adminMemo !== undefined ? { admin_memo: patch.adminMemo } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}
