import type { ReactNode } from "react";

export default function SectionHeading({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <h2 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xl font-bold text-ink">
      <span className="shrink-0 text-ink">{icon}</span>
      {children}
    </h2>
  );
}
