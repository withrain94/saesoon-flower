import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chocolates, MAX_CHOCOLATE_QUANTITY } from "@/data/chocolates";
import { allProducts } from "@/data/products";
import { buildBusinessDocument } from "@/lib/documents";
import { validateReservationRequest } from "@/lib/reservationValidation";
import { summarizeSelection, withChocolateQuantity } from "@/lib/selection";
import { toNowInTimeZone } from "@/lib/time";
import type { ReservationRequest, Selection } from "@/types/reservation";

const bouquet = allProducts.find((product) => product.category === "bouquet")!;
const ferrero = chocolates.find((chocolate) => chocolate.id === "ferrero-1")!;
const now = toNowInTimeZone(new Date("2026-11-10T10:00+09:00"));
const submittedAt = new Date("2026-11-10T10:00+09:00");

const selection = (chocolateQuantities: Record<string, number>): Selection => ({
  quantities: { [bouquet.id]: 1 },
  chocolates: chocolateQuantities,
  date: "2026-11-12",
  time: "15:00",
});

/** 서버로 보내는 예약 한 건 (꽃다발 1개 + 넘겨준 초콜릿) */
function request(chocolateOrders: ReservationRequest["chocolates"]): ReservationRequest {
  return {
    items: [{ productId: bouquet.id, category: bouquet.category, price: bouquet.price, quantity: 1 }],
    deliveries: [
      {
        productId: bouquet.id,
        category: bouquet.category,
        price: bouquet.price,
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
    chocolates: chocolateOrders,
    totalQuantity: 1,
    totalPrice: bouquet.price,
    date: "2026-11-12",
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

describe("초콜릿 추가 (data/chocolates · lib/selection · 서버 검사)", () => {
  it("고른 초콜릿 금액이 합계에 더해짐", () => {
    const summary = summarizeSelection(selection({ "ferrero-1": 2 }));
    assert.equal(summary.chocolatePrice, ferrero.price * 2);
    assert.equal(summary.totalPrice, bouquet.price + ferrero.price * 2);
    // 꽃 개수(받는 분 칸 수)에는 초콜릿을 세지 않음
    assert.equal(summary.totalQuantity, 1);
  });

  it("수량을 0으로 만들면 목록에서 빠지고, 최대 수량을 넘지 않음", () => {
    assert.deepEqual(withChocolateQuantity({ "ferrero-1": 2 }, "ferrero-1", 0), {});
    assert.equal(withChocolateQuantity({}, "ferrero-1", 999)["ferrero-1"], MAX_CHOCOLATE_QUANTITY);
  });

  it("서버가 초콜릿 금액을 상품 데이터로 다시 계산", () => {
    const result = validateReservationRequest(
      request([{ chocolateId: "ferrero-1", price: 10, quantity: 2 }]),
      now,
      submittedAt,
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.request.chocolates[0].price, ferrero.price);
      assert.equal(result.request.totalPrice, bouquet.price + ferrero.price * 2);
    }
  });

  it("없는 초콜릿·잘못된 수량은 거절", () => {
    assert.equal(
      validateReservationRequest(request([{ chocolateId: "없는초콜릿", price: 3000, quantity: 1 }]), now, submittedAt).ok,
      false,
    );
    assert.equal(
      validateReservationRequest(request([{ chocolateId: "ferrero-1", price: 3000, quantity: 0 }]), now, submittedAt).ok,
      false,
    );
  });

  it("견적서 합계에 초콜릿이 들어감", () => {
    const result = validateReservationRequest(
      request([{ chocolateId: "ferrero-1", price: ferrero.price, quantity: 2 }]),
      now,
      submittedAt,
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      const document = buildBusinessDocument("quote", result.request);
      assert.equal(document.rows.length, 2);
      assert.equal(document.total, result.request.totalPrice);
    }
  });
});
