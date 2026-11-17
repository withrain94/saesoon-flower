import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chocolateChoices, chocolates, dollChoices, getAddOnIcon, MAX_CHOCOLATE_QUANTITY, shoppingBag } from "@/data/chocolates";
import { allProducts } from "@/data/products";
import { buildBusinessDocument } from "@/lib/documents";
import { validateReservationRequest } from "@/lib/reservationValidation";
import { formatAdminItemName } from "@/lib/adminFormat";
import { getItemName, hasChocolate, summarizeSelection, withChocolateQuantity } from "@/lib/selection";
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
    cardKind: "keyin",
    tossPayment: false,
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

  it("쇼핑백 2,000원은 합계에 더해지지만 초콜릿으로 세지 않음", () => {
    const summary = summarizeSelection(selection({ [shoppingBag.id]: 1 }));
    assert.equal(shoppingBag.price, 2000);
    assert.equal(summary.totalPrice, bouquet.price + 2000);
    assert.equal(summary.totalQuantity, 1);
    // 쇼핑백만 담았으면 "초콜릿도 함께?" 창은 그대로 뜸
    assert.equal(hasChocolate(selection({ [shoppingBag.id]: 1 })), false);
    assert.equal(hasChocolate(selection({ [shoppingBag.id]: 1, "ferrero-1": 1 })), true);
    // 초콜릿 칸에는 쇼핑백이 안 보임
    assert.equal(chocolateChoices.some((chocolate) => chocolate.id === shoppingBag.id), false);
    assert.equal(chocolateChoices.length, chocolates.length - 1 - dollChoices.length);
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

describe("치이카와 꽃다발·인형 단품 (2026-11-17)", () => {
  const dolls = allProducts.filter((product) => product.category === "doll");

  it("치이카와 꽃다발 4종이 위, 초콜릿 꽃다발 6종이 아래 — id가 겹치지 않음", () => {
    assert.deepEqual(
      dolls.map((product) => [product.id, product.price]),
      [
        ["doll-chiikawa", 80000],
        ["doll-hachiware", 80000],
        ["doll-usagi", 80000],
        ["doll-trio", 100000],
        // 초콜릿 꽃다발 = 8만원 꽃다발 + 초콜릿 단품 금액 (2026-11-17 사용자 확인)
        ["doll-choco-hippo15", 80000 + 15 * 1500],
        ["doll-choco-hippo20", 80000 + 20 * 1500],
        ["doll-choco-ferrero10", 80000 + 10 * 3000],
        ["doll-choco-ferrero15", 80000 + 15 * 3000],
        ["doll-choco-ferrero20", 80000 + 20 * 3000],
        ["doll-choco-silvapink", 180000],
      ],
    );
    // 매장 화면·알림·노션에는 초콜릿 개수가 보이는 상품 이름으로
    assert.ok(
      formatAdminItemName({ productId: "doll-choco-ferrero15", category: "doll", price: 125000 }).startsWith(
        "페레로로쉐 15개 초콜릿 꽃다발",
      ),
    );
    assert.equal(new Set(allProducts.map((product) => product.id)).size, allProducts.length);
  });

  it("금액이 같아도 상품 이름으로 구분 (손님 화면·관리자·알림)", () => {
    assert.equal(getItemName(dolls[0]), "치이카와 꽃다발 8만원");
    assert.equal(getItemName(bouquet), "꽃다발 5만원");
    assert.equal(
      formatAdminItemName({ productId: "doll-hachiware", category: "doll", price: 80000 }),
      "하치와레 꽃다발 8만원",
    );
    assert.equal(formatAdminItemName({ productId: "bouquet-60000", category: "bouquet", price: 60000 }), "꽃다발 6만원");
  });

  it("인형 단품 3종 각 8,000원 + 뜨개 하트 2개 세트 3종 각 20,000원 — 합계에 더해지고, 담으면 \"함께?\" 창이 안 뜸", () => {
    assert.deepEqual(dollChoices.map((doll) => [doll.id, doll.price]), [
      ["doll-chiikawa", 8000],
      ["doll-hachiware", 8000],
      ["doll-usagi", 8000],
      ["dollset-chiikawa", 20000],
      ["dollset-hachiware", 20000],
      ["dollset-usagi", 20000],
    ]);
    assert.equal(getAddOnIcon("dollset-usagi"), "🧸");
    const summary = summarizeSelection(selection({ "doll-usagi": 2 }));
    assert.equal(summary.totalPrice, bouquet.price + 16000);
    // 인형을 담았으면 "초콜릿·인형도 함께?" 창은 안 뜸 (2026-11-17 사용자 요청으로 창에 인형도 보임)
    assert.equal(hasChocolate(selection({ "doll-usagi": 2 })), true);
    assert.equal(chocolateChoices.some((chocolate) => chocolate.id.startsWith("doll-")), false);
    assert.equal(getAddOnIcon("doll-usagi"), "🧸");
    assert.equal(getAddOnIcon(shoppingBag.id), "🛍️");
    assert.equal(getAddOnIcon("ferrero-1"), "🍫");
  });

  it("서버가 치이카와 꽃다발·인형 단품을 받아 금액을 다시 계산", () => {
    const base = request([{ chocolateId: "doll-chiikawa", price: 1, quantity: 1 }]);
    const trio = dolls[3];
    const result = validateReservationRequest(
      {
        ...base,
        items: [{ productId: trio.id, category: trio.category, price: 1, quantity: 1 }],
        deliveries: base.deliveries.map((delivery) => ({ ...delivery, productId: trio.id, category: trio.category, price: 1 })),
      },
      now,
      submittedAt,
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.request.items[0].price, 100000);
      assert.equal(result.request.chocolates[0].price, 8000);
      assert.equal(result.request.totalPrice, 108000);
      const document = buildBusinessDocument("quote", result.request);
      assert.equal(document.rows[0].name, "먼작귀 3총사 꽃다발 10만원");
      assert.equal(document.total, 108000);
    }
  });
});
