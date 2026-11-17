import { timingSafeEqual } from "node:crypto";
import { sendDueAutoSms } from "@/server/autoSms";
import { getCronSecret } from "@/server/env";

/**
 * 자동 문자 — Supabase pg_cron이 10분마다 부름 (schema.sql 2026-11-18 추가 SQL).
 * Authorization: Bearer <CRON_SECRET> 이 맞을 때만 실행. 응답에는 개수만 (손님 정보 없음)
 */
export const maxDuration = 60;

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
    const result = await sendDueAutoSms();
    return Response.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[cron] 자동 문자 실패", error instanceof Error ? error.message : "unknown");
    return Response.json({ ok: false }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
