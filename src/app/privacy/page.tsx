import type { Metadata } from "next";
import Link from "next/link";
import { PRIVACY_EFFECTIVE_DATE, privacyPolicySections } from "@/data/privacy";
import { businessInfo } from "@/data/shop";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | 새순꽃집",
};

/** 개인정보 처리방침 — 내용은 data/privacy.ts (한국어) */
export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-lg flex-1 bg-white px-5 pb-16 pt-6 shadow-[0_0_24px_rgba(0,0,0,0.04)]">
      <Link href="/" className="text-[14px] font-semibold text-brand-dark hover:underline">
        ‹ 예약 페이지로 돌아가기
      </Link>

      <h1 className="mt-4 text-[24px] font-extrabold text-ink">개인정보 처리방침</h1>
      <p className="mt-1 text-[13px] text-sub">
        {businessInfo.tradeName}(이하 &lsquo;매장&rsquo;)은 꽃 예약을 위해 필요한 최소한의 개인정보만 수집·이용합니다.
      </p>
      <p lang="en" className="mt-1 text-[12px] text-faint">
        This privacy policy is provided in Korean.
      </p>

      <div className="mt-6 space-y-6">
        {privacyPolicySections.map((section) => (
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

      <p className="mt-8 border-t border-line pt-4 text-[13px] text-sub">시행일: {PRIVACY_EFFECTIVE_DATE}</p>
    </div>
  );
}
