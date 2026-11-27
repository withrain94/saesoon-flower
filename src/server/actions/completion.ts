"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { statusAfterCompletionPhoto } from "@/lib/autoStatus";
import { MAX_SMS_TEXT, toSmsPhoneNumber } from "@/lib/ordererSms";
import { isReservationId, requireAdmin } from "../auth";
import {
  deleteCompletionPhoto,
  downloadMmsPhoto,
  isPhotoName,
  listCompletionPhotos,
  MAX_COMPLETION_PHOTOS,
  uploadCompletionPhoto,
  type CompletionPhoto,
} from "../completionPhotos";
import { syncReservationToNotionById } from "../notion";
import { getReservation, updateReservation } from "../reservations";
import { sendSms } from "../sms";

/** 완성 사진 올리기·지우기 결과 — 성공하면 새 사진 목록 */
export type CompletionPhotoResult = { error: string; photos?: undefined } | { error: null; photos: CompletionPhoto[] };

/** 브라우저에서 줄여 보내므로 넉넉히 (next.config.ts bodySizeLimit 3mb보다 작게, 두 장 합쳐서) */
const MAX_FULL_BYTES = 2_000_000;
const MAX_MMS_BYTES = 600_000;

function isJpeg(bytes: ArrayBuffer) {
  const head = new Uint8Array(bytes.slice(0, 3));
  return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
}

async function readJpeg(formData: FormData, key: string, maxBytes: number) {
  const file = formData.get(key);
  if (!(file instanceof File) || file.size === 0 || file.size > maxBytes) return null;
  const bytes = await file.arrayBuffer();
  return isJpeg(bytes) ? bytes : null;
}

/**
 * 완성 사진 한 장 올리기 (화면용 "full" + 문자용 "mms" 두 크기).
 * "입금·결제 확인" 예약이면 진행 상태를 "제작 완료"로 자동으로 바꿈 (lib/autoStatus, 2026-11-24 사용자 요청)
 */
export async function addCompletionPhoto(id: string, formData: FormData): Promise<CompletionPhotoResult> {
  await requireAdmin();
  if (!isReservationId(id)) return { error: "잘못된 요청이에요." };
  const full = await readJpeg(formData, "full", MAX_FULL_BYTES);
  const mms = await readJpeg(formData, "mms", MAX_MMS_BYTES);
  if (!full || !mms) return { error: "사진을 읽지 못했어요. 다른 사진으로 시도해 주세요." };

  let nextStatus: ReturnType<typeof statusAfterCompletionPhoto> = null;
  let photos: CompletionPhoto[];
  try {
    const [reservation, current] = await Promise.all([getReservation(id), listCompletionPhotos(id)]);
    if (!reservation) return { error: "예약을 찾지 못했어요." };
    if (current.length >= MAX_COMPLETION_PHOTOS) {
      return { error: `완성 사진은 ${MAX_COMPLETION_PHOTOS}장까지 올릴 수 있어요. 먼저 한 장을 지워 주세요.` };
    }
    await uploadCompletionPhoto(id, full, mms);
    photos = await listCompletionPhotos(id);
    nextStatus = statusAfterCompletionPhoto(reservation.status);
  } catch {
    return { error: "사진을 저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  if (nextStatus) {
    // 사진은 이미 저장됨 — 상태 저장이 실패해도 사진 올리기는 성공으로 둠 (관리자가 상태 버튼으로 직접 바꿀 수 있음)
    try {
      await updateReservation(id, { status: nextStatus });
      // 노션 표 맞추기는 화면에 결과를 돌려준 뒤에 (사진 올리기가 노션을 기다리지 않게)
      after(() => syncReservationToNotionById(id).catch(() => console.error("[completion] 노션 맞추기 실패")));
      refresh();
    } catch {
      console.error("[completion] 제작 완료 자동 변경 실패");
    }
  }
  return { error: null, photos };
}

export async function removeCompletionPhoto(id: string, name: string): Promise<CompletionPhotoResult> {
  await requireAdmin();
  if (!isReservationId(id) || !isPhotoName(name)) return { error: "잘못된 요청이에요." };
  try {
    await deleteCompletionPhoto(id, name);
    return { error: null, photos: await listCompletionPhotos(id) };
  } catch {
    return { error: "사진을 지우지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
}

export type SendSmsResult =
  | { ok: true; state: "sent" | "pending"; markError: string | null }
  | { ok: false; error: string; notConfigured?: boolean };

/**
 * [지금 문자 보내기] — 예약자 연락처로 문자 발송. 사진을 고르면 사진 문자(MMS).
 * 보내면 "안내 문자 보냄" 표시도 자동으로 켬
 */
export async function sendOrdererSms(id: string, text: string, photoName: string | null): Promise<SendSmsResult> {
  await requireAdmin();
  const body = text.trim();
  if (!isReservationId(id) || (photoName !== null && !isPhotoName(photoName))) {
    return { ok: false, error: "잘못된 요청이에요." };
  }
  if (!body) return { ok: false, error: "보낼 내용을 적어 주세요." };
  if (body.length > MAX_SMS_TEXT) return { ok: false, error: `문자는 ${MAX_SMS_TEXT}자까지 보낼 수 있어요.` };

  const reservation = await getReservation(id).catch(() => null);
  if (!reservation) return { ok: false, error: "예약을 찾지 못했어요." };
  if (reservation.status === "canceled") return { ok: false, error: "취소된 예약에는 문자를 보내지 않아요." };
  const phoneNumber = toSmsPhoneNumber(reservation.request.ordererPhone);
  if (!phoneNumber) return { ok: false, error: "예약자 연락처가 휴대폰 번호 형식이 아니에요. 직접 전화로 안내해 주세요." };

  const photo = photoName ? await downloadMmsPhoto(id, photoName) : null;
  if (photoName && !photo) return { ok: false, error: "첨부할 사진을 찾지 못했어요. 새로고침 후 다시 시도해 주세요." };

  const result = await sendSms({ phoneNumber, text: body, photo });
  if (result.state === "notConfigured") {
    return {
      ok: false,
      notConfigured: true,
      error: "자동 문자 발송이 아직 설정되지 않았어요. 아래 [휴대폰 문자 앱으로 보내기]를 쓰거나, SMS Gate 설정을 마쳐 주세요.",
    };
  }
  if (result.state === "failed") return { ok: false, error: result.error };

  let markError: string | null = null;
  try {
    await updateReservation(id, { reminderSentAt: new Date().toISOString() });
  } catch {
    markError = "문자는 보냈지만 '보냄' 표시를 저장하지 못했어요. [안내 문자 보냈어요]를 눌러 주세요.";
  }
  refresh();
  return { ok: true, state: result.state, markError };
}
