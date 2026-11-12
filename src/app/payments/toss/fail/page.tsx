import type { Metadata } from "next";
import SiteFooter from "@/components/layout/SiteFooter";
import StoreHeader from "@/components/layout/StoreHeader";
import TossPaymentFail from "@/components/payment/TossPaymentFail";

export const metadata: Metadata = {
  title: "결제 실패 | 새순꽃집",
  robots: { index: false, follow: false },
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** 토스페이먼츠 결제창에서 실패·취소로 돌아오는 화면 (?code=&message=) */
export default async function TossFailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto w-full max-w-lg flex-1 bg-white shadow-[0_0_24px_rgba(0,0,0,0.04)]">
      <StoreHeader />
      <main>
        <TossPaymentFail code={first(params.code).slice(0, 60)} message={first(params.message).slice(0, 200)} />
      </main>
      <SiteFooter />
    </div>
  );
}
