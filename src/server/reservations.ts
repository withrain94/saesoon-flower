import "server-only";

import { getEventOn } from "@/data/events";
import { isReservationStatus } from "@/data/reservationStatus";
import type {
  CancelRequest,
  ReservationDelivery,
  ReservationRequest,
  ReservationStatus,
  StoredReservation,
  TossPaymentRecord,
} from "@/types/reservation";
import { createDatabaseClient } from "./supabase";

/** supabase/schema.sql 의 reservations 테이블 */
const TABLE = "reservations";

type ReservationRow = {
  id: string;
  created_at: string;
  updated_at?: string;
  status: string;
  admin_memo: string | null;
  request: ReservationRequest;
  /** 취소 요청 칸 — schema.sql 추가 SQL을 실행하기 전에는 없음 */
  cancel_request?: CancelRequest | null;
  /** 안내 문자 보냄 표시 — schema.sql 2026-09-16 추가 SQL을 실행하기 전에는 없음 */
  reminder_sent_at?: string | null;
  /** 현금영수증 발급 표시 — schema.sql 2026-10-09 추가 SQL을 실행하기 전에는 없음 */
  cash_receipt_issued_at?: string | null;
  /** 토스페이먼츠 결제 기록 — schema.sql 2026-11-13 추가 SQL을 실행하기 전에는 없음 */
  payment?: TossPaymentRecord | null;
};

/** 토퍼가 이름·직급(수료 과정) 두 칸이던 예전 기록에서 적혀 있던 값 한 줄 */
function oldTopperText(delivery: ReservationDelivery) {
  const old = delivery as ReservationDelivery & { topperName?: string; topperRank?: string; topperCourse?: string };
  return [old.topperName, old.topperRank, old.topperCourse]
    .map((text) => (text ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * 받는 방법·배송지·승진식 꽃 여부 칸이 생기기 전(2026-09-19) 기록 — 호접난 식당 배송이면 배송, 아니면 픽업으로 보고
 * 배송지는 빈 값, 특별한 날 예약은 행사용 꽃으로 봄 (전에는 그날 예약 모두 토퍼 칸이 있었음).
 * 토퍼가 이름·직급(수료 과정) 두 칸이던 기록(2026-09-29 전)은 적힌 값을 이어 붙여 한 칸으로 읽는다.
 */
function withReceiveDefaults(request: ReservationRequest): ReservationRequest {
  return {
    ...request,
    receiveMethod: request.receiveMethod ?? (request.orchidDelivery?.method === "restaurant" ? "delivery" : "pickup"),
    forEvent: request.forEvent ?? getEventOn(request.date) !== undefined,
    // 초콜릿 칸이 생기기 전(2026-10-12) 기록은 담은 초콜릿이 없음
    chocolates: request.chocolates ?? [],
    // 온라인 결제가 생기기 전(2026-11-13) 기록 — 카드는 모두 전화(키인) 결제, 온라인 결제 아님
    cardKind: request.cardKind ?? "keyin",
    tossPayment: request.tossPayment ?? false,
    deliveries: request.deliveries.map((delivery) => ({
      ...delivery,
      recipientAddress: delivery.recipientAddress ?? "",
      topperSender: delivery.topperSender ?? oldTopperText(delivery),
      // 수료 과정 칸(2026-11-24)이 생기기 전 기록은 "" — 2026-09-29 전 기록의 옛 과정 칸은 위 topperSender에 이미 합쳐짐
      topperCourse: delivery.topperSender === undefined ? "" : (delivery.topperCourse ?? ""),
    })),
  };
}

function fromRow(row: ReservationRow): StoredReservation {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: isReservationStatus(row.status) ? row.status : "received",
    adminMemo: row.admin_memo ?? "",
    request: withReceiveDefaults(row.request),
    // paid 칸이 생기기 전 기록은 취소 요청(입금 후)으로 봄
    cancelRequest: row.cancel_request ? { ...row.cancel_request, paid: row.cancel_request.paid ?? true } : null,
    reminderSentAt: row.reminder_sent_at ?? null,
    cashReceiptIssuedAt: row.cash_receipt_issued_at ?? null,
    payment: row.payment ?? null,
  };
}

/**
 * 검사를 통과한 예약 저장 → 새 예약 id.
 * 온라인 결제 예약은 id를 먼저 정해(주문번호에 들어가므로) 결제창을 열기 전 기록(payment)과 같이 저장
 */
export async function insertReservation(
  request: ReservationRequest,
  withPayment?: { id: string; payment: TossPaymentRecord },
): Promise<string> {
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
      ...(withPayment ? { id: withPayment.id, payment: withPayment.payment } : {}),
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

/** 예약 전체 (접수 순) — 관리자 "예약 전체 내려받기"(백업)용. 호출 전에 requireAdmin() 필수 */
export async function listAllReservations(): Promise<StoredReservation[]> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .select(COLUMNS)
    .order("created_at", { ascending: true })
    .limit(10000);
  if (error) throw error;
  return (data as ReservationRow[]).map(fromRow);
}

/** 현금영수증을 신청한 예약 전체 (접수 늦은 순, 취소 포함) — 관리자 "현금영수증" 화면용. 호출 전에 requireAdmin() 필수 */
export async function listCashReceiptReservations(): Promise<StoredReservation[]> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .select(COLUMNS)
    .in("request->>cashReceiptType", ["income", "expense"])
    .order("created_at", { ascending: false })
    .limit(10000);
  if (error) throw error;
  return (data as ReservationRow[]).map(fromRow);
}

/**
 * 자동 문자(server/autoSms)가 살펴볼 예약 — 받는 날짜가 dateKeys인 예약(취소 제외) + canceledSince 뒤에 취소된 예약.
 * 호출하는 쪽(app/cron)이 CRON_SECRET을 먼저 확인
 */
export async function listAutoSmsReservations(
  dateKeys: string[],
  canceledSince: Date,
): Promise<(StoredReservation & { updatedAt: string })[]> {
  const client = createDatabaseClient();
  const [upcoming, canceled] = await Promise.all([
    client.from(TABLE).select(COLUMNS).in("reservation_date", dateKeys).neq("status", "canceled").limit(1000),
    client.from(TABLE).select(COLUMNS).eq("status", "canceled").gte("updated_at", canceledSince.toISOString()).limit(200),
  ]);
  if (upcoming.error) throw upcoming.error;
  if (canceled.error) throw canceled.error;
  return [...(upcoming.data as ReservationRow[]), ...(canceled.data as ReservationRow[])].map((row) => ({
    ...fromRow(row),
    updatedAt: row.updated_at ?? row.created_at,
  }));
}

/**
 * 받는 날짜가 cutoffKey 이전·같은 "입금·결제 확인"·"제작 완료" 예약 — 7일 지나 자동 전달 완료(server/autoStatus)용.
 * 호출하는 쪽(app/cron)이 CRON_SECRET을 먼저 확인
 */
export async function listPaidReservationsUntil(cutoffKey: string): Promise<StoredReservation[]> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .select(COLUMNS)
    .in("status", ["confirmed", "made"])
    .lte("reservation_date", cutoffKey)
    .limit(500);
  if (error) throw error;
  return (data as ReservationRow[]).map(fromRow);
}

