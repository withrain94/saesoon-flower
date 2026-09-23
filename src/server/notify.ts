import "server-only";

import { buildReservationNotice } from "@/lib/reservationNotice";
import type { ReservationRequest } from "@/types/reservation";
import { ADMIN_HOME_PATH } from "./auth";
import { getTelegramEnv } from "./env";

const TELEGRAM_TIMEOUT_MS = 8000;
/** 실패하면 몇 번까지 보내볼지 (잠깐 끊긴 경우 대비) */
const TELEGRAM_TRIES = 2;
const TELEGRAM_RETRY_DELAY_MS = 1500;

/**
 * 텔레그램 봇으로 메시지 보내기 — 설정이 없으면 조용히 건너뜀.
 * 실패해도 예외를 던지지 않음 (알림 실패가 예약 저장을 망치면 안 되므로). 보낸 곳 수를 돌려줌
 */
export async function sendTelegramMessage(text: string): Promise<number> {
  const env = getTelegramEnv();
  if (!env) return 0;

  let sent = 0;
  for (const chatId of env.chatIds) {
    // 잠깐 끊겼을 때를 대비해 한 번 더 시도 (예약 저장은 이미 끝난 뒤라 알림만 다시 보냄)
    for (let attempt = 1; attempt <= TELEGRAM_TRIES; attempt += 1) {
      const error = await sendOnce(env.botToken, chatId, text);
      if (!error) {
        sent += 1;
        break;
      }
      const last = attempt === TELEGRAM_TRIES;
      console.error(`[telegram] 보내기 실패(${attempt}/${TELEGRAM_TRIES})`, error, last ? "— 포기" : "— 다시 시도");
      if (!last) await new Promise((resolve) => setTimeout(resolve, TELEGRAM_RETRY_DELAY_MS));
    }
  }
  return sent;
}

/** 한 번 보내기 — 성공하면 null, 실패하면 남길 설명 (봇 토큰이 주소에 들어가므로 주소는 남기지 않음) */
async function sendOnce(botToken: string, chatId: string, text: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });
    if (response.ok) return null;
    const body = (await response.json().catch(() => null)) as { description?: string } | null;
    return `${response.status} ${body?.description ?? ""}`.trim();
  } catch (error) {
    return error instanceof Error ? error.name : "unknown";
  }
}

/** 텔레그램 한 메시지 최대 4096자 — 상품이 많아 길어지면 줄 단위로 여유 있게 나눔 */
const MESSAGE_MAX = 3500;

function splitByLines(text: string) {
  const chunks: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    if (current && current.length + 1 + line.length > MESSAGE_MAX) {
      chunks.push(current);
      current = line;
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** 새 예약 알림 — origin: 사이트 주소 (관리자 상세 링크용, 모르면 null) */
export async function notifyNewReservation(id: string, request: ReservationRequest, origin: string | null) {
  const adminUrl = origin ? `${origin}${ADMIN_HOME_PATH}/${id}` : null;
  for (const message of splitByLines(buildReservationNotice(id, request, adminUrl))) {
    await sendTelegramMessage(message);
  }
}
