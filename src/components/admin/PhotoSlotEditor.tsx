"use client";

import Image from "next/image";
import { useRef, useState, useTransition, type ChangeEvent } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { resizeToJpeg } from "@/lib/resizeImage";
import { MAX_SLOT_PHOTOS, movePhoto, removePhoto, type PhotoSlot, type SlotPhotos } from "@/lib/sitePhotos";
import { addSitePhoto, resetSitePhotos, saveSitePhotos, type PhotoActionResult } from "@/server/actions/photos";

const buttonClassName =
  "rounded-lg border border-field bg-white px-2 py-1.5 text-[12.5px] font-semibold text-body transition hover:border-brand disabled:opacity-40";

/**
 * 사진 자리 하나 — 올리기·지우기·순서 바꾸기·대표 사진 고르기 (누르면 바로 저장, 손님 화면에는 1분 안에 반영).
 * 한 장짜리 자리(맨 위 사진·입구 카드·초콜릿·쇼핑백)는 "사진 바꾸기"만
 */
export default function PhotoSlotEditor({
  slot,
  initial,
  changed: initiallyChanged,
}: {
  slot: PhotoSlot;
  /** 지금 손님 화면에 보이는 사진 */
  initial: SlotPhotos;
  /** 기본 사진에서 바꾼 적이 있는지 — "처음 사진으로" 버튼을 보여줄지 */
  changed: boolean;
}) {
  const [photos, setPhotos] = useState(initial);
  const [changed, setChanged] = useState(initiallyChanged);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const full = !slot.single && photos.images.length >= MAX_SLOT_PHOTOS;

  /** 서버에 저장하고, 실패하면 화면을 원래대로 */
  function run(action: () => Promise<PhotoActionResult>, optimistic?: SlotPhotos, nowChanged = true) {
    const before = photos;
    setError(null);
    if (optimistic) setPhotos(optimistic);
    startTransition(async () => {
      const result = await action().catch((): PhotoActionResult => ({ error: "저장하지 못했어요. 잠시 후 다시 시도해 주세요." }));
      if (result.error !== null) {
        setPhotos(before);
        setError(result.error);
        return;
      }
      setPhotos(result.photos);
      setChanged(nowChanged);
    });
  }

  const save = (next: SlotPhotos) => run(() => saveSitePhotos(slot.id, next.images, next.cover), next);

  function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) return;
    run(async () => {
      let result: PhotoActionResult = { error: "사진을 고르지 않았어요." };
      // 여러 장을 골랐으면 차례로 — 한 장이라도 실패하면 거기서 멈춤
      for (const file of files) {
        let blob: Blob;
        try {
          blob = await resizeToJpeg(file);
        } catch {
          return { error: `"${file.name}" 사진을 읽지 못했어요. JPG·PNG 사진으로 올려 주세요.` };
        }
        const formData = new FormData();
        formData.set("photo", new File([blob], "photo.jpg", { type: "image/jpeg" }));
        result = await addSitePhoto(slot.id, formData);
        if (result.error !== null) return result;
        setPhotos(result.photos);
        setChanged(true);
      }
      return result;
    });
  }

  return (
    <section className="rounded-xl bg-white px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-extrabold text-ink">
          {slot.label}
          {!slot.single && (
            <span className="ml-1.5 text-[12px] font-semibold text-sub">
              {photos.images.length}장 / 최대 {MAX_SLOT_PHOTOS}장
            </span>
          )}
        </h3>
        <div className="flex gap-1.5">
          {changed && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (window.confirm(`"${slot.label}" 사진을 처음 사진으로 되돌릴까요?`)) {
                  run(() => resetSitePhotos(slot.id), undefined, false);
                }
              }}
              className={buttonClassName}
            >
              처음 사진으로
            </button>
          )}
          <button
            type="button"
            disabled={isPending || full}
            onClick={() => fileInput.current?.click()}
            className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-bold text-white transition hover:bg-brand-dark disabled:opacity-40"
          >
            {isPending ? "저장 중…" : slot.single ? "사진 바꾸기" : "+ 사진 추가"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple={!slot.single}
            onChange={upload}
            className="hidden"
          />
        </div>
      </div>
      {error && <ErrorText>{error}</ErrorText>}

      <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {photos.images.map((src, index) => {
          const isCover = !slot.single && index === photos.cover;
          return (
            <li key={src}>
              <div
                className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-soft ${isCover ? "ring-2 ring-brand" : ""}`}
              >
                <Image src={src} alt={`${slot.label} ${index + 1}번 사진`} fill sizes="180px" className="object-cover" />
                {!slot.single && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white">
                    {index + 1}번
                  </span>
                )}
                {isCover && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
                    대표
                  </span>
                )}
              </div>
              {!slot.single && (
                <div className="mt-1.5 grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    aria-label={`${index + 1}번 사진을 앞으로`}
                    disabled={isPending || index === 0}
                    onClick={() => save(movePhoto(photos, index, -1))}
                    className={buttonClassName}
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    aria-label={`${index + 1}번 사진을 뒤로`}
                    disabled={isPending || index === photos.images.length - 1}
                    onClick={() => save(movePhoto(photos, index, 1))}
                    className={buttonClassName}
                  >
                    ▶
                  </button>
                  <button
                    type="button"
                    aria-label={`${index + 1}번 사진을 대표 사진으로`}
                    disabled={isPending || isCover}
                    onClick={() => save({ images: photos.images, cover: index })}
                    className={buttonClassName}
                  >
                    대표
                  </button>
                  <button
                    type="button"
                    aria-label={`${index + 1}번 사진 지우기`}
                    disabled={isPending || photos.images.length <= 1}
                    onClick={() => {
                      if (window.confirm(`${index + 1}번 사진을 지울까요?`)) save(removePhoto(photos, index));
                    }}
                    className={`${buttonClassName} text-danger`}
                  >
                    삭제
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
