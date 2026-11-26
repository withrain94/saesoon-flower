"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { resizeToJpeg, resizeToJpegUnder } from "@/lib/resizeImage";
import { addCompletionPhoto, removeCompletionPhoto, type CompletionPhotoResult } from "@/server/actions/completion";
import type { CompletionPhoto } from "@/server/completionPhotos";

/** 완성 사진 — [사진 찍기](휴대폰 카메라 바로 열림) · [사진첩에서 고르기](여러 장) + 지우기 */
export default function CompletionPhotoList({
  id,
  photos,
  onChange,
  max,
}: {
  id: string;
  photos: CompletionPhoto[];
  onChange: (photos: CompletionPhoto[]) => void;
  max: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const full = photos.length >= max;

  function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) return;
    setError(null);
    startTransition(async () => {
      for (const [index, file] of files.entries()) {
        setProgress(files.length > 1 ? `올리는 중… (${index + 1}/${files.length})` : "올리는 중…");
        const formData = new FormData();
        try {
          // 화면용(긴 변 1600px) + 사진 문자용(긴 변 1280px·화질 85%, 통신사 사진 문자 용량 제한 때문에 300KB 이하로(실제 발송 확인한 크기) — 2026-11-26 화질 개선)
          formData.set("full", new File([await resizeToJpeg(file, 1600, 0.85)], "full.jpg", { type: "image/jpeg" }));
          formData.set("mms", new File([await resizeToJpegUnder(file, 1280, 0.85, 300_000)], "mms.jpg", { type: "image/jpeg" }));
        } catch {
          setError(`"${file.name}" 사진을 읽지 못했어요. JPG·PNG 사진으로 올려 주세요.`);
          break;
        }
        const result: CompletionPhotoResult = await addCompletionPhoto(id, formData).catch(() => ({
          error: "저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
        }));
        if (result.error !== null) {
          setError(result.error);
          break;
        }
        onChange(result.photos);
      }
      setProgress(null);
    });
  }

  function remove(name: string) {
    if (!window.confirm("이 완성 사진을 지울까요?")) return;
    setError(null);
    startTransition(async () => {
      const result: CompletionPhotoResult = await removeCompletionPhoto(id, name).catch(() => ({
        error: "지우지 못했어요. 잠시 후 다시 시도해 주세요.",
      }));
      if (result.error !== null) setError(result.error);
      else onChange(result.photos);
    });
  }

  const buttonClassName =
    "flex-1 rounded-xl border-2 border-brand bg-white px-3 py-3 text-[15px] font-bold text-brand-dark transition hover:bg-brand-tint disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div>
      <div className="flex gap-2">
        <button type="button" disabled={isPending || full} onClick={() => cameraInput.current?.click()} className={buttonClassName}>
          📷 사진 찍기
        </button>
        <button type="button" disabled={isPending || full} onClick={() => galleryInput.current?.click()} className={buttonClassName}>
          🖼 사진첩에서 고르기
        </button>
        <input ref={cameraInput} type="file" accept="image/*" capture="environment" onChange={upload} className="hidden" />
        <input ref={galleryInput} type="file" accept="image/*" multiple onChange={upload} className="hidden" />
      </div>
      <p className="mt-1.5 text-[12px] text-sub">
        {progress ?? `${photos.length}장 / 최대 ${max}장 · 손님은 문자 속 링크로만 볼 수 있어요`}
      </p>
      {error && <ErrorText>{error}</ErrorText>}

      {photos.length > 0 && (
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <li key={photo.name} className="relative overflow-hidden rounded-lg bg-soft">
              <a href={photo.url} target="_blank" rel="noreferrer">
                {/* 비공개 보관함의 임시 주소라 next/image 대신 그냥 그림 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="완성 사진" className="aspect-square w-full object-cover" />
              </a>
              <button
                type="button"
                disabled={isPending}
                onClick={() => remove(photo.name)}
                className="absolute right-1 top-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[12px] font-semibold text-danger disabled:opacity-40"
              >
                지우기
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
