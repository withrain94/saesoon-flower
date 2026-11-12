import type { Metadata } from "next";
import SiteFooter from "@/components/layout/SiteFooter";
import StoreHeader from "@/components/layout/StoreHeader";
import TossPaymentSuccess from "@/components/payment/TossPaymentSuccess";

export const metadata: Metadata = {
  title: "결제 확인 | 새순꽃집",
  robots: { index: false, follow: false },
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** 토스페이먼츠 결제창에서 결제 뒤 돌아오는 화면 (?paymentKey=&orderId=&amount=) */
export default async function TossSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto w-full max-w-lg flex-1 bg-white shadow-[0_0_24px_rgba(0,0,0,0.04)]">
      <StoreHeader />
      <main>
        <TossPaymentSuccess
          paymentKey={first(params.paymentKey)}
          orderId={first(params.orderId)}
          amount={first(params.amount)}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
