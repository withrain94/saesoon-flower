import type { ReactNode } from "react";

export default function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[14px] font-semibold text-body">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[12px] font-bold transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 ${
          checked ? "border-brand bg-brand text-white" : "border-field bg-white text-transparent"
        }`}
      >
        ✓
      </span>
      {children}
    </label>
  );
}
