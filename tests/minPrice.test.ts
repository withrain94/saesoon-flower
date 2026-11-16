import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { en } from "@/i18n/en";
import { getMinPriceNotice, getMinPriceNoticeText, getMinPricePeriodOn } from "@/lib/minPrice";
import { getMinPriceConflict, getSelectionIssue } from "@/lib/selection";
import { validateReservationRequest } from "@/lib/reservationValidation";
import { toNowInTimeZone } from "@/lib/time";
import type { ReservationRequest, Selection } from "@/types/reservation";

const b50 = allProducts.find((product) => product.id === "bouquet-50000")!;
const b60 = allProducts.find((product) => product.id === "bouquet-60000")!;
const submittedAt = new Date("2026-11-20T10:00+09:00");
const now = toNowInTimeZone(submittedAt);

const selection = (productId: string, date: string | null): Selection => ({
  quantities: { [productId]: 1 },
  chocolates: {},
  date,
  time: date ? "15:00" : null,
});

function request(product: typeof b50, date: string): ReservationRequest {
  return {
    items: [{ productId: product.id, category: product.category, price: product.price, quantity: 1 }],
    deliveries: [
      {
        productId: product.id,
        category: product.category,
        price: product.price,
        unitNo: 1,
        recipientName: "",
        recipientPhone: "",
        recipientAddress: "",
        topperSender: "",
        messageType: "none",
        memo: "",
        ribbonLeft: "",
        ribbonRight: "",
        blackboard: "",
        blackboardPreset: "",
      },
    ],
    chocolates: [],
    totalQuantity: 1,
    totalPrice: product.price,
    date,
    time: "15:00",
    ordererName: "홍길동",
    ordererPhone: "010-1111-2222",
    color: "auto",
    colorOther: "",
    receiveMethod: "pickup",
    forEvent: false,
    orchidDelivery: null,
    paymentMethod: "bank",
    paypalEmail: "",
    paypalAmount: 0,
    cashReceiptType: "none",
    cashReceiptNumber: "",
    cardPayer: "same",
    cardPayerContact: "",
    documents: [],
    documentCompany: "",
    documentBusinessNumber: "",
    submittedAt: submittedAt.toISOString(),
    privacyAgreed: true,
    locale: "ko",
  };
}

describe("졸업시즌 최소 금액 (lib/minPrice)", () => {
  it("기간: 12/23 ~ 2/26 받는 날 (양 끝 포함)", () => {
    assert.equal(getMinPricePeriodOn("2026-12-22"), undefined);
    assert.equal(getMinPricePeriodOn("2026-12-23")?.id, "graduation");
    assert.equal(getMinPricePeriodOn("2027-01-15")?.id, "graduation");
    assert.equal(getMinPricePeriodOn("2027-02-26")?.id, "graduation");
    assert.equal(getMinPricePeriodOn("2027-02-27"), undefined);
  });

  it("상품 칸 안내: 날짜 전엔 미리 알림, 기간 날짜면 막힘, 6만원 이상·기간 밖이면 없음", () => {
    assert.equal(getMinPriceNotice(b50.price, null, now)?.kind, "upcoming");
    assert.equal(getMinPriceNotice(b50.price, "2026-12-24", now)?.kind, "blocked");
    assert.equal(getMinPriceNotice(b50.price, "2026-12-22", now), null);
    assert.equal(getMinPriceNotice(b60.price, "2026-12-24", now), null);
    assert.equal(getMinPriceNotice(b60.price, null, now), null);
    // 기간이 끝난 뒤엔 미리 알림도 사라짐
    assert.equal(getMinPriceNotice(b50.price, null, toNowInTimeZone(new Date("2027-02-27T10:00+09:00"))), null);
    assert.equal(
      getMinPriceNoticeText(b50.price, null, now)?.text,
      "졸업시즌(12/23~2/26)에 받으시는 예약은 60,000원부터 가능해요.",
    );
    assert.match(getMinPriceNoticeText(b50.price, null, now, en)!.text, /Graduation season \(12\/23–2\/26\)/);
  });

  it("담은 5만원 꽃다발 + 기간 날짜 → 예약 막힘(price), 6만원은 통과", () => {
    assert.equal(getSelectionIssue(selection(b50.id, "2026-12-24"), now), "price");
    assert.match(getMinPriceConflict(selection(b50.id, "2026-12-24"))!, /꽃다발 5만원/);
    assert.equal(getSelectionIssue(selection(b50.id, "2026-12-22"), now), null);
    assert.equal(getSelectionIssue(selection(b60.id, "2026-12-24"), now), null);
    assert.equal(getMinPriceConflict(selection(b50.id, null)), null);
  });

  it("서버 검사도 거절 (손님이 화면을 우회해도)", () => {
    const blocked = validateReservationRequest(request(b50, "2026-12-24"), now, submittedAt);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.match(blocked.message, /졸업시즌/);
    assert.equal(validateReservationRequest(request(b60, "2026-12-24"), now, submittedAt).ok, true);
    assert.equal(validateReservationRequest(request(b50, "2026-12-22"), now, submittedAt).ok, true);
  });
});
