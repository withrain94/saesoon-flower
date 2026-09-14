import "server-only";

import { buildReservationNotice } from "@/lib/reservationNotice";
import type { ReservationRequest } from "@/types/reservation";
import { ADMIN_HOME_PATH } from "./auth";
import { getTelegramEnv } from "./env";

const TELEGRAM_TIMEOUT_MS = 8000;

/**
 * 텔레그램 봇으로 메시지 보내기 — 설정이 없으면 조용히 건너뜀.
 * 실패해도 예외를 던지지 않음 (알림 실패가 예약 저장을 망치면 안 되므로). 보낸 곳 수를 돌려줌
 */
export async function sendTelegramMessage(text: string): Promise<number> {
  const env = getTelegramEnv();
  if (!env) return 0;

  let sent = 0;
  for (const chatId of env.chatIds) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${env.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, link_preview_options: { is_disabled: true } }),
        signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
      });
      if (response.ok) {
        sent += 1;
      } else {
        // 봇 토큰이 주소에 들어가므로 주소는 남기지 않고 텔레그램의 설명만
        const body = (await response.json().catch(() => null)) as { description?: string } | null;
        console.error("[telegram] 보내기 실패", response.status, body?.description ?? "");
      }
    } catch (error) {
      console.error("[telegram] 보내기 실패", error instanceof Error ? error.name : "unknown");
    }
  }
  return sent;
}

/** 새 예약 알림 — origin: 사이트 주소 (관리자 상세 링크용, 모르면 null) */
export async function notifyNewReservation(id: string, request: ReservationRequest, origin: string | null) {
  const adminUrl = origin ? `${origin}${ADMIN_HOME_PATH}/${id}` : null;
  await sendTelegramMessage(buildReservationNotice(id, request, adminUrl));
}
