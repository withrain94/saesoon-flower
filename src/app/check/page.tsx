import type { Metadata } from "next";
import SiteFooter from "@/components/layout/SiteFooter";
import StoreHeader from "@/components/layout/StoreHeader";
import ReservationLookup from "@/components/lookup/ReservationLookup";

export const metadata: Metadata = {
  title: "예약 조회 | 새순꽃집",
  robots: { index: false, follow: false },
};

/** 손님 예약 조회·취소 — 예약자 이름 + 연락처로 찾음 (이름·연락처는 주소에 넣지 않음) */
export default function CheckPage() {
  return (
    <div className="mx-auto w-full max-w-lg flex-1 bg-white shadow-[0_0_24px_rgba(0,0,0,0.04)]">
      <StoreHeader showLookupLink={false} />
      <main>
        <ReservationLookup />
      </main>
      <SiteFooter />
    </div>
  );
}
