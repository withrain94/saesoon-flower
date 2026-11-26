import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import NaverImportForm from "@/components/admin/NaverImportForm";
import { requireAdmin } from "@/server/auth";

/** 네이버 예약 넣기 — 네이버 예약 상세 글을 붙여넣어 사이트 예약으로 저장 (매장 전용) */
export default async function NaverImportPage() {
  const email = await requireAdmin();

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-[18px] font-extrabold text-ink">📗 네이버 예약 넣기</h1>
          <Link href="/admin" className="text-[13px] font-semibold text-brand-dark">
            ‹ 예약 목록
          </Link>
        </div>
        <p className="mt-1 text-[12.5px] text-sub">
          네이버 예약 상세 화면 글을 붙여넣으면 칸이 자동으로 채워져요. 저장하면 &quot;입금·결제 확인&quot;으로 들어가고 노션
          표·내일 예약 목록에도 나와요. 자동 문자는 보내지 않아요.
        </p>
        <NaverImportForm />
      </main>
    </>
  );
}
