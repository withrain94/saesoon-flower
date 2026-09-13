import { ChevronIcon } from "@/components/ui/icons";

/** 상품 종류별 "꼭 확인해 주세요!" 안내 (기본 펼침) */
export default function CategoryNotice({ lines }: { lines: string[] }) {
  return (
    <details open className="group mt-4 rounded-xl bg-panel px-4 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
        꼭 확인해 주세요!
        <ChevronIcon direction="down" className="h-4 w-4 text-sub transition group-open:rotate-180" />
      </summary>
      <div className="mt-2 space-y-1.5 text-[13.5px] leading-relaxed text-body">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </details>
  );
}
