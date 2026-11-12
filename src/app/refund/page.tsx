import type { Metadata } from "next";
import Link from "next/link";
import { REFUND_EFFECTIVE_DATE, refundPolicySections } from "@/data/refund";
import { businessInfo } from "@/data/shop";

export const metadata: Metadata = {
  title: "취소·환불 정책 | 새순꽃집",
};

/** 취소·환불 정책 — 내용은 data/refund.ts (한국어) */
export default function RefundPage() {
  return (
    <div className="mx-auto w-full max-w-lg flex-1 bg-white px-5 pb-16 pt-6 shadow-[0_0_24px_rgba(0,0,0,0.04)]">
      <Link href="/" className="text-[14px] font-semibold text-brand-dark hover:underline">
        ‹ 예약 페이지로 돌아가기
      </Link>

      <h1 className="mt-4 text-[24px] font-extrabold text-ink">취소·환불 정책</h1>
      <p className="mt-1 text-[13px] text-sub">
        {businessInfo.tradeName}(이하 &lsquo;매장&rsquo;)의 예약 취소와 환불 기준을 안내합니다.
      </p>
      <p lang="en" className="mt-1 text-[12px] text-faint">
        This cancellation &amp; refund policy is provided in Korean.
      </p>

      <div className="mt-6 space-y-6">
        {refundPolicySections.map((section) => (
          <section key={section.title}>
            <h2 className="text-[16px] font-bold text-ink">{section.title}</h2>
            <div className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-body">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 border-t border-line pt-4 text-[13px] text-sub">시행일: {REFUND_EFFECTIVE_DATE}</p>
    </div>
  );
}
