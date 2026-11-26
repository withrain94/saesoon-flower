"use server";

import { revalidatePath } from "next/cache";
import { buildStoreReservationRequest, type StoreDraft } from "@/lib/storeBooking";
import { requireAdmin } from "../auth";
import { skipPaymentConfirmedSms } from "../autoSms";
import { syncReservationToNotionById } from "../notion";
import { findActiveReservationIdByOrdererPhone, insertReservation, updateReservation } from "../reservations";

export type StoreImportResult =
  | { ok: true; id: string; paid: boolean; sms: boolean }
  | { ok: false; error: string; existingId?: string; duplicate?: boolean };

/**
 * 매장 예약 넣기 (2026-11-26 사용자 요청) — 관리자가 고친 칸을 다시 검사해 저장.
 * 입금 확인이면 "입금·결제 확인"(문자를 고르면 10분 안에 입금 확인 자동 문자), 아니면 "접수". 노션 표도 맞춤.
 * 새 예약 텔레그램 알림은 보내지 않음(매장이 직접 넣는 예약)
 */
export async function importStoreReservation(draft: StoreDraft): Promise<StoreImportResult> {
  await requireAdmin();

  const built = buildStoreReservationRequest(draft, new Date().toISOString());
  if (!built.ok) return built;
  const { request } = built;

  try {
    if (!draft.allowDuplicate) {
      const existingId = await findActiveReservationIdByOrdererPhone(request.date, request.ordererPhone);
      if (existingId) {
        return {
          ok: false,
          error: "같은 날 이 연락처로 넣은 예약이 이미 있어요. 다른 주문이면 아래 '그래도 저장'을 체크해 주세요.",
          existingId,
          duplicate: true,
        };
      }
    }

    const id = await insertReservation(request);
    const paid = !!draft.paid;
    const sms = paid && !!draft.sendPaidSms;
    // 문자를 안 보내기로 했으면 상태를 바꾸기 전에 먼저 "보냄"으로 적어 둠 (자동 문자 실행과 겹치지 않게)
    if (paid && !sms) await skipPaymentConfirmedSms(id, request.ordererPhone);
    await updateReservation(id, {
      status: paid ? "confirmed" : "received",
      adminMemo: `📞 매장 예약 (관리자가 넣음${paid ? ", 입금 확인" : ""})`,
    });
    await syncReservationToNotionById(id);
    revalidatePath("/admin");
    return { ok: true, id, paid, sms };
  } catch {
    return { ok: false, error: "저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
}
