/**
 * Supabase 공개 설정(주소·공개 키) — 서버(server/env.ts)와 proxy가 같이 씀. 둘 중 하나라도 없으면 null
 */
export function getSupabasePublicConfig() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && publishableKey ? { url, publishableKey } : null;
}

/**
 * Supabase 주소를 "https://xxxx.supabase.co" 형태로 맞춤.
 * 대시보드에서 "https://xxxx.supabase.co/rest/v1/"처럼 뒤에 경로까지 넣거나 https:// 없이 넣어도 동작하도록.
 * 주소로 읽을 수 없으면 null
 */
export function normalizeSupabaseUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`).origin;
  } catch {
    return null;
  }
}
