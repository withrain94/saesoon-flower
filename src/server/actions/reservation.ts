"use server";

import { DEFAULT_LOCALE, isLocale, messages } from "@/i18n";
import { validateReservationRequest } from "@/lib/reservationValidation";
import { toNowInTimeZone } from "@/lib/time";
import type { ReservationRequest } from "@/types/reservation";
import { getSupabaseEnv } from "../env";
import { insertReservation } from "../reservations";

/** 신청 결과 — 성공이면 접수 id와 서버에서 다시 계산한 예약 내용, 실패면 고객 언어로 된 안내 문구 */
export type SubmitReservationResult =
  | { ok: true; id: string; request: ReservationRequest }
  | { ok: false; message: string };

/**
 * 고객 신청서 저장 — 누구나 부를 수 있는 서버 함수이므로 브라우저에서 온 값은 믿지 않고 전부 다시 검사한다.
 * (금액은 상품 데이터로 재계산, 날짜·시간은 한국 시각으로 재확인, 개인정보 동의 필수)
 */
export async function submitReservation(input: unknown): Promise<SubmitReservationResult> {
  const rawLocale = typeof input === "object" && input !== null ? (input as { locale?: unknown }).locale : undefined;
  const t = messages[isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE];

  // 설정 전에는 가짜 완료 화면 대신 전화·네이버 예약 안내
  if (!getSupabaseEnv()) return { ok: false, message: t.submit.unavailable };

  const submittedAt = new Date();
  const result = validateReservationRequest(input, toNowInTimeZone(submittedAt), submittedAt);
  if (!result.ok) return result;

  try {
    const id = await insertReservation(result.request);
    return { ok: true, id, request: result.request };
  } catch (error) {
    // 고객 정보는 남기지 않고 오류 종류만 서버 로그에
    console.error("[submitReservation] 저장 실패", error instanceof Error ? error.message : error);
    return { ok: false, message: t.submit.failed };
  }
}
