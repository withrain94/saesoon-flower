type IconProps = { className?: string };

export function GridIcon({ className }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className={className}>
      <rect x="1" y="1" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="10" y="1" width="7" height="7" rx="3.5" fill="currentColor" />
      <rect x="1" y="10" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="10" y="10" width="7" height="7" rx="2" fill="currentColor" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <rect x="2" y="3.5" width="16" height="14" rx="2" fill="currentColor" />
      <rect x="4" y="8" width="12" height="7.5" rx="1" fill="#fff" />
      <rect x="5.5" y="1.5" width="2" height="4" rx="1" fill="currentColor" />
      <rect x="12.5" y="1.5" width="2" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

export function CheckSquareIcon({ className }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <rect x="2.5" y="2.5" width="15" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M6.5 10.5l2.5 2.5 4.5-5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronIcon({
  direction,
  className,
}: IconProps & { direction: "left" | "right" | "down" }) {
  const paths = {
    left: "M12.5 4l-6 6 6 6",
    right: "M7.5 4l6 6-6 6",
    down: "M5 7.5l5 5 5-5",
  };
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <path d={paths[direction]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
