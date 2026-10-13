import { chocolates, type ChocolateId } from "@/data/chocolates";
import { productCategories } from "@/data/products";
import { shop } from "@/data/shop";
import { ko } from "@/i18n/ko";
import type { ProductCategoryId } from "@/types/reservation";

/**
 * 사이트 사진 자리(slot) — 관리자 "사진 관리"에서 바꿀 수 있는 사진 묶음 (2026-10-13 사용자 요청).
 * 기본 사진은 코드(data/…)에 있고, 관리자가 바꾼 자리만 DB(site_photos 표)에 저장해 덮어쓴다.
 */
export type PhotoSlot = {
  id: string;
  group: PhotoSlotGroup;
  /** 관리자 화면에 보이는 이름 (한국어) */
  label: string;
  /** 사진 한 장짜리 자리(맨 위 사진·입구 카드·초콜릿·쇼핑백)인지 — 아니면 여러 장 + 대표 사진 */
  single: boolean;
  images: string[];
  /** 목록에 보이는 대표 사진 순번 (0부터) */
  cover: number;
};

export type PhotoSlotGroup = "home" | ProductCategoryId | "addOn";

/** 한 자리에 저장된 사진 */
export type SlotPhotos = { images: string[]; cover: number };

/** 자리 id → 관리자가 바꾼 사진 (안 바꾼 자리는 없음) */
export type PhotoOverrides = Record<string, SlotPhotos>;

/** 상품 한 개에 넣을 수 있는 사진 수 */
export const MAX_SLOT_PHOTOS = 10;

/** Supabase 사진 보관함(bucket) 이름 — supabase/schema.sql 2026-10-13 추가 SQL */
export const PHOTO_BUCKET = "site-photos";

export const HERO_SLOT = "hero";
export const thumbnailSlot = (categoryId: ProductCategoryId) => `thumbnail-${categoryId}`;
/** 상품 사진 자리 id는 상품 id 그대로 ("bouquet-80000") */
export const productSlot = (productId: string) => productId;
export const chocolateSlot = (chocolateId: string) => `chocolate-${chocolateId}`;

export const photoSlotGroups: { id: PhotoSlotGroup; label: string }[] = [
  { id: "home", label: "첫 화면" },
  ...productCategories.map((category) => ({ id: category.id, label: ko.categories[category.id].name })),
  { id: "addOn", label: "초콜릿·쇼핑백" },
];

/** 코드에 들어 있는 기본 사진 — 화면 순서대로 */
export const photoSlots: PhotoSlot[] = [
  { id: HERO_SLOT, group: "home", label: "맨 위 큰 사진", single: true, images: [shop.heroImage], cover: 0 },
  ...productCategories.map((category) => ({
    id: thumbnailSlot(category.id),
    group: "home" as const,
    label: `입구 카드 — ${ko.categories[category.id].name}`,
    single: true,
    images: [category.thumbnail],
    cover: 0,
  })),
  ...productCategories.flatMap((category) =>
    category.products.map((product) => ({
      id: productSlot(product.id),
      group: category.id,
      label: ko.format.itemName(ko.categories[category.id].name, ko.format.priceShort(product.price)),
      single: false,
      images: product.images,
      cover: product.cover,
    })),
  ),
  ...chocolates.map((chocolate) => ({
    id: chocolateSlot(chocolate.id),
    group: "addOn" as const,
    label: ko.chocolate.items[chocolate.id as ChocolateId].name,
    single: true,
    images: [chocolate.image],
    cover: 0,
  })),
];

export function getPhotoSlot(slotId: string) {
  return photoSlots.find((slot) => slot.id === slotId);
}

/** 그 자리에 지금 보일 사진 — 관리자가 바꿨으면 그 사진, 아니면 기본 사진 */
export function resolveSlotPhotos(slotId: string, overrides: PhotoOverrides): SlotPhotos {
  const slot = getPhotoSlot(slotId);
  const saved = overrides[slotId];
  const images = saved && saved.images.length > 0 ? saved.images : (slot?.images ?? []);
  const cover = saved && saved.images.length > 0 ? saved.cover : (slot?.cover ?? 0);
  return { images, cover: cover >= 0 && cover < images.length ? cover : 0 };
}

/** 사이트 안 사진("/flowers/…")이거나 우리 Supabase 사진 보관함 주소인지 — 다른 주소는 저장하지 않음 */
export function isAllowedPhotoSrc(src: string, storagePrefix: string | null) {
  if (/^\/(flowers|chocolates)\/[\w.-]+\.(jpg|jpeg|png|webp)$/i.test(src)) return true;
  return storagePrefix !== null && src.startsWith(storagePrefix) && /^[\w.-]+\.jpg$/.test(src.slice(storagePrefix.length));
}

/**
 * 저장하기 전에 다듬기 — 모르는 자리·허용 안 된 주소·중복·너무 많은 사진은 거절(null).
 * 한 장짜리 자리는 한 장만, 대표 순번은 범위 안으로.
 */
export function sanitizeSlotPhotos(
  slotId: string,
  images: unknown,
  cover: unknown,
  storagePrefix: string | null,
): SlotPhotos | null {
  const slot = getPhotoSlot(slotId);
  if (!slot || !Array.isArray(images)) return null;
  if (images.length === 0 || images.length > (slot.single ? 1 : MAX_SLOT_PHOTOS)) return null;
  if (!images.every((src): src is string => typeof src === "string" && isAllowedPhotoSrc(src, storagePrefix))) return null;
  if (new Set(images).size !== images.length) return null;
  const index = typeof cover === "number" && Number.isInteger(cover) && cover >= 0 && cover < images.length ? cover : 0;
  return { images, cover: slot.single ? 0 : index };
}

/** 사진을 지웠을 때 — 대표 사진이 같은 사진을 계속 가리키게 (대표를 지웠으면 첫 사진) */
export function removePhoto(photos: SlotPhotos, index: number): SlotPhotos {
  const coverSrc = photos.images[photos.cover];
  const images = photos.images.filter((_, i) => i !== index);
  return { images, cover: Math.max(0, images.indexOf(coverSrc)) };
}

/** 사진을 앞(-1)·뒤(+1)로 한 칸 옮김 — 대표 사진은 같은 사진을 따라감 */
export function movePhoto(photos: SlotPhotos, index: number, step: -1 | 1): SlotPhotos {
  const target = index + step;
  if (target < 0 || target >= photos.images.length) return photos;
  const coverSrc = photos.images[photos.cover];
  const images = [...photos.images];
  [images[index], images[target]] = [images[target], images[index]];
  return { images, cover: images.indexOf(coverSrc) };
}
