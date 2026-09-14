import "server-only";

/**
 * 서버 환경변수 — .env.local(로컬) / Vercel 프로젝트 설정(배포)에 넣음. 값은 .env.example 참고.
 * 비밀 키(SUPABASE_SECRET_KEY)는 서버에서만 읽고 브라우저로 절대 보내지 않음.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !publishableKey || !secretKey) return null;
  return { url, publishableKey, secretKey };
}

/** 관리자 페이지에 들어올 수 있는 이메일 (쉼표로 여러 개) */
export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
