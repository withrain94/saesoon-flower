import "server-only";

import { isReservationStatus } from "@/data/reservationStatus";
import type { CancelRequest, ReservationRequest, ReservationStatus, StoredReservation } from "@/types/reservation";
import { createDatabaseClient } from "./supabase";

/** supabase/schema.sql 의 reservations 테이블 */
const TABLE = "reservations";

type ReservationRow = {
  id: string;
  created_at: string;
  status: string;
  admin_memo: string | null;
  request: ReservationRequest;
  /** 취소 요청 칸 — schema.sql 추가 SQL을 실행하기 전에는 없음 */
  cancel_request?: CancelRequest | null;
};

function fromRow(row: ReservationRow): StoredReservation {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: isReservationStatus(row.status) ? row.status : "received",
    adminMemo: row.admin_memo ?? "",
    request: row.request,
    // paid 칸이 생기기 전 기록은 취소 요청(입금 후)으로 봄
    cancelRequest: row.cancel_request ? { ...row.cancel_request, paid: row.cancel_request.paid ?? true } : null,
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

/** 전체 칸 — 나중에 추가한 칸(cancel_request 등)이 아직 DB에 없어도 오류 없이 읽히도록 "*" */
const COLUMNS = "*";

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

/** 예약 한 건. 관리자 상세는 호출 전에 requireAdmin() 필수, 서류 PDF 받기(server/documentDownload)는 연락처를 먼저 확인 */
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

/**
 * 손님 예약 조회 — 예약자 연락처 끝 4자리로 후보를 찾음 (받는 날짜 늦은 순).
 * 이름·전체 연락처 확인은 부르는 쪽에서. lastDigits는 숫자 4자리만 (검색 패턴에 그대로 들어감)
 */
export async function findReservationsByPhoneEnding(lastDigits: string): Promise<StoredReservation[]> {
  if (!/^\d{4}$/.test(lastDigits)) return [];
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .select(COLUMNS)
    .like("orderer_phone", `%${lastDigits}`)
    .order("reservation_date", { ascending: false })
    .order("reservation_time", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data as ReservationRow[]).map(fromRow);
}

/** 손님 취소 — 접수번호(id 앞 8자리)로 찾음. 이름·연락처 확인은 부르는 쪽에서 */
export async function findReservationsByReceipt(receiptNumber: string): Promise<StoredReservation[]> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .select(COLUMNS)
    .eq("receipt_number", receiptNumber)
    .limit(5);
  if (error) throw error;
  return (data as ReservationRow[]).map(fromRow);
}

/** 손님이 입금 전 예약을 바로 취소 (취소 기록도 남김) — 그사이 매장이 상태를 바꿨으면 false */
export async function cancelUnpaidReservation(id: string, cancelRecord: CancelRequest): Promise<boolean> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .update({ status: "canceled", cancel_request: cancelRecord, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "received")
    .is("cancel_request", null)
    .select("id");
  if (error) throw error;
  return data.length > 0;
}

/** 손님 취소 요청 저장 (입금·결제 후) — 허용된 상태가 아니거나 이미 요청했으면 false */
export async function saveCancelRequest(
  id: string,
  cancelRequest: CancelRequest,
  allowedStatuses: ReservationStatus[],
): Promise<boolean> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .update({ cancel_request: cancelRequest, updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", allowedStatuses)
    .is("cancel_request", null)
    .select("id");
  if (error) throw error;
  return data.length > 0;
}
