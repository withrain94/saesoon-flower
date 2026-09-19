import "server-only";

import { addDaysToKey } from "@/lib/date";
import { buildTomorrowReminderMessages } from "@/lib/reminderNotice";
import { toNowInTimeZone } from "@/lib/time";
import { ADMIN_HOME_PATH } from "./auth";
import { getSiteOrigin } from "./env";
import { sendTelegramMessage } from "./notify";
import { listReservationsOnDate } from "./reservations";

/**
 * 매장 텔레그램으로 "내일 예약 목록" 보내기 — 매일 저녁 app/cron/tomorrow-reminders 가 부름.
 * 날짜는 한국 시각 기준 내일. 결과는 개수만 돌려줌 (손님 정보는 응답에 넣지 않음)
 */
export async function sendTomorrowReminderList(now: Date = new Date()) {
  const date = addDaysToKey(toNowInTimeZone(now).dateKey, 1);
  const reservations = await listReservationsOnDate(date);
  const origin = getSiteOrigin();
  const messages = buildTomorrowReminderMessages(date, reservations, origin ? `${origin}${ADMIN_HOME_PATH}` : null);

  let sent = 0;
  for (const message of messages) sent += await sendTelegramMessage(message);
  return { date, reservations: reservations.length, messages: messages.length, sent };
}
