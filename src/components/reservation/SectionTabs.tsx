"use client";

import { useActiveSection } from "@/hooks/useActiveSection";
import { useT } from "@/hooks/useLocale";
import { sectionIds, sectionTabs } from "./sections";

export default function SectionTabs() {
  const [active, setActive] = useActiveSection(sectionIds);
  const t = useT();

  return (
    <nav className="sticky top-14 z-20 bg-white px-5 py-3">
      <ul className="flex rounded-xl bg-soft p-1">
        {sectionTabs.map((tab) => (
          <li key={tab.id} className="flex-1">
            <a
              href={`#${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`block rounded-[10px] py-2.5 text-center text-[15px] font-semibold transition ${
                active === tab.id ? "bg-strong text-white shadow-sm" : "text-body"
              }`}
            >
              {t.sectionTabs[tab.key]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
