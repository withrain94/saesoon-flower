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
