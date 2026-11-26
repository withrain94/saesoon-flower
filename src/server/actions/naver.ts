"use server";

import { revalidatePath } from "next/cache";
import { buildNaverReservationRequest, type NaverDraft } from "@/lib/naverBooking";
import { requireAdmin } from "../auth";
import { syncReservationToNotionById } from "../notion";
import { findReservationIdByNaverBookingNumber, insertReservation, updateReservation } from "../reservations";

export type NaverImportResult =
  | { ok: true; id: string }
  | { ok: false; error: string; existingId?: string };

/**
 * 네이버 예약 옮겨 넣기 — 관리자가 고친 칸을 다시 검사해 저장.
 * 결제는 네이버에서 끝났으니 바로 "입금·결제 확인"(사용자 결정), 노션 표도 맞춤. 새 예약 텔레그램 알림은 보내지 않음(매장이 직접 넣는 예약)
 */
export async function importNaverReservation(draft: NaverDraft): Promise<NaverImportResult> {
  await requireAdmin();

  const built = buildNaverReservationRequest(draft, new Date().toISOString());
  if (!built.ok) return built;
  const { request } = built;

  try {
    const existingId = await findReservationIdByNaverBookingNumber(request.naver!.bookingNumber);
    if (existingId) return { ok: false, error: "이 네이버 예약번호는 이미 넣었어요.", existingId };

    const id = await insertReservation(request);
    await updateReservation(id, { status: "confirmed" });
    await syncReservationToNotionById(id);
    revalidatePath("/admin");
    return { ok: true, id };
  } catch {
    return { ok: false, error: "저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
}
