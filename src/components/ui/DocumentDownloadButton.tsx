"use client";

import { useState } from "react";
import { documentPdfPath } from "@/data/shop";
import type { BusinessDocumentType } from "@/types/reservation";

/** 서버가 보낸 파일 이름 (filename*=UTF-8''…) — 못 읽으면 기본 이름 */
function fileNameFrom(response: Response, fallback: string) {
  const match = response.headers.get("Content-Disposition")?.match(/filename\*=UTF-8''([^;]+)/);
  if (!match) return fallback;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return fallback;
  }
}

/**
 * 견적서·거래명세표 PDF 다운로드 버튼 — 누르면 파일이 바로 저장됨.
 * phone: 손님 완료 화면은 예약자 연락처로 확인 / 관리자 화면은 비워 두면 로그인으로 확인
 */
export default function DocumentDownloadButton({
  id,
  type,
  phone = "",
  label,
  busyLabel,
  failedText,
}: {
  id: string;
  type: BusinessDocumentType;
  phone?: string;
  label: string;
  busyLabel: string;
  failedText: string;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function download() {
    setBusy(true);
    setFailed(false);
    try {
      const body = new FormData();
      body.set("id", id);
      body.set("type", type);
      body.set("phone", phone);
      const response = await fetch(documentPdfPath, { method: "POST", body });
      if (!response.ok) throw new Error(String(response.status));

      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = fileNameFrom(response, `${type}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      // 휴대폰 브라우저가 파일을 다 받을 시간을 두고 정리
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="w-full rounded-lg bg-brand px-3 py-2.5 text-[14px] font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? busyLabel : label}
      </button>
      {failed && (
        <p role="alert" className="mt-1 text-[12px] text-danger">
          {failedText}
        </p>
      )}
    </div>
  );
}
