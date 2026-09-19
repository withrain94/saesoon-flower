import { timingSafeEqual } from "node:crypto";
import { getCronSecret } from "@/server/env";
import { sendTomorrowReminderList } from "@/server/reminders";

/**
 * 매일 저녁 "내일 예약 목록" 텔레그램 — Vercel Cron이 부름 (시간은 vercel.json, UTC 기준).
 * Vercel이 보내는 Authorization: Bearer <CRON_SECRET> 이 맞을 때만 실행
 */
function isAuthorized(request: Request) {
  const secret = getCronSecret();
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await sendTomorrowReminderList();
    return Response.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[cron] 내일 예약 목록 실패", error instanceof Error ? error.message : "unknown");
    return Response.json({ ok: false }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
