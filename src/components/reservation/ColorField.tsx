"use client";

import { useState } from "react";
import Field, { inputClassName } from "@/components/ui/Field";
import { ChevronIcon } from "@/components/ui/icons";
import { COLOR_OTHER, colorOptions } from "@/data/reservationOptions";

/** input name: "color", "colorOther" */
export default function ColorField() {
  const [color, setColor] = useState(colorOptions[0]);

  return (
    <Field label="원하는 색감" htmlFor="color">
      <div className="relative">
        <select
          id="color"
          name="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className={`${inputClassName} appearance-none pr-10`}
        >
          {colorOptions.map((option) => (
            <option key={option} value={option}>
              {option}
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
          aria-label="원하는 색감 직접 입력"
          placeholder="원하는 색감을 적어주세요"
          className={`${inputClassName} mt-2`}
        />
      )}
    </Field>
  );
}
