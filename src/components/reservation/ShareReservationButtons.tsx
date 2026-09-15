"use client";

import Script from "next/script";
import { useState } from "react";
import { lookupPath } from "@/data/shop";
import { useT } from "@/hooks/useLocale";
import { buildReservationShareText, KAKAO_JS_KEY, KAKAO_TEXT_MAX } from "@/lib/reservationShare";
import type { ReservationRequest } from "@/types/reservation";

/** 카카오 JavaScript SDK — 버전을 올릴 땐 integrity 값도 새 파일로 다시 계산 */
const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.3/kakao.min.js";
const KAKAO_SDK_INTEGRITY = "sha384-oroumrnFVE0xtgqyDZJARgERibXg2C28380uaUZz2kHDS5CR7tu20eGiOU6GkTpy";
const NOTICE_MS = 5000;

type KakaoSdk = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: {
    sendDefault: (options: {
      objectType: "text";
      text: string;
      link: { mobileWebUrl: string; webUrl: string };
      buttonTitle?: string;
    }) => void;
  };
};

const getKakao = () => (window as unknown as { Kakao?: KakaoSdk }).Kakao;

/**
 * 신청 완료 화면 — 예약 요약을 손님 카카오톡(나와의 채팅)으로 보내기.
 * 카카오 키가 없거나 SDK를 못 불러오면 휴대폰 공유 창 / 복사로 대신함
 */
export default function ShareReservationButtons({ id, request }: { id: string; request: ReservationRequest }) {
  const t = useT();
  const [kakaoReady, setKakaoReady] = useState(() => Boolean(KAKAO_JS_KEY && typeof window !== "undefined" && getKakao()?.isInitialized()));
  const [notice, setNotice] = useState<string | null>(null);

  const text = buildReservationShareText(t, id, request);
  const kakaoText = buildReservationShareText(t, id, request, KAKAO_TEXT_MAX);
  const lookupUrl = () => `${window.location.origin}${lookupPath}`;

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), NOTICE_MS);
  };

  const initKakao = () => {
    const kakao = getKakao();
    if (!kakao || !KAKAO_JS_KEY) return;
    try {
      if (!kakao.isInitialized()) kakao.init(KAKAO_JS_KEY);
      setKakaoReady(true);
    } catch {
      setKakaoReady(false);
    }
  };

  const sendKakao = () => {
    const kakao = getKakao();
    if (!kakao?.isInitialized()) return shareOther();
    try {
      const url = lookupUrl();
      kakao.Share.sendDefault({
        objectType: "text",
        text: kakaoText,
        link: { mobileWebUrl: url, webUrl: url },
        buttonTitle: t.share.lookupButton,
      });
    } catch {
      shareOther();
    }
  };

  /** 휴대폰 공유 창(카톡·문자·메모 등) → 안 되면 복사 */
  async function shareOther() {
    const full = `${text}\n${t.share.lookupButton}: ${lookupUrl()}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: t.share.title(t.shop.name), text: full });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return; // 손님이 닫음
      }
    }
    try {
      await navigator.clipboard.writeText(full);
      showNotice(t.share.copied);
    } catch {
      showNotice(t.share.failed);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      {KAKAO_JS_KEY && (
        <Script
          src={KAKAO_SDK_URL}
          integrity={KAKAO_SDK_INTEGRITY}
          crossOrigin="anonymous"
          strategy="lazyOnload"
          onReady={initKakao}
        />
      )}
      {kakaoReady && (
        <>
          <button
            type="button"
            onClick={sendKakao}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-kakao text-[15px] font-bold text-kakao-ink transition active:scale-[0.99]"
          >
            <span aria-hidden="true">💬</span>
            {t.share.kakao}
          </button>
          <p className="text-[12px] text-sub">{t.share.kakaoHint}</p>
        </>
      )}
      <button
        type="button"
        onClick={shareOther}
        className={`w-full rounded-xl border border-field bg-white text-[14px] font-semibold text-body transition hover:border-brand ${
          kakaoReady ? "py-2.5" : "h-12"
        }`}
      >
        {t.share.other}
      </button>
      {notice && (
        <p role="status" className="text-[13px] font-semibold text-brand-dark">
          {notice}
        </p>
      )}
    </div>
  );
}
