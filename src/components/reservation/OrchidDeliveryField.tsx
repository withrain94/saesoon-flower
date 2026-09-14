"use client";

import { useState } from "react";
import { inputClassName } from "@/components/ui/Field";
import { ChevronIcon } from "@/components/ui/icons";
import { orchidDeliveryMethods, orchidRestaurants, RESTAURANT_OTHER } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import type { OrchidDeliveryMethod } from "@/types/reservation";

/**
 * 호접난 받는 방법 — 매장 픽업 / 상견례 식당으로 배송(식당 + 식당 예약 이름).
 * input name: orchidDelivery / (배송) orchidRestaurant, orchidRestaurantOther, orchidReservationName
 */
export default function OrchidDeliveryField() {
  const t = useT();
  const copy = t.orchidDelivery;
  const [method, setMethod] = useState<OrchidDeliveryMethod>(orchidDeliveryMethods[0]);
  const [restaurant, setRestaurant] = useState<string>(orchidRestaurants[0]);

  return (
    <fieldset>
      <legend className="text-[15px] font-bold text-ink">
        {copy.title} <span className="text-brand">*</span>
      </legend>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {orchidDeliveryMethods.map((value) => {
          const active = value === method;
          return (
            <label
              key={value}
              className={`cursor-pointer rounded-xl border px-2 py-2.5 text-center transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
                active ? "border-brand bg-brand text-white" : "border-field bg-white text-ink hover:border-brand"
              }`}
            >
              <input
                type="radio"
                name="orchidDelivery"
                value={value}
                checked={active}
                onChange={() => setMethod(value)}
                className="sr-only"
              />
              <span className="block text-[14px] font-bold leading-snug">{copy.methods[value].label}</span>
              <span className={`mt-0.5 block text-[11.5px] ${active ? "text-white/85" : "text-sub"}`}>
                {copy.methods[value].description}
              </span>
            </label>
          );
        })}
      </div>

      {method === "restaurant" && (
        <div className="mt-3 space-y-2 rounded-2xl bg-panel p-3">
          <label className="block">
            <span className="mb-1 block px-1 text-[13px] font-semibold text-body">{copy.restaurant}</span>
            <span className="relative block">
              <select
                name="orchidRestaurant"
                value={restaurant}
                onChange={(event) => setRestaurant(event.target.value)}
                className={`${inputClassName} appearance-none pr-10`}
              >
                {orchidRestaurants.map((name) => (
                  <option key={name} value={name}>
                    {t.restaurants[name]}
                  </option>
                ))}
                <option value={RESTAURANT_OTHER}>{copy.restaurantOther}</option>
              </select>
              <ChevronIcon
                direction="down"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sub"
              />
            </span>
          </label>
          {restaurant === RESTAURANT_OTHER && (
            <input
              name="orchidRestaurantOther"
              type="text"
              required
              maxLength={50}
              aria-label={copy.restaurantOther}
              placeholder={copy.restaurantOtherPlaceholder}
              className={inputClassName}
            />
          )}
          <label className="block">
            <span className="mb-1 block px-1 text-[13px] font-semibold text-body">{copy.reservationName}</span>
            <input
              name="orchidReservationName"
              type="text"
              required
              maxLength={50}
              placeholder={copy.reservationNamePlaceholder}
              className={inputClassName}
            />
          </label>
          <p className="px-1 text-[12.5px] text-sub">{copy.timeNote}</p>
        </div>
      )}
    </fieldset>
  );
}
