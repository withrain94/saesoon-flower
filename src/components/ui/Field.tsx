import type { ReactNode } from "react";
import { useT } from "@/hooks/useLocale";

export const inputClassName =
  "h-12 w-full rounded-lg border border-field bg-white px-4 text-[15px] text-ink placeholder:text-faint transition focus:border-brand focus:outline-none";

export default function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  const t = useT();

  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-baseline gap-1 text-[15px] font-bold text-ink">
        {label}
        {required ? (
          <span className="text-brand">*</span>
        ) : (
          <span className="text-[13px] font-normal text-sub">{t.common.optional}</span>
        )}
      </label>
      {hint && <p className="mt-0.5 text-[13px] text-sub">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}
