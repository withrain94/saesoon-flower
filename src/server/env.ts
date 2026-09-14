import "server-only";

import { normalizeSupabaseUrl } from "@/lib/supabaseUrl";

/**
 * 서버 환경변수 — .env.local(로컬) / Vercel 프로젝트 설정(배포)에 넣음. 값은 .env.example 참고.
 * 비밀 키(SUPABASE_SECRET_KEY)는 서버에서만 읽고 브라우저로 절대 보내지 않음.
 */
export function getSupabaseEnv() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !publishableKey || !secretKey) return null;
  return { url, publishableKey, secretKey };
}

/**
 * 사이트 주소 — 알림 속 관리자 링크용. 요청 헤더는 조작될 수 있어 쓰지 않고,
 * 배포(Vercel)에서는 Vercel이 넣어주는 실제 사이트 주소, 내 컴퓨터에서는 localhost
 */
export function getSiteOrigin() {
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;
  return process.env.NODE_ENV === "development" ? "http://localhost:3000" : null;
}

/**
 * 새 예약 텔레그램 알림 — 봇 토큰(비밀) + 받을 채팅 id(쉼표로 여러 곳). 둘 중 하나라도 없으면 알림 끔
 */
export function getTelegramEnv() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!botToken || chatIds.length === 0) return null;
  return { botToken, chatIds };
}

/** 관리자 페이지에 들어올 수 있는 이메일 (쉼표로 여러 개) */
export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
