import "server-only";

import { redirect } from "next/navigation";
import { getAdminEmails, getSupabaseEnv } from "./env";
import { createAuthClient } from "./supabase";

export const ADMIN_LOGIN_PATH = "/admin/login";

/**
 * 로그인한 관리자 이메일 — 로그인 안 했거나 허용 목록(ADMIN_EMAILS)에 없으면 null.
 * getClaims()로 토큰 서명을 검증하므로 쿠키만 위조해서는 통과할 수 없음.
 */
export async function getAdminEmail(): Promise<string | null> {
  if (!getSupabaseEnv()) return null;

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : null;
  if (error || !email) return null;

  return getAdminEmails().includes(email) ? email : null;
}

/** 관리자 페이지·관리자 서버 함수 맨 앞에서 호출 — 아니면 로그인 화면으로 */
export async function requireAdmin(): Promise<string> {
  const email = await getAdminEmail();
  if (!email) redirect(ADMIN_LOGIN_PATH);
  return email;
}
