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

/** 관리자 목록 — 받는 날짜 가까운 순 (상태로 거르기 가능). 호출 전에 requireAdmin() 필수 */
export async function listReservations(status?: ReservationStatus): Promise<StoredReservation[]> {
  let query = createDatabaseClient()
    .from(TABLE)
    .select(COLUMNS)
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true })
    .limit(500);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data as ReservationRow[]).map(fromRow);
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
