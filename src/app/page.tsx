import Hero from "@/components/layout/Hero";
import SiteFooter from "@/components/layout/SiteFooter";
import StoreHeader from "@/components/layout/StoreHeader";
import ReservationPage from "@/components/reservation/ReservationPage";
import { PhotoOverridesProvider } from "@/hooks/usePhotos";
import { getPhotoOverrides } from "@/server/sitePhotos";

/** 관리자가 바꾼 사진이 늦어도 1분 안에 보이게 (바꾸면 서버 함수가 바로 다시 만들기도 함) */
export const revalidate = 60;

export default async function Home() {
  const photoOverrides = await getPhotoOverrides();

  return (
    <PhotoOverridesProvider overrides={photoOverrides}>
      <div className="mx-auto w-full max-w-lg flex-1 bg-white shadow-[0_0_24px_rgba(0,0,0,0.04)]">
        <StoreHeader />
        <main>
          <Hero />
          <div className="relative -mt-6 rounded-t-[28px] bg-white pt-3">
            <ReservationPage />
          </div>
        </main>
        <SiteFooter />
      </div>
    </PhotoOverridesProvider>
  );
}
