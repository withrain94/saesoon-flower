import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import StoreImportForm from "@/components/admin/StoreImportForm";
import { requireAdmin } from "@/server/auth";

/** 매장 예약 넣기 — 전화·문자·카톡으로 받은 예약을 붙여넣어 사이트 예약으로 저장 (매장 전용) */
export default async function StoreImportPage() {
  const email = await requireAdmin();

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-[18px] font-extrabold text-ink">📞 매장 예약 넣기</h1>
          <Link href="/admin" className="text-[13px] font-semibold text-brand-dark">
            ‹ 예약 목록
          </Link>
        </div>
        <p className="mt-1 text-[12.5px] text-sub">
          전화·문자·카톡으로 받은 주문 글을 붙여넣으면 칸이 자동으로 채워져요. 저장하면 노션 표에도 올라가고, 입금 확인을
          체크하면 예약자에게 입금 확인 문자가 10분 안에 자동으로 가요.
        </p>
        <StoreImportForm />
      </main>
    </>
  );
}
