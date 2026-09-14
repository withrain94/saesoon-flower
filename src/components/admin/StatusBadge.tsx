import { getStatusOption } from "@/data/reservationStatus";
import type { ReservationStatus } from "@/types/reservation";

const toneClassName = {
  new: "bg-brand text-white",
  progress: "bg-panel text-brand-dark ring-1 ring-panel-line",
  done: "bg-soft text-sub ring-1 ring-line",
  canceled: "bg-white text-danger ring-1 ring-danger/40",
} as const;

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  const option = getStatusOption(status);
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold ${toneClassName[option.tone]}`}
    >
      {option.label}
    </span>
  );
}
