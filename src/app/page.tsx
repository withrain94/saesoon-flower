import Hero from "@/components/layout/Hero";
import StoreHeader from "@/components/layout/StoreHeader";
import ReservationPage from "@/components/reservation/ReservationPage";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-lg flex-1 bg-white shadow-[0_0_24px_rgba(0,0,0,0.04)]">
      <StoreHeader />
      <main>
        <Hero />
        <div className="relative -mt-6 rounded-t-[28px] bg-white pt-3">
          <ReservationPage />
        </div>
      </main>
    </div>
  );
}
