"use client";

import { useEffect } from "react";
import { useT } from "@/hooks/useLocale";
import { getChocolateName, type SelectionSummary } from "@/lib/selection";
import ChocolateField from "./ChocolateField";

/**
 * 초콜릿을 하나도 안 담고 [예약하기]를 눌렀을 때 한 번만 뜨는 창 (2026-10-12 사용자 요청).
 * 여기서 바로 담을 수 있고, 안 담아도 그대로 예약된다.
 */
export default function ChocolatePrompt({
  open,
  summary,
  quantities,
  onChange,
  onSubmit,
  onClose,
}: {
  open: boolean;
  summary: SelectionSummary;
  quantities: Record<string, number>;
  onChange: (chocolateId: string, quantity: number) => void;
  /** 이대로(또는 담은 채로) 예약 */
  onSubmit: () => void;
  /** 창만 닫고 신청서로 돌아가기 */
  onClose: () => void;
}) {
  const t = useT();
  // 쇼핑백은 초콜릿으로 세지 않음
  const chocolateItems = summary.chocolateItems.filter((item) => item.chocolate.kind !== "bag");
  const chocolatePrice = chocolateItems.reduce((sum, item) => sum + item.chocolate.price * item.quantity, 0);
  const added = chocolateItems.reduce((sum, item) => sum + item.quantity, 0);

  // 창이 떠 있는 동안 뒤 화면이 스크롤되지 않게 + Esc로 닫기
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t.chocolate.prompt.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chocolate-prompt-title"
        className="relative flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-2xl bg-white sm:mx-5 sm:rounded-2xl"
      >
        <div className="flex items-start gap-3 border-b border-line px-5 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <p id="chocolate-prompt-title" className="text-[17px] font-extrabold text-ink">
              <span aria-hidden="true">🍫 </span>
              {t.chocolate.prompt.title}
            </p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-sub">{t.chocolate.prompt.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.chocolate.prompt.close}
            className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[20px] text-sub transition hover:bg-soft"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <ChocolateField quantities={quantities} onChange={onChange} withHeading={false} />
        </div>

        <div className="border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          {added > 0 && (
            <p className="mb-2 flex items-baseline justify-between gap-3 text-[14px]">
              <span className="truncate font-semibold text-ink">
                {chocolateItems.map((item) => getChocolateName(item.chocolate, t)).join(" · ")}
              </span>
              <span className="shrink-0 font-bold text-brand-dark">{t.format.price(chocolatePrice)}</span>
            </p>
          )}
          <button
            type="button"
            onClick={onSubmit}
            className="h-[52px] w-full rounded-xl bg-brand text-[17px] font-bold text-white transition hover:bg-brand-dark active:scale-[0.99]"
          >
            {added > 0 ? t.chocolate.prompt.submitWith(added) : t.chocolate.prompt.submitWithout}
          </button>
        </div>
      </div>
    </div>
  );
}
