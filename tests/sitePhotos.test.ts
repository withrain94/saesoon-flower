import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import {
  chocolateSlot,
  HERO_SLOT,
  MAX_SLOT_PHOTOS,
  movePhoto,
  photoSlots,
  productSlot,
  removePhoto,
  resolveSlotPhotos,
  sanitizeSlotPhotos,
} from "@/lib/sitePhotos";

const prefix = "https://example.supabase.co/storage/v1/object/public/site-photos/";
const uploaded = `${prefix}1b2c3d4e-0000-4000-8000-123456789abc.jpg`;
const bouquet = allProducts.find((product) => product.id === "bouquet-80000")!;
const slotId = productSlot(bouquet.id);

describe("사진 관리 (lib/sitePhotos)", () => {
  it("자리 id가 겹치지 않고, 모든 자리에 기본 사진이 있음", () => {
    assert.equal(new Set(photoSlots.map((slot) => slot.id)).size, photoSlots.length);
    assert.ok(photoSlots.every((slot) => slot.images.length > 0));
  });

  it("안 바꾼 자리는 기본 사진, 바꾼 자리는 바꾼 사진", () => {
    assert.deepEqual(resolveSlotPhotos(slotId, {}), { images: bouquet.images, cover: bouquet.cover });
    assert.deepEqual(resolveSlotPhotos(slotId, { [slotId]: { images: [uploaded], cover: 0 } }), {
      images: [uploaded],
      cover: 0,
    });
    // 저장된 값이 이상해도(빈 목록·범위 밖 대표) 화면은 뜸
    assert.deepEqual(resolveSlotPhotos(slotId, { [slotId]: { images: [], cover: 3 } }).images, bouquet.images);
    assert.equal(resolveSlotPhotos(slotId, { [slotId]: { images: [uploaded], cover: 9 } }).cover, 0);
  });

  it("저장 전 검사 — 우리 사진 주소만, 중복·빈 목록·너무 많은 사진은 거절", () => {
    assert.deepEqual(sanitizeSlotPhotos(slotId, [bouquet.images[0], uploaded], 1, prefix), {
      images: [bouquet.images[0], uploaded],
      cover: 1,
    });
    assert.equal(sanitizeSlotPhotos(slotId, ["https://evil.example/a.jpg"], 0, prefix), null);
    assert.equal(sanitizeSlotPhotos(slotId, [`${prefix}../other/a.jpg`], 0, prefix), null);
    assert.equal(sanitizeSlotPhotos(slotId, [uploaded], 0, null), null);
    assert.equal(sanitizeSlotPhotos(slotId, [uploaded, uploaded], 0, prefix), null);
    assert.equal(sanitizeSlotPhotos(slotId, [], 0, prefix), null);
    assert.equal(sanitizeSlotPhotos("없는자리", [uploaded], 0, prefix), null);
    const tooMany = Array.from({ length: MAX_SLOT_PHOTOS + 1 }, (_, i) => `/flowers/photo-${i}.jpg`);
    assert.equal(sanitizeSlotPhotos(slotId, tooMany, 0, prefix), null);
    // 한 장짜리 자리는 한 장만
    assert.equal(sanitizeSlotPhotos(HERO_SLOT, [bouquet.images[0], uploaded], 0, prefix), null);
    assert.deepEqual(sanitizeSlotPhotos(chocolateSlot("shoppingbag"), [uploaded], 5, prefix), { images: [uploaded], cover: 0 });
  });

  it("지우거나 순서를 바꿔도 대표 사진은 같은 사진을 가리킴", () => {
    const photos = { images: ["a", "b", "c"], cover: 1 };
    assert.deepEqual(removePhoto(photos, 0), { images: ["b", "c"], cover: 0 });
    // 대표를 지우면 첫 사진이 대표
    assert.deepEqual(removePhoto(photos, 1), { images: ["a", "c"], cover: 0 });
    assert.deepEqual(movePhoto(photos, 1, 1), { images: ["a", "c", "b"], cover: 2 });
    assert.deepEqual(movePhoto(photos, 0, -1), photos);
  });
});
