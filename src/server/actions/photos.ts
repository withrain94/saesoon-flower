"use server";

import { refresh, revalidatePath } from "next/cache";
import { getPhotoSlot, MAX_SLOT_PHOTOS, resolveSlotPhotos, sanitizeSlotPhotos, type SlotPhotos } from "@/lib/sitePhotos";
import { requireAdmin } from "../auth";
import {
  getPhotoStoragePrefix,
  listPhotoOverrides,
  resetPhotoSlot,
  savePhotoSlot,
  uploadPhotoFile,
} from "../sitePhotos";

/** 사진 관리 결과 — 성공하면 그 자리의 새 사진 목록, 실패하면 화면에 보여줄 문구 */
export type PhotoActionResult = { error: string; photos?: undefined } | { error: null; photos: SlotPhotos };

/** 브라우저에서 줄여서 보내므로 넉넉히 (next.config.ts의 bodySizeLimit보다 작게) */
const MAX_UPLOAD_BYTES = 2_500_000;

const SETUP_HINT = "저장하지 못했어요. Supabase에서 사진 관리용 SQL을 실행했는지 확인해 주세요.";

/** 손님 첫 화면이 새 사진으로 다시 만들어지게 + 관리자 화면 새로고침 */
function publish() {
  revalidatePath("/");
  refresh();
}

/** JPG 파일인지 (맨 앞 바이트) */
function isJpeg(bytes: ArrayBuffer) {
  const head = new Uint8Array(bytes.slice(0, 3));
  return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
}

/** 새 사진 올리기 — 여러 장 자리는 맨 뒤에 추가, 한 장짜리 자리는 그 사진으로 바꿈 */
export async function addSitePhoto(slotId: string, formData: FormData): Promise<PhotoActionResult> {
  await requireAdmin();
  const slot = getPhotoSlot(slotId);
  const file = formData.get("photo");
  if (!slot || !(file instanceof File)) return { error: "잘못된 요청이에요." };
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return { error: "사진이 너무 커요. 다른 사진으로 시도해 주세요." };

  const bytes = await file.arrayBuffer();
  if (!isJpeg(bytes)) return { error: "사진 파일을 읽지 못했어요. 다른 사진으로 시도해 주세요." };

  try {
    const current = resolveSlotPhotos(slotId, await listPhotoOverrides());
    if (!slot.single && current.images.length >= MAX_SLOT_PHOTOS) {
      return { error: `사진은 ${MAX_SLOT_PHOTOS}장까지 넣을 수 있어요. 먼저 한 장을 지워 주세요.` };
    }
    const url = await uploadPhotoFile(bytes);
    const photos: SlotPhotos = slot.single
      ? { images: [url], cover: 0 }
      : { images: [...current.images, url], cover: current.cover };
    await savePhotoSlot(slotId, photos);
    publish();
    return { error: null, photos };
  } catch {
    return { error: SETUP_HINT };
  }
}

/** 순서 바꾸기·지우기·대표 사진 고르기 — 화면에서 만든 새 목록을 다시 검사해서 저장 */
export async function saveSitePhotos(slotId: string, images: string[], cover: number): Promise<PhotoActionResult> {
  await requireAdmin();
  const photos = sanitizeSlotPhotos(slotId, images, cover, getPhotoStoragePrefix());
  if (!photos) return { error: "잘못된 요청이에요." };

  try {
    await savePhotoSlot(slotId, photos);
  } catch {
    return { error: SETUP_HINT };
  }
  publish();
  return { error: null, photos };
}

/** 처음(코드에 있는 기본) 사진으로 되돌리기 */
export async function resetSitePhotos(slotId: string): Promise<PhotoActionResult> {
  await requireAdmin();
  if (!getPhotoSlot(slotId)) return { error: "잘못된 요청이에요." };

  try {
    await resetPhotoSlot(slotId);
  } catch {
    return { error: SETUP_HINT };
  }
  publish();
  return { error: null, photos: resolveSlotPhotos(slotId, {}) };
}
