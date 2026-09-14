"use client";

import { useState } from "react";
import Field, { inputClassName } from "@/components/ui/Field";
import { ChevronIcon } from "@/components/ui/icons";
import { COLOR_OTHER, colorOptionIds, type ColorOptionId } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";

/** input name: "color"(선택지 id), "colorOther" */
export default function ColorField() {
  const t = useT();
  const [color, setColor] = useState<ColorOptionId>(colorOptionIds[0]);

  return (
    <Field label={t.color.label} htmlFor="color">
      <div className="relative">
        <select
          id="color"
          name="color"
          value={color}
          onChange={(event) => setColor(event.target.value as ColorOptionId)}
          className={`${inputClassName} appearance-none pr-10`}
        >
          {colorOptionIds.map((id) => (
            <option key={id} value={id}>
              {t.color.options[id]}
            </option>
          ))}
        </select>
        <ChevronIcon
          direction="down"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sub"
        />
      </div>

      {color === COLOR_OTHER && (
        <input
          name="colorOther"
          type="text"
          aria-label={t.color.otherAria}
          placeholder={t.color.otherPlaceholder}
          className={`${inputClassName} mt-2`}
        />
      )}
    </Field>
  );
}
