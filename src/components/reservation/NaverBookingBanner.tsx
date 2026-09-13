import { ChevronIcon } from "@/components/ui/icons";
import { productCategories } from "@/data/products";
import { NAVER_BOOKING_GUIDE } from "@/data/reservationOptions";
import { naverBookingUrls } from "@/data/shop";
import { NAVER_LINKS_ID } from "./sections";

/** 첫 화면 — 네이버 예약으로 갈 사람은 신청서를 쓰기 전에 바로 이동 */
export default function NaverBookingBanner() {
  return (
    <section
      id={NAVER_LINKS_ID}
      aria-label="네이버 예약"
      className="mx-5 mb-2 mt-1 scroll-mt-40 rounded-2xl bg-panel px-4 py-3.5"
    >
      <p className="text-[15px] font-bold text-ink">{NAVER_BOOKING_GUIDE.title}</p>
      <p className="mt-0.5 text-[13px] text-sub">{NAVER_BOOKING_GUIDE.description}</p>
      <ul className="mt-2.5 grid auto-cols-fr grid-flow-col gap-2">
        {productCategories.map((category) => (
          <li key={category.id}>
            <a
              href={naverBookingUrls[category.id]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${category.name} 네이버 예약`}
              className="flex items-center justify-center gap-0.5 rounded-full border border-field bg-white py-2 text-[13px] font-semibold text-ink transition hover:border-brand hover:text-brand-dark"
            >
              {category.name}
              <ChevronIcon direction="right" className="h-3.5 w-3.5 text-sub" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
