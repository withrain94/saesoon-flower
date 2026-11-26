import "server-only";

import {
  autoSmsDates,
  autoSmsKindLabel,
  CANCEL_NOTICE_HOURS,
  PAYMENT_NOTICE_HOURS,
  getDueAutoSms,
  type AutoSms,
  type AutoSmsReservation,
} from "@/lib/autoSms";
import { formatAdminDate, formatAdminTime } from "@/lib/adminFormat";
import { downloadMmsPhoto, getLatestCompletionPhotoName } from "./completionPhotos";
import { getSiteOrigin, getSmsGateEnv } from "./env";
import { sendTelegramMessage } from "./notify";
import { listAutoSmsReservations, updateReservation } from "./reservations";
import { sendSms } from "./sms";
import { createDatabaseClient } from "./supabase";

/**
 * 자동 문자 보내기 — 10분마다 app/cron/auto-sms 가 부름 (Supabase pg_cron, schema.sql 2026-11-18 추가 SQL).
 * 무엇을 언제 보낼지는 lib/autoSms, 보낸 기록은 auto_sms_log 표(같은 예약·종류·번호는 한 번만).
 * 사진 문자인데 완성 사진이 없으면 보내지 않고 매장 텔레그램에 한 번 알림 → 사진을 올리면 다음 실행(10분 안)에 보냄.
 */
const LOG_TABLE = "auto_sms_log";

/** 폰이 꺼져 있을 때 기다리는 시간 — 30분 넘게 늦으면 안 보냄 */
const AUTO_TTL_SECONDS = 30 * 60;

type LogState = "sending" | "sent" | "failed" | "nophoto";
type LogRow = { reservation_id: string; kind: string; phone: string; state: LogState };

const logKey = (reservationId: string, sms: Pick<AutoSms, "kind" | "phoneNumber">) =>
  `${reservationId}|${sms.kind}|${sms.phoneNumber}`;

async function readLog(reservationIds: string[]) {
  const { data, error } = await createDatabaseClient()
    .from(LOG_TABLE)
    .select("reservation_id, kind, phone, state")
    .in("reservation_id", reservationIds);
  if (error) throw error;
  return new Map((data as LogRow[]).map((row) => [`${row.reservation_id}|${row.kind}|${row.phone}`, row.state]));
}

/** 보내기 전에 "보내는 중"으로 먼저 적어 둠 — 동시에 두 번 실행돼도 한 번만 나가게 (이미 있으면 false) */
async function claim(reservationId: string, sms: AutoSms, previous: LogState | undefined) {
  const client = createDatabaseClient();
  const row = { reservation_id: reservationId, kind: sms.kind, phone: sms.phoneNumber, state: "sending" as const };
  if (previous === "nophoto") {
    const { data, error } = await client
      .from(LOG_TABLE)
      .update({ state: "sending", updated_at: new Date().toISOString() })
      .match({ reservation_id: reservationId, kind: sms.kind, phone: sms.phoneNumber, state: "nophoto" })
      .select("kind");
    return !error && (data?.length ?? 0) > 0;
  }
  const { error } = await client.from(LOG_TABLE).insert(row);
  return !error;
}

async function writeLog(reservationId: string, sms: AutoSms, state: LogState, errorText: string | null = null) {
  await createDatabaseClient()
    .from(LOG_TABLE)
    .upsert({
      reservation_id: reservationId,
      kind: sms.kind,
      phone: sms.phoneNumber,
      state,
      error: errorText,
      updated_at: new Date().toISOString(),
    });
}

