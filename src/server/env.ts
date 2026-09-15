import "server-only";

import { getSupabasePublicConfig } from "@/lib/supabaseUrl";

/**
 * 서버 환경변수 — .env.local(로컬) / Vercel 프로젝트 설정(배포)에 넣음. 값은 .env.example 참고.
 * 비밀 키(SUPABASE_SECRET_KEY)는 서버에서만 읽고 브라우저로 절대 보내지 않음.
 */
export function getSupabaseEnv() {
  const publicConfig = getSupabasePublicConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!publicConfig || !secretKey) return null;
  return { ...publicConfig, secretKey };
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

/** 노션 페이지 주소나 id에서 32자리 id만 뽑음 (예: https://www.notion.so/새순-예약-1a2b…) */
export function parseNotionPageId(value: string | undefined) {
  const match = value?.replace(/-/g, "").match(/[0-9a-f]{32}(?![0-9a-f])/i);
  return match ? match[0].toLowerCase() : null;
}

/**
 * 노션 날짜별 예약 표 — NOTION_TOKEN(노션 연결 비밀 토큰) + NOTION_PARENT_PAGE_ID(날짜별 페이지를 만들 노션 페이지 주소 또는 id).
 * 둘 중 하나라도 없으면 노션 올리기 끔
 */
export function getNotionEnv() {
  const token = process.env.NOTION_TOKEN?.trim();
  const parentPageId = parseNotionPageId(process.env.NOTION_PARENT_PAGE_ID);
  if (!token || !parentPageId) return null;
  return { token, parentPageId };
}

/**
 * 견적서·거래명세표 이메일 — GMAIL_USER(보내는 가게 Gmail 주소) + GMAIL_APP_PASSWORD(구글 "앱 비밀번호" 16자리, 비밀).
 * 둘 중 하나라도 없으면 이메일 보내기 끔. 앱 비밀번호는 띄어쓰기를 넣어 복사해도 됨
 */
export function getGmailEnv() {
  const user = process.env.GMAIL_USER?.trim();
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !appPassword) return null;
  return { user, appPassword };
}

/** 관리자 페이지에 들어올 수 있는 이메일 (쉼표로 여러 개) */
export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
