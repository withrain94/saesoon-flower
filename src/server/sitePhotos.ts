import "server-only";

import { randomUUID } from "node:crypto";
import { PHOTO_BUCKET, type PhotoOverrides, type SlotPhotos } from "@/lib/sitePhotos";
import { getSupabaseEnv } from "./env";
import { createDatabaseClient } from "./supabase";

/** supabase/schema.sql 2026-10-13 추가 SQL의 site_photos 표 — 관리자가 바꾼 사진 자리만 한 줄씩 */
const TABLE = "site_photos";

type SitePhotoRow = { slot: string; images: unknown; cover: number | null };

/** 올린 사진의 공개 주소 앞부분 ("https://xxxx.supabase.co/storage/v1/object/public/site-photos/") */
export function getPhotoStoragePrefix() {
  const env = getSupabaseEnv();
  return env ? `${env.url}/storage/v1/object/public/${PHOTO_BUCKET}/` : null;
}

function toOverrides(rows: SitePhotoRow[]): PhotoOverrides {
  const overrides: PhotoOverrides = {};
  for (const row of rows) {
    const images = Array.isArray(row.images) ? row.images.filter((src): src is string => typeof src === "string") : [];
    if (images.length > 0) overrides[row.slot] = { images, cover: row.cover ?? 0 };
  }
  return overrides;
}

/** 관리자가 바꾼 사진 전부 — 관리자 화면용 (표가 없거나 연결이 안 되면 오류) */
export async function listPhotoOverrides(): Promise<PhotoOverrides> {
  const { data, error } = await createDatabaseClient().from(TABLE).select("slot, images, cover");
  if (error) throw new Error(error.message);
  return toOverrides(data as SitePhotoRow[]);
}

/**
 * 손님 화면용 — 못 읽어도(설정 없음·표 없음·연결 실패) 기본 사진으로 화면이 뜨도록 빈 값을 돌려줌
 */
export async function getPhotoOverrides(): Promise<PhotoOverrides> {
  if (!getSupabaseEnv()) return {};
  try {
    return await listPhotoOverrides();
  } catch {
    return {};
  }
}

export async function savePhotoSlot(slotId: string, photos: SlotPhotos) {
  const { error } = await createDatabaseClient()
    .from(TABLE)
    .upsert({ slot: slotId, images: photos.images, cover: photos.cover, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

/** 그 자리를 코드에 있는 기본 사진으로 되돌림 (올렸던 사진 파일은 보관함에 그대로 둠) */
export async function resetPhotoSlot(slotId: string) {
  const { error } = await createDatabaseClient().from(TABLE).delete().eq("slot", slotId);
  if (error) throw new Error(error.message);
}

/** JPG 사진을 보관함에 올리고 공개 주소를 돌려줌 — 파일 이름은 매번 새로 만들어 옛 사진이 캐시에 남지 않게 */
export async function uploadPhotoFile(bytes: ArrayBuffer): Promise<string> {
  const prefix = getPhotoStoragePrefix();
  if (!prefix) throw new Error("Supabase 설정이 없습니다.");
  const name = `${randomUUID()}.jpg`;
  const { error } = await createDatabaseClient()
    .storage.from(PHOTO_BUCKET)
    .upload(name, bytes, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return prefix + name;
}
