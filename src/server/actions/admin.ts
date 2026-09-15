"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { isReservationStatus } from "@/data/reservationStatus";
import { NOTION_SYNC_STATUSES } from "@/lib/notionReservation";
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH, isReservationId, requireAdmin } from "../auth";
import { sendDocumentEmail } from "../documentEmail";
import { getAdminEmails, getSupabaseEnv } from "../env";
import { syncReservationToNotion, type NotionSyncResult } from "../notion";
import { getReservation, updateReservation } from "../reservations";
import { createAuthClient } from "../supabase";

/** 관리자 화면 폼 결과 — 실패하면 화면에 보여줄 문구, notice: 노션 올리기 결과 안내 */
export type AdminFormState = { error: string | null; savedAt?: number; notice?: string };

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
  const notice = await syncNotion(id, "status");
  refresh();
  return { error: null, savedAt: Date.now(), notice };
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
  const notice = await syncNotion(id, "memo");
  refresh();
  return { error: null, savedAt: Date.now(), notice };
}

/** 노션에 다시 올리기 (실패했을 때 상세 화면 버튼) */
export async function resyncReservationNotion(id: string): Promise<AdminFormState> {
  await requireAdmin();
  if (!isReservationId(id)) return { error: "잘못된 요청이에요." };
  const notice = await syncNotion(id, "manual");
  return { error: null, savedAt: Date.now(), notice };
}

/** 견적서·거래명세표 이메일 다시 보내기 (상세 화면 버튼) */
export async function resendDocumentEmail(id: string): Promise<AdminFormState> {
  await requireAdmin();
  if (!isReservationId(id)) return { error: "잘못된 요청이에요." };
  const reservation = await getReservation(id).catch(() => null);
  if (!reservation) return { error: "예약을 불러오지 못했어요." };
  const result = await sendDocumentEmail(id, reservation.request);
  switch (result) {
    case "sent":
      return { error: null, savedAt: Date.now(), notice: `${reservation.request.documentEmail}로 보냈어요.` };
    case "noDocuments":
      return { error: "이 예약에는 서류 요청이 없어요." };
    case "notConfigured":
      return { error: "Gmail 설정(GMAIL_USER·GMAIL_APP_PASSWORD)이 아직 없어서 보내지 못했어요." };
    case "failed":
      return { error: "보내지 못했어요. 이메일 주소와 Gmail 앱 비밀번호를 확인한 뒤 다시 눌러주세요." };
  }
}

/**
 * 저장된 예약을 노션 표에 맞추고 화면에 보여줄 한 줄 안내를 돌려줌 (알릴 게 없으면 undefined).
 * trigger: 무엇 때문에 불렀는지 — 메모 저장은 이미 올라간 줄이 고쳐졌을 때만 알림
 */
async function syncNotion(id: string, trigger: "status" | "memo" | "manual") {
  const reservation = await getReservation(id).catch(() => null);
  if (!reservation) return trigger === "manual" ? "예약을 불러오지 못했어요." : undefined;
  const result = await syncReservationToNotion(reservation);
  // 설정이 없다는 안내는 노션에 올라갈 상태로 바꿨을 때(또는 직접 누를 때)만
  if (result.kind === "not-configured" && trigger !== "manual" && !NOTION_SYNC_STATUSES.includes(reservation.status)) {
    return undefined;
  }
  return describeNotionResult(result, trigger);
}

function describeNotionResult(result: NotionSyncResult, trigger: "status" | "memo" | "manual") {
  switch (result.kind) {
    case "added":
      return `노션 ‘${result.title}’ 페이지에 올렸어요.`;
    case "updated":
      return trigger === "memo" ? "노션 표의 매장 메모도 고쳤어요." : `노션 ‘${result.title}’ 표도 고쳤어요.`;
    case "skipped":
      return trigger === "manual" ? "입금·결제 확인 이후 상태가 되면 노션에 올라가요." : undefined;
    case "not-configured":
      return trigger === "memo" ? undefined : "노션 연결 설정이 아직 없어서 노션에는 올리지 않았어요.";
    case "failed":
      return "저장은 됐지만 노션에 올리지 못했어요. 아래 ‘노션에 다시 올리기’를 눌러 주세요.";
  }
}
