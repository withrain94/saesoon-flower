import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/** 설정이 비어 있을 때 쓰는 오류 — 화면에서 안내 문구로 바꿔 보여줌 */
export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase 환경변수가 설정되지 않았습니다.");
  }
}

function requireEnv() {
  const env = getSupabaseEnv();
  if (!env) throw new SupabaseNotConfiguredError();
  return env;
}

/**
 * DB 전용 클라이언트 (비밀 키 — RLS를 우회하므로 서버에서만, 권한 확인 뒤에만 사용).
 * 예약 저장, 관리자 목록·상세·수정에 사용.
 */
export function createDatabaseClient() {
  const { url, secretKey } = requireEnv();
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** 로그인 세션 클라이언트 (공개 키 + 쿠키) — 관리자 로그인·로그아웃·본인 확인에만 사용 */
export async function createAuthClient() {
  const { url, publishableKey } = requireEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // 서버 컴포넌트 렌더링 중에는 쿠키를 쓸 수 없음 — 세션 갱신은 proxy.ts가 처리
        }
      },
    },
  });
}
