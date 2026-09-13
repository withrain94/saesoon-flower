"use client";

import { useState } from "react";
import SectionDivider from "@/components/ui/SectionDivider";
import type { SpecialEvent } from "@/data/events";
import { productCategories } from "@/data/products";
import { isSlotBookable } from "@/lib/time";
import type { ProductCategoryId } from "@/types/reservation";
import CategoryEntry from "./CategoryEntry";
import DateTimeSection from "./DateTimeSection";
import NaverBookingBanner from "./NaverBookingBanner";
import NaverOnlyBookingLinks from "./NaverOnlyBookingLinks";
import ProductSection from "./ProductSection";
import ReserveSection from "./ReserveSection";
import { scrollToSection, SECTION } from "./sections";
import SectionTabs from "./SectionTabs";
import SpecialEventBanner from "./SpecialEventBanner";
import SubmitBar from "./SubmitBar";
import { useReservation } from "./useReservation";

export default function ReservationPage() {
  const {
    now,
    selection,
    setQuantity,
    setSchedule,
    units,
    unitActions,
    visibleIssue,
    summary,
    reservation,
    submit,
  } = useReservation();
  const [categoryId, setCategoryId] = useState<ProductCategoryId>(productCategories[0].id);

  /** 첫 화면 입구 카드 → 해당 종류 목록으로 이동 */
  function openCategory(id: ProductCategoryId) {
    setCategoryId(id);
    scrollToSection(SECTION.items);
  }

  /** 특별한 날 배너 → 그 날짜를 미리 고르고 추천 상품 목록으로 이동 */
  function bookEvent(event: SpecialEvent) {
    const keepTime =
      selection.time !== null && now !== null && isSlotBookable(selection.time, event.date, now);
    setSchedule({ date: event.date, time: keepTime ? selection.time : null });
    openCategory(event.recommendedCategory);
  }

  return (
    <>
      <SpecialEventBanner now={now} onBook={bookEvent} />
      <CategoryEntry countByCategory={summary.countByCategory} onSelect={openCategory} />
      <NaverOnlyBookingLinks />
      <NaverBookingBanner />
      <SectionTabs />
      <ProductSection
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        quantities={selection.quantities}
        countByCategory={summary.countByCategory}
        onQuantityChange={setQuantity}
        showError={visibleIssue === "items"}
      />
      <SectionDivider />
      <DateTimeSection
        now={now}
        date={selection.date}
        time={selection.time}
        onChange={setSchedule}
        issue={visibleIssue === "date" || visibleIssue === "time" ? visibleIssue : null}
      />
      <SectionDivider />
      <ReserveSection
        reservation={reservation}
        summary={summary}
        units={units}
        unitActions={unitActions}
        onSubmit={submit}
      />
      {reservation === null && <SubmitBar summary={summary} />}
    </>
  );
}