function describeReservation(reservation: AutoSmsReservation) {
  const { request } = reservation;
  const origin = getSiteOrigin();
  return [
    `· ${formatAdminDate(request.date)} ${formatAdminTime(request.time)} ${request.ordererName} (${reservation.id.slice(0, 8).toUpperCase()})`,
    origin ? `  ${origin}/admin/${reservation.id}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendDueAutoSms(now: Date = new Date()) {
  if (!getSmsGateEnv()) return { configured: false, sent: 0 };

  const canceledSince = new Date(now.getTime() - CANCEL_NOTICE_HOURS * 60 * 60 * 1000);
  const paidSince = new Date(now.getTime() - PAYMENT_NOTICE_HOURS * 60 * 60 * 1000);
  const reservations = await listAutoSmsReservations(autoSmsDates(now), canceledSince, paidSince);
  const dueList = reservations
    .map((reservation) => ({ reservation, due: getDueAutoSms(reservation, now) }))
    .filter((item) => item.due.length > 0);
  if (dueList.length === 0) return { configured: true, sent: 0 };

  const log = await readLog(dueList.map((item) => item.reservation.id));
  const sent: string[] = [];
  const noPhoto: string[] = [];
  const failed: string[] = [];

  for (const { reservation, due } of dueList) {
    for (const sms of due) {
      const previous = log.get(logKey(reservation.id, sms));
      if (previous === "sending" || previous === "sent" || previous === "failed") continue;

      let photo: ArrayBuffer | null = null;
      if (sms.withPhoto) {
        const name = await getLatestCompletionPhotoName(reservation.id);
        photo = name ? await downloadMmsPhoto(reservation.id, name) : null;
        if (!photo) {
          // 사진이 아직 없음 → 처음 한 번만 매장에 알리고, 사진이 올라오면 다음 실행 때 보냄
          if (previous !== "nophoto") {
            await writeLog(reservation.id, sms, "nophoto");
            noPhoto.push(`${autoSmsKindLabel[sms.kind]}\n${describeReservation(reservation)}`);
          }
          continue;
        }
      }

      if (!(await claim(reservation.id, sms, previous))) continue;
      const result = await sendSms({
        phoneNumber: sms.phoneNumber,
        text: sms.text,
        photo,
        waitForResult: false,
        ttlSeconds: AUTO_TTL_SECONDS,
      });
      if (result.state === "notConfigured") {
        await createDatabaseClient()
          .from(LOG_TABLE)
          .delete()
          .match({ reservation_id: reservation.id, kind: sms.kind, phone: sms.phoneNumber });
        return { configured: false, sent: sent.length };
      }
      if (result.state === "failed") {
        await writeLog(reservation.id, sms, "failed", result.error);
        failed.push(`${autoSmsKindLabel[sms.kind]} — ${result.error}\n${describeReservation(reservation)}`);
        continue;
      }
      await writeLog(reservation.id, sms, "sent");
      sent.push(`${autoSmsKindLabel[sms.kind]} · ${reservation.request.ordererName}`);
      // 사진 문자를 보냈으면 관리자 화면 "안내 문자 보냄"도 켬
      if (sms.withPhoto) await updateReservation(reservation.id, { reminderSentAt: new Date().toISOString() }).catch(() => {});
    }
  }

  const parts: string[] = [];
  if (noPhoto.length > 0) {
    parts.push(
      `📷 완성 사진이 없어 사진 문자를 아직 안 보냈어요 (${noPhoto.length}건)\n사진을 올리면 10분 안에 자동으로 보내요. 직접 보내셔도 돼요.\n\n${noPhoto.join("\n\n")}`,
    );
  }
  if (failed.length > 0) {
    parts.push(`⚠️ 자동 문자를 보내지 못했어요 (${failed.length}건) — 직접 연락해 주세요\n\n${failed.join("\n\n")}`);
  }
  if (sent.length > 0) parts.push(`📱 자동 문자 ${sent.length}통 보냄\n${sent.map((line) => `· ${line}`).join("\n")}`);
  if (parts.length > 0) await sendTelegramMessage(parts.join("\n\n────────\n\n"));

  return { configured: true, sent: sent.length, noPhoto: noPhoto.length, failed: failed.length };
}
