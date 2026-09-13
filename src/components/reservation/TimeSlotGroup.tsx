import { formatSlotShort, formatTimeLabel } from "@/lib/time";

export default function TimeSlotGroup({
  title,
  slots,
  selected,
  isDisabled,
  onSelect,
}: {
  title: string;
  slots: string[];
  selected: string | null;
  isDisabled: (slot: string) => boolean;
  onSelect: (slot: string) => void;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2.5 text-sm text-body">{title}</p>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = slot === selected;
          return (
            <button
              key={slot}
              type="button"
              disabled={isDisabled(slot)}
              aria-pressed={isSelected}
              aria-label={formatTimeLabel(slot)}
              onClick={() => onSelect(slot)}
              className={`h-11 rounded-lg border text-[15px] transition ${
                isSelected
                  ? "border-brand bg-brand font-bold text-white"
                  : "border-field bg-white text-ink hover:border-brand disabled:border-line disabled:bg-soft disabled:text-disabled disabled:hover:border-line"
              }`}
            >
              {formatSlotShort(slot)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
