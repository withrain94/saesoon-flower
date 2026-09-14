import type { Metadata } from "next";
import SiteFooter from "@/components/layout/SiteFooter";
import StoreHeader from "@/components/layout/StoreHeader";
import ReservationLookup from "@/components/lookup/ReservationLookup";
import { normalizeReceiptNumber } from "@/lib/customerLookup";

export const metadata: Metadata = {
  title: "예약 조회 | 새순꽃집",
  robots: { index: false, follow: false },
};

/** 손님 예약 조회·취소 — /check?no=접수번호 로 열면 접수번호가 미리 채워짐 (연락처는 주소에 넣지 않음) */
export default async function CheckPage({ searchParams }: PageProps<"/check">) {
  const { no } = await searchParams;
  const initialReceipt = typeof no === "string" ? (normalizeReceiptNumber(no) ?? "") : "";

  return (
    <div className="mx-auto w-full max-w-lg flex-1 bg-white shadow-[0_0_24px_rgba(0,0,0,0.04)]">
      <StoreHeader />
      <main>
        <ReservationLookup initialReceipt={initialReceipt} />
      </main>
      <SiteFooter />
    </div>
  );
}
