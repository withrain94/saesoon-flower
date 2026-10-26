import Hero from "@/components/layout/Hero";
import SiteFooter from "@/components/layout/SiteFooter";
import StoreHeader from "@/components/layout/StoreHeader";
import StoreInfoSections from "@/components/layout/StoreInfoSections";
import StoreQuickInfo from "@/components/layout/StoreQuickInfo";
import { STORE_INFO_ID } from "@/components/layout/storeSections";
import ReservationPage from "@/components/reservation/ReservationPage";
import { SECTION } from "@/components/reservation/sections";
import { PhotoOverridesProvider } from "@/hooks/usePhotos";
import type { Metadata } from "next";
import { bookingSiteUrl, searchInfo, shop, storeContact } from "@/data/shop";
import { getPhotoOverrides } from "@/server/sitePhotos";

/** 관리자가 바꾼 사진이 늦어도 1분 안에 보이게 (바꾸면 서버 함수가 바로 다시 만들기도 함) */
export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** 구글 검색용 가게 정보 (꽃집 종류·주소·전화·24시·배달 지역) — 화면에는 안 보임 */
const storeStructuredData = {
  "@context": "https://schema.org",
  "@type": "Florist",
  name: "새순꽃집 전주혁신도시점",
  alternateName: ["새순 전주혁신도시점", "새순"],
  description: searchInfo.description,
  url: bookingSiteUrl,
  image: `${bookingSiteUrl}${shop.heroImage}`,
  telephone: storeContact.phone,
  hasMap: storeContact.naverMapUrl,
  sameAs: [storeContact.instagramUrl, storeContact.blogUrl],
  priceRange: "₩₩",
  address: {
    "@type": "PostalAddress",
    addressCountry: "KR",
    addressRegion: searchInfo.postalAddress.region,
    addressLocality: searchInfo.postalAddress.locality,
    streetAddress: searchInfo.postalAddress.street,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  areaServed: searchInfo.areaServed.map((name) => ({ "@type": "Place", name })),
  keywords: searchInfo.keywords.join(", "),
};

/** 맨 위·맨 아래 [꽃 예약하기] 버튼이 가는 곳 — 상품 고르기 */
const bookHref = `#${SECTION.items}`;

export default async function Home() {
  const photoOverrides = await getPhotoOverrides();

  return (
    <PhotoOverridesProvider overrides={photoOverrides}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeStructuredData).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto w-full max-w-lg flex-1 bg-white shadow-[0_0_24px_rgba(0,0,0,0.04)]">
        <StoreHeader />
        <main>
          <Hero bookHref={bookHref} storeHref={`#${STORE_INFO_ID}`} />
          <div className="relative -mt-6 rounded-t-[28px] bg-white pt-3">
            <StoreQuickInfo />
            <ReservationPage />
          </div>
          <StoreInfoSections bookHref={bookHref} />
        </main>
        <SiteFooter />
      </div>
    </PhotoOverridesProvider>
  );
}
