"use client";

import { useState } from "react";
import SectionDivider from "@/components/ui/SectionDivider";
import { getEventOn, type SpecialEvent } from "@/data/events";
import { productCategories } from "@/data/products";
import { isSlotBookable } from "@/lib/time";
import type { ProductCategoryId } from "@/types/reservation";
import BookingSteps from "./BookingSteps";
import CategoryEntry from "./CategoryEntry";
import ChocolateField from "./ChocolateField";
import ChocolatePrompt from "./ChocolatePrompt";
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
import { useTossReviewParam } from "./useTossReviewParam";

/**
 * tossMode: 토스페이먼츠 키 종류 (app/page.tsx가 서버 환경변수로 정함) — live = 모든 손님에게 온라인 결제,
 * test(시험 키, 토스 심사 중) = 심사용 주소(?toss=test)로 들어온 화면에서만 켬. 일반 손님은 예전 결제 방식 그대로
 */
export default function ReservationPage({ tossMode }: { tossMode: "off" | "test" | "live" }) {
  const tossReview = useTossReviewParam() && tossMode === "test";
  const tossEnabled = tossMode === "live" || tossReview;
  const {
    now,
    selection,
    setQuantity,
    setSchedule,
    units,
    unitActions,
    orderer,
    setOrderer,
    receiveMethod,
    setReceiveMethod,
    chocolateQuantities,
    setChocolateQuantity,
    chocolatePromptOpen,
    closeChocolatePrompt,
    submitFromChocolatePrompt,
    forEvent,
    setForEvent,
    priceConflict,
    visibleIssue,
    summary,
    reservation,
    submitting,
    submitError,
    submit,
  } = useReservation(tossReview);
  const [categoryId, setCategoryId] = useState<ProductCategoryId>(productCategories[0].id);

  /** 첫 화면 입구 카드 → 해당 종류 목록으로 이동 */
  function openCategory(id: ProductCategoryId) {
    setCategoryId(id);
    scrollToSection(SECTION.items);
  }

  /** 특별한 날 배너 → 그 날짜를 미리 고르고 고른 상품(기본: 추천 상품) 목록으로 이동 */
  function bookEvent(event: SpecialEvent, category: ProductCategoryId = event.recommendedCategory) {
    const keepTime =
      selection.time !== null && now !== null && isSlotBookable(selection.time, event.date, now);
    setSchedule({ date: event.date, time: keepTime ? selection.time : null });
    openCategory(category);
  }

  return (
    <>
      <SpecialEventBanner now={now} onBook={bookEvent} />
      {reservation === null && <BookingSteps />}
      <CategoryEntry countByCategory={summary.countByCategory} onSelect={openCategory} now={now} />
      <NaverOnlyBookingLinks />
      <NaverBookingBanner />
      <SectionTabs />
      <ProductSection
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        quantities={selection.quantities}
        countByCategory={summary.countByCategory}
        onQuantityChange={setQuantity}
        addOnQuantities={chocolateQuantities}
        onAddOnChange={setChocolateQuantity}
        showError={visibleIssue === "items"}
        date={selection.date}
        now={now}
        priceConflict={reservation === null ? priceConflict : null}
      />
      {/* 초콜릿 추가 — 꽃을 고른 바로 아래 (2026-10-12 사용자 요청: 신청서 안쪽은 너무 아래라 잘 안 보임) */}
      {reservation === null && (
        <div className="px-5 pb-7 pt-1">
          <div className="rounded-2xl border border-brand bg-brand-tint px-4 py-4">
            <ChocolateField quantities={chocolateQuantities} onChange={setChocolateQuantity} withDolls />
          </div>
        </div>
      )}
      <SectionDivider />
      <DateTimeSection
        now={now}
        date={selection.date}
        time={selection.time}
        onChange={setSchedule}
        issue={visibleIssue === "date" || visibleIssue === "time" ? visibleIssue : null}
        priceConflict={reservation === null ? priceConflict : null}
      />
      <SectionDivider />
      <ReserveSection
        reservation={reservation}
        summary={summary}
        units={units}
        unitActions={unitActions}
        orderer={orderer}
        onOrdererChange={setOrderer}
        receiveMethod={receiveMethod}
        onReceiveMethodChange={setReceiveMethod}
        event={selection.date ? (getEventOn(selection.date) ?? null) : null}
        forEvent={forEvent}
        onForEventChange={setForEvent}
        onSubmit={submit}
        tossEnabled={tossEnabled}
        tossTestMode={tossReview}
      />
      {reservation === null && <SubmitBar summary={summary} submitting={submitting} error={submitError} />}
      <ChocolatePrompt
        open={chocolatePromptOpen}
        summary={summary}
        quantities={chocolateQuantities}
        onChange={setChocolateQuantity}
        onSubmit={submitFromChocolatePrompt}
        onClose={closeChocolatePrompt}
      />
    </>
  );
}