/**
 * 받는 날짜 하루치 예약 (취소 제외, 시간 순) — 전날 "내일 예약 목록" 텔레그램(server/reminders)용.
 * 호출하는 쪽(app/cron)이 CRON_SECRET을 먼저 확인
 */
export async function listReservationsOnDate(dateKey: string): Promise<StoredReservation[]> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .select(COLUMNS)
    .eq("reservation_date", dateKey)
    .neq("status", "canceled")
    .order("reservation_time", { ascending: true })
    .limit(500);
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

/** 같은 네이버 예약번호로 이미 넣은 예약 id — 없으면 null. 호출 전에 requireAdmin() 필수 */
export async function findReservationIdByNaverBookingNumber(bookingNumber: string): Promise<string | null> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .select("id")
    .eq("request->naver->>bookingNumber", bookingNumber)
    .limit(1);
  if (error) throw error;
  return (data as { id: string }[])[0]?.id ?? null;
}

/** 관리자 상태·메모 수정. 호출 전에 requireAdmin() 필수 */
export async function updateReservation(
  id: string,
  patch: { status?: ReservationStatus; adminMemo?: string; reminderSentAt?: string | null; cashReceiptIssuedAt?: string | null },
) {
  const { error } = await createDatabaseClient()
    .from(TABLE)
    .update({
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.adminMemo !== undefined ? { admin_memo: patch.adminMemo } : {}),
      ...(patch.reminderSentAt !== undefined ? { reminder_sent_at: patch.reminderSentAt } : {}),
      ...(patch.cashReceiptIssuedAt !== undefined ? { cash_receipt_issued_at: patch.cashReceiptIssuedAt } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

/**
 * 손님 예약 조회 — 예약자 연락처 끝 4자리로 후보를 찾음 (받는 날짜 늦은 순).
 * 이름·전체 연락처 확인은 부르는 쪽에서. lastDigits는 숫자 4자리만 (검색 패턴에 그대로 들어감)
 * 저장된 번호 끝자리 사이에 띄어쓰기·하이픈이 있어도 찾도록 숫자 사이에 숫자 아닌 글자를 허용
 * ("+1 212 555 12 34" 도 "1234"로 찾음)
 */
export async function findReservationsByPhoneEnding(lastDigits: string): Promise<StoredReservation[]> {
  if (!/^\d{4}$/.test(lastDigits)) return [];
  const pattern = `${lastDigits.split("").join("[^0-9]*")}[^0-9]*$`;
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .select(COLUMNS)
    .regexMatch("orderer_phone", pattern)
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
/**
 * 손님이 조회 화면에서 받는 분 정보를 고친 예약 내용 저장 (server/actions/lookup — 이름·연락처·접수번호 확인 뒤).
 * 취소·전달 완료·취소 요청 중인 예약은 바꾸지 않음. 바뀌었으면 true
 */
export async function saveCustomerRecipientEdit(id: string, request: ReservationRequest): Promise<boolean> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .update({ request, updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["received", "confirmed", "made"])
    .is("cancel_request", null)
    .select("id");
  if (error) throw error;
  return data.length > 0;
}

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

/** 토스페이먼츠 결제 기록 저장 (결제창 열기·결제 승인·웹훅·관리자 취소) */
export async function saveTossPayment(id: string, payment: TossPaymentRecord) {
  const { error } = await createDatabaseClient()
    .from(TABLE)
    .update({ payment, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/**
 * 결제·입금이 확인되면 접수 → 입금·결제 확인으로 (매장이 이미 다른 상태로 바꿨으면 그대로) — 바꿨으면 true
 */
export async function markReservationPaid(id: string): Promise<boolean> {
  const { data, error } = await createDatabaseClient()
    .from(TABLE)
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "received")
    .select("id");
  if (error) throw error;
  return data.length > 0;
}
