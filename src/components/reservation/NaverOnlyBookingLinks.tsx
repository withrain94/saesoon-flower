import { ChevronIcon } from "@/components/ui/icons";
import { naverOnlyBookings } from "@/data/shop";
import { useT } from "@/hooks/useLocale";

/** 첫 화면 — 네이버 예약으로만 받는 상품(화분 등) 바로가기 */
export default function NaverOnlyBookingLinks() {
  const t = useT();

  return (
    <ul className="mx-5 mb-2 space-y-2">
      {naverOnlyBookings.map((booking) => {
        const copy = t.naverOnly[booking.id];
        return (
          <li key={booking.id}>
            <a
              href={booking.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-sm transition hover:border-brand active:scale-[0.99]"
            >
              <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft text-[20px]">
                {booking.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-ink">{copy.title}</span>
                <span className="block text-[12px] text-sub">{copy.description}</span>
              </span>
              <ChevronIcon direction="right" className="h-4 w-4 shrink-0 text-brand-dark" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
