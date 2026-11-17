import "server-only";

import { randomUUID } from "node:crypto";
import { createDatabaseClient } from "./supabase";

/**
 * 완성 사진 — 관리자가 상품을 만든 뒤 찍어서 올리는 예약별 사진.
 * 손님 사진(메시지·이름이 보일 수 있음)이라 **비공개 보관함**에 두고, 볼 때마다 1시간짜리 임시 주소를 만듦.
 * 보관함이 없으면 처음 올릴 때 자동으로 만듦 (추가 SQL 필요 없음).
 *   {예약id}/full/{이름}.jpg — 화면용 (긴 변 1200px)
 *   {예약id}/mms/{이름}.jpg  — 사진 문자 첨부용 (작게)
 */
const BUCKET = "completion-photos";

/** 예약 하나에 올릴 수 있는 완성 사진 수 */
export const MAX_COMPLETION_PHOTOS = 10;

/** 임시 주소 유효 시간(초) */
const SIGNED_URL_SECONDS = 60 * 60;

export type CompletionPhoto = { name: string; url: string };

let bucketReady = false;

async function ensureBucket() {
  if (bucketReady) return;
  const storage = createDatabaseClient().storage;
  const { data } = await storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await storage.createBucket(BUCKET, { public: false });
    // 동시에 두 곳에서 만들면 "이미 있음" 오류 — 괜찮음
    if (error && !/exist/i.test(error.message)) throw new Error(error.message);
  }
  bucketReady = true;
}

/** 사진 이름 — 올린 순서대로 정렬되도록 시각을 앞에 */
function newPhotoName() {
  return `${Date.now()}-${randomUUID().slice(0, 8)}.jpg`;
}

/** 파일 이름 검사 (지우기·첨부 요청에 다른 경로가 섞이지 않게) */
export function isPhotoName(name: string) {
  return /^[0-9]{13}-[0-9a-f]{8}\.jpg$/.test(name);
}

/** 그 예약의 완성 사진 — 올린 순서, 임시 주소 포함 (보관함이 없으면 빈 목록) */
export async function listCompletionPhotos(reservationId: string): Promise<CompletionPhoto[]> {
  const storage = createDatabaseClient().storage.from(BUCKET);
  const { data, error } = await storage.list(`${reservationId}/full`, {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });
  if (error || !data) return [];
  const names = data.map((file) => file.name).filter(isPhotoName);
  if (names.length === 0) return [];

  const { data: signed, error: signError } = await storage.createSignedUrls(
    names.map((name) => `${reservationId}/full/${name}`),
    SIGNED_URL_SECONDS,
  );
  if (signError || !signed) return [];
  return names.flatMap((name, index) => {
    const url = signed[index]?.signedUrl;
    return url ? [{ name, url }] : [];
  });
}

/** 사진 올리기 — 화면용·문자용 두 크기를 같은 이름으로 저장 */
export async function uploadCompletionPhoto(reservationId: string, full: ArrayBuffer, mms: ArrayBuffer) {
  await ensureBucket();
  const storage = createDatabaseClient().storage.from(BUCKET);
  const name = newPhotoName();
  const options = { contentType: "image/jpeg", upsert: false };
  const first = await storage.upload(`${reservationId}/full/${name}`, full, options);
  if (first.error) throw new Error(first.error.message);
  const second = await storage.upload(`${reservationId}/mms/${name}`, mms, options);
  if (second.error) throw new Error(second.error.message);
  return name;
}

export async function deleteCompletionPhoto(reservationId: string, name: string) {
  const { error } = await createDatabaseClient()
    .storage.from(BUCKET)
    .remove([`${reservationId}/full/${name}`, `${reservationId}/mms/${name}`]);
  if (error) throw new Error(error.message);
}

/** 사진 문자에 붙일 작은 사진 (없으면 null) */
export async function downloadMmsPhoto(reservationId: string, name: string): Promise<ArrayBuffer | null> {
  const { data, error } = await createDatabaseClient().storage.from(BUCKET).download(`${reservationId}/mms/${name}`);
  if (error || !data) return null;
  return data.arrayBuffer();
}
