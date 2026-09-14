import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { ADMIN_HOME_PATH, getAdminEmail } from "@/server/auth";
import { getSupabaseEnv } from "@/server/env";

export default async function AdminLoginPage() {
  if (await getAdminEmail()) redirect(ADMIN_HOME_PATH);
  const configured = getSupabaseEnv() !== null;

  return (
    <main className="mx-auto w-full max-w-sm px-5 py-16">
      <p className="text-[14px] font-bold text-brand-dark">새순꽃집</p>
      <h1 className="mt-1 text-2xl font-extrabold text-ink">예약 관리 로그인</h1>
      <p className="mt-1 text-[14px] text-sub">매장 관리자만 들어올 수 있어요.</p>

      {!configured && (
        <p className="mt-5 rounded-xl bg-panel px-4 py-3 text-[13px] leading-relaxed text-strong">
          아직 Supabase 설정(환경변수)이 없어서 로그인할 수 없어요. 설정을 넣고 서버를 다시 켜면 로그인할 수 있어요.
        </p>
      )}

      <LoginForm disabled={!configured} />
    </main>
  );
}
