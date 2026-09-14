"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronIcon } from "@/components/ui/icons";
import { setLocale, useLocale, useT } from "@/hooks/useLocale";
import { localeOptions } from "@/i18n";

/** 🌐 언어 탭 — 고른 언어는 브라우저에 기억 */
export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = localeOptions.find((option) => option.code === locale) ?? localeOptions[0];

  // 화면 언어를 html lang에도 반영 (읽어주기·번역 기능이 올바른 언어로 인식)
  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
  }, [t.htmlLang]);

  // 바깥을 누르면 닫기
  useEffect(() => {
    if (!open) return;
    function close(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t.header.language}: ${current.label}`}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 rounded-full border border-field px-2.5 py-1.5 text-[13px] font-semibold text-body transition hover:border-brand hover:text-brand-dark"
      >
        <span aria-hidden="true">🌐</span>
        {current.short}
        <ChevronIcon direction="down" className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t.header.language}
          className="absolute right-0 top-full z-40 mt-1.5 w-40 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          {localeOptions.map((option) => {
            const selected = option.code === locale;
            return (
              <li key={option.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  lang={option.code}
                  onClick={() => {
                    setLocale(option.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[14px] transition hover:bg-soft ${
                    selected ? "font-bold text-brand-dark" : "text-body"
                  }`}
                >
                  {option.label}
                  {selected && <span aria-hidden="true">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
