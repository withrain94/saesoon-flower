import Link from "next/link";
import { signOut } from "@/server/actions/admin";

/** 관리자 화면 맨 위 — 목록으로 가기 + 로그인한 이메일 + 로그아웃 */
export default function AdminHeader({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/admin" className="text-[16px] font-extrabold text-ink">
          새순 <span className="text-brand-dark">예약 관리</span>
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden truncate text-[12px] text-sub sm:inline">{email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-field bg-white px-3 py-1.5 text-[13px] font-semibold text-body transition hover:border-brand"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
