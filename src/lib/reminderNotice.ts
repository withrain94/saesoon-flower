import { getEventOn } from "@/data/events";
import { getStatusOption } from "@/data/reservationStatus";
import { ko } from "@/i18n/ko";
import { formatAdminDate, formatAdminTime, localeNames, summarizeItems } from "@/lib/adminFormat";
import { getEventCopy } from "@/lib/events";
import type { StoredReservation } from "@/types/reservation";

/**
 * 전날 "내일 예약 목록" 텔레그램 문구 — 매장이 보고 예약자에게 안내 문자를 보내도록.
 * 실제 보내기는 server/reminders.ts (매일 저녁 Vercel Cron)
 */

/** 텔레그램 한 메시지 최대 4096자 — 여유를 두고 나눔 */
const MESSAGE_MAX = 3500;

function describeReservation(reservation: StoredReservation) {
  const { request } = reservation;
  const flags = [
    getStatusOption(reservation.status).label,
    reservation.reminderSentAt ? "✅ 문자 보냄" : "📱 문자 전",
    request.locale && request.locale !== "ko" && `🌎 ${localeNames[request.locale]} 신청`,
    reservation.cancelRequest?.paid && "⚠️ 취소 요청",
  ].filter(Boolean);

  return [
    `${formatAdminTime(request.time)} · ${request.ordererName} · ${request.ordererPhone}`,
    `  ${summarizeItems(request)} · ${flags.join(" · ")}`,
  ].join("\n");
}

/** dateKey: 받는 날짜(내일). 한 번에 보낼 메시지들 (예약이 많으면 여러 개) */
export function buildTomorrowReminderMessages(
  dateKey: string,
  reservations: StoredReservation[],
  adminUrl: string | null,
): string[] {
  const event = getEventOn(dateKey);
  const day = `${formatAdminDate(dateKey)}${event ? ` · ${getEventCopy(event, ko).shortTitle}` : ""}`;

  if (reservations.length === 0) {
    return [`📅 내일 ${day} 예약은 아직 없어요.`];
  }

  const pending = reservations.filter((reservation) => !reservation.reminderSentAt).length;
  const header = `📅 내일 ${day} 예약 ${reservations.length}건 — 안내 문자 보낼 곳 ${pending}건`;
  const footer = [
    "문자를 보낸 뒤 관리자 상세에서 \"안내 문자 보냈어요\"를 눌러주세요. (취소된 예약은 빠져 있어요)",
    adminUrl,
  ]
    .filter(Boolean)
    .join("\n");

  const messages: string[] = [];
  let current = header;
  for (const block of reservations.map(describeReservation)) {
    if (current.length + block.length + 2 > MESSAGE_MAX) {
      messages.push(current);
      current = `(이어서) ${formatAdminDate(dateKey)}`;
    }
    current += `\n\n${block}`;
  }
  messages.push(`${current}\n\n${footer}`);
  return messages;
}
