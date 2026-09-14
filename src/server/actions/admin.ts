"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { isReservationStatus } from "@/data/reservationStatus";
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH, isReservationId, requireAdmin } from "../auth";
import { getAdminEmails, getSupabaseEnv } from "../env";
import { updateReservation } from "../reservations";
import { createAuthClient } from "../supabase";

/** 관리자 화면 폼 결과 — 실패하면 화면에 보여줄 문구 */
export type AdminFormState = { error: string | null; savedAt?: number };

const ADMIN_MEMO_MAX = 2000;

/** 로그인 — 비밀번호가 맞아도 ADMIN_EMAILS에 없는 이메일이면 바로 로그아웃 */
export async function signIn(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  if (!getSupabaseEnv()) {
    return { error: "Supabase 설정이 아직 없어요. 환경변수를 넣은 뒤 다시 시도해 주세요." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "이메일과 비밀번호를 입력해 주세요." };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "이메일 또는 비밀번호가 맞지 않아요." };

  if (!getAdminEmails().includes(email)) {
    await supabase.auth.signOut();
    return { error: "관리자로 등록된 이메일이 아니에요." };
  }

  redirect(ADMIN_HOME_PATH);
}

export async function signOut() {
  if (getSupabaseEnv()) {
    const supabase = await createAuthClient();
    await supabase.auth.signOut();
  }
  redirect(ADMIN_LOGIN_PATH);
}

/** 진행 상태 바꾸기 */
export async function changeReservationStatus(id: string, status: string): Promise<AdminFormState> {
  await requireAdmin();
  if (!isReservationId(id) || !isReservationStatus(status)) return { error: "잘못된 요청이에요." };

  try {
    await updateReservation(id, { status });
  } catch {
    return { error: "상태를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  refresh();
  return { error: null, savedAt: Date.now() };
}

/** 관리자 메모 저장 */
export async function saveAdminMemo(
  id: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  if (!isReservationId(id)) return { error: "잘못된 요청이에요." };

  const memo = String(formData.get("adminMemo") ?? "").slice(0, ADMIN_MEMO_MAX);
  try {
    await updateReservation(id, { adminMemo: memo });
  } catch {
    return { error: "메모를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  refresh();
  return { error: null, savedAt: Date.now() };
}
