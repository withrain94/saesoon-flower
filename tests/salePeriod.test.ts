import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts, getCategory } from "@/data/products";
import { getOnSaleCategories, getSalePeriodNoticeText } from "@/lib/salePeriod";
import { getMinPriceConflict, getSalePeriodConflict, getSelectionIssue } from "@/lib/selection";
import { validateReservationRequest } from "@/lib/reservationValidation";
import { toNowInTimeZone } from "@/lib/time";
import type { ReservationRequest, Selection } from "@/types/reservation";

const mini = allProducts.find((product) => product.id === "xmastree-poinsettia-mini")!;
const b50 = allProducts.find((product) => product.id === "bouquet-50000")!;
const submittedAt = new Date("2026-11-20T10:00+09:00");
const now = toNowInTimeZone(submittedAt);

const selection = (productId: string, date: string | null): Selection => ({
  quantities: { [productId]: 1 },
  chocolates: {},
  date,
  time: date ? "15:00" : null,
});

function request(product: typeof mini, date: string): ReservationRequest {
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
        topperCourse: "",
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

describe("크리스마스 식물트리 기간 한정 (lib/salePeriod)", () => {
  it("상품 4개·금액이 네이버 예약과 같음", () => {
    const prices = getCategory("xmastree").products.map((product) => [product.id, product.price]);
    assert.deepEqual(prices, [
      ["xmastree-araucaria", 35000],
      ["xmastree-cypress", 35000],
      ["xmastree-poinsettia-mini", 12000],
      ["xmastree-poinsettia-gift", 25000],
    ]);
  });

  it("탭은 12/28(한국 시각)까지 보이고 12/29부터 사라짐", () => {
    const ids = (iso: string) => getOnSaleCategories(toNowInTimeZone(new Date(iso))).map((item) => item.id);
    assert.ok(ids("2026-12-28T23:59+09:00").includes("xmastree"));
    assert.ok(!ids("2026-12-29T00:00+09:00").includes("xmastree"));
    assert.ok(ids("2026-12-29T00:00+09:00").includes("bouquet"));
  });

  it("받는 날 12/28까지만 — 12/29 이후 날짜면 막힘(period)", () => {
    assert.equal(getSelectionIssue(selection(mini.id, "2026-12-28"), now), null);
    assert.equal(getSelectionIssue(selection(mini.id, "2026-12-29"), now), "period");
    assert.match(getSalePeriodConflict(selection(mini.id, "2027-01-03"))!, /포인세티아 미니.*12월 28일/);
    assert.equal(getSalePeriodNoticeText("xmastree", "2026-12-29"), "12월 28일까지 받는 예약만 가능해요.");
    assert.equal(getSalePeriodNoticeText("xmastree", "2026-12-28"), null);
    assert.equal(getSalePeriodNoticeText("bouquet", "2027-01-03"), null);
  });

  it("졸업시즌 6만원 규칙에서 빠짐 (꽃다발 5만원은 그대로 막힘)", () => {
    assert.equal(getMinPriceConflict(selection(mini.id, "2026-12-24")), null);
    assert.equal(getSelectionIssue(selection(mini.id, "2026-12-24"), now), null);
    assert.equal(getSelectionIssue(selection(b50.id, "2026-12-24"), now), "price");
  });

  it("서버 검사: 12/24 통과, 12/29 거절", () => {
    assert.equal(validateReservationRequest(request(mini, "2026-12-24"), now, submittedAt).ok, true);
    const late = validateReservationRequest(request(mini, "2026-12-29"), now, submittedAt);
    assert.equal(late.ok, false);
    if (!late.ok) assert.match(late.message, /크리스마스 식물트리.*12월 28일/);
  });
});
