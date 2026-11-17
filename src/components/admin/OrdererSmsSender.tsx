"use client";

import { useState, useTransition } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { buildOrdererSmsText, isAppleMobile, MAX_SMS_TEXT, smsAppLink } from "@/lib/ordererSms";
import { sendOrdererSms, type SendSmsResult } from "@/server/actions/completion";
import type { CompletionPhoto } from "@/server/completionPhotos";
import type { ReservationRequest } from "@/types/reservation";

/**
 * [지금 문자 보내기] — 누르면 안내 문구가 채워진 미리보기 → 고칠 수 있음 → [보내기]를 누르면
 * 매장 안드로이드 폰(SMS Gate 앱)이 예약자에게 자동 발송. 완성 사진을 고르면 사진 문자.
 */
export default function OrdererSmsSender({
  id,
  request,
  photos,
  configured,
}: {
  id: string;
  request: ReservationRequest;
  photos: CompletionPhoto[];
  /** SMS Gate 설정이 있는지 (없으면 휴대폰 문자 앱 열기만) */
  configured: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [ios, setIos] = useState(false);

  function start() {
    // 문자 앱 링크 모양이 아이폰·안드로이드가 달라서, 미리보기를 열 때 이 기기를 확인
    setIos(isAppleMobile(navigator.userAgent, navigator.maxTouchPoints));
    setText(buildOrdererSmsText(id, request, { hasPhotos: photos.length > 0 }));
    // 기본: 가장 최근에 올린 완성 사진을 붙임
    setPhotoName(photos.at(-1)?.name ?? null);
    setError(null);
    setDone(null);
    setOpen(true);
  }

  function send() {
    setError(null);
    startTransition(async () => {
      const result: SendSmsResult = await sendOrdererSms(id, text, photoName).catch(() => ({
        ok: false as const,
        error: "보내지 못했어요. 잠시 후 다시 시도해 주세요.",
      }));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setDone(
        (result.state === "sent"
          ? "✅ 문자를 보냈어요."
          : "📨 매장 휴대폰에 전달했어요. 휴대폰이 켜져 있으면 곧 나가요. (안 나가면 휴대폰의 SMS Gate 앱을 확인해 주세요)") +
          (result.markError ? ` ${result.markError}` : ""),
      );
    });
  }

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={start}
          className="w-full rounded-xl bg-brand px-4 py-3 text-[16px] font-extrabold text-white transition hover:bg-brand-dark"
        >
          📱 지금 문자 보내기
        </button>
        {done && <p className="mt-2 text-[13.5px] font-semibold text-ink">{done}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border-2 border-brand bg-white p-3">
      <p className="text-[14px] font-bold text-ink">
        받는 분: {request.ordererName} · {request.ordererPhone}
      </p>

      <label className="block">
        <span className="text-[13px] font-semibold text-sub">보낼 내용 (고칠 수 있어요)</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={MAX_SMS_TEXT}
          rows={10}
          className="mt-1 w-full rounded-lg border border-field px-3 py-2 text-[14px] leading-relaxed text-ink focus:border-brand focus:outline-none"
        />
      </label>

      {photos.length > 0 && (
        <div>
          <p className="text-[13px] font-semibold text-sub">함께 보낼 완성 사진</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPhotoName(null)}
              className={`h-16 w-16 rounded-lg border-2 text-[12px] font-semibold ${photoName === null ? "border-brand text-brand-dark" : "border-field text-sub"}`}
            >
              사진
              <br />
              없이
            </button>
            {photos.map((photo) => (
              <button
                key={photo.name}
                type="button"
                onClick={() => setPhotoName(photo.name)}
                className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${photoName === photo.name ? "border-brand" : "border-transparent opacity-60"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="완성 사진" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-1 text-[12px] text-sub">사진을 고르면 사진 문자로 가요. 문구 속 링크로도 사진을 볼 수 있어요.</p>
        </div>
      )}

      {error && <ErrorText>{error}</ErrorText>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isPending}
          className="rounded-xl border border-field bg-white px-4 py-3 text-[14px] font-semibold text-body disabled:opacity-40"
        >
          닫기
        </button>
        <button
          type="button"
          onClick={send}
          disabled={isPending || !configured || !text.trim()}
          className="flex-1 rounded-xl bg-brand px-4 py-3 text-[15px] font-extrabold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "보내는 중… (최대 15초)" : configured ? "보내기" : "자동 발송 설정 전"}
        </button>
      </div>

      <p className="text-[12px] text-sub">
        {configured
          ? "자동 발송이 안 될 때: "
          : "자동 발송은 매장 휴대폰에 SMS Gate 앱을 설정하면 켜져요. 지금은 "}
        <a href={smsAppLink(request.ordererPhone, text, { ios })} className="font-semibold text-brand-dark underline">
          휴대폰 문자 앱으로 보내기
        </a>
        {" "}(이 화면을 연 휴대폰의 문자 앱이 열려요 · 사진은 직접 첨부)
      </p>
    </div>
  );
}
