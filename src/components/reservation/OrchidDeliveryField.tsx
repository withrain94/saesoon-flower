"use client";

import { useState } from "react";
import { inputClassName } from "@/components/ui/Field";
import { ChevronIcon } from "@/components/ui/icons";
import { orchidRestaurants, RESTAURANT_OTHER } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";

/**
 * 호접난 배송 식당 — 받는 방법이 "배송"일 때만 (ReceiveMethodField 안에서).
 * 식당 목록에서 고르거나 "기타"로 식당 이름·배송지 주소를 직접 입력. 식당 예약 이름은 목록 식당이면 필수.
 * input name: orchidRestaurant, orchidRestaurantOther, orchidReservationName
 */
export default function OrchidDeliveryField() {
  const t = useT();
  const copy = t.orchidDelivery;
  const [restaurant, setRestaurant] = useState<string>(orchidRestaurants[0]);
  const isOther = restaurant === RESTAURANT_OTHER;

  return (
    <div className="space-y-2 rounded-2xl bg-panel p-3">
      <div className="px-1">
        <p className="text-[14px] font-bold text-ink">
          {copy.restaurantTitle} <span className="text-brand">*</span>
        </p>
        <p className="text-[12px] text-sub">{copy.restaurantFree}</p>
      </div>
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
      {isOther && (
        <input
          name="orchidRestaurantOther"
          type="text"
          required
          maxLength={200}
          aria-label={copy.restaurantOther}
          placeholder={copy.restaurantOtherPlaceholder}
          className={inputClassName}
        />
      )}
      <label className="block">
        <span className="mb-1 block px-1 text-[13px] font-semibold text-body">
          {isOther ? copy.reservationNameOptional : copy.reservationName}
        </span>
        <input
          name="orchidReservationName"
          type="text"
          required={!isOther}
          maxLength={50}
          placeholder={copy.reservationNamePlaceholder}
          className={inputClassName}
        />
      </label>
      <p className="px-1 text-[12.5px] text-sub">{copy.timeNote}</p>
    </div>
  );
}
