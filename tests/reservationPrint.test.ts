import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { buildPrintList, PRINT_COLUMNS } from "@/lib/reservationPrint";
import type { StoredReservation } from "@/types/reservation";

const bouquet = allProducts.find((product) => product.category === "bouquet")!;

const reservation: StoredReservation = {
  id: "5d7bbc7e-1111-2222-3333-444455556666",
  createdAt: "2026-11-10T01:00:00.000Z",
  status: "confirmed",
  adminMemo: '메모에 "따옴표"와, 쉼표',
  cancelRequest: null,
  reminderSentAt: null,
  cashReceiptIssuedAt: null,
  payment: null,
  request: {
    items: [{ productId: bouquet.id, category: bouquet.category, price: bouquet.price, quantity: 1 }],
    chocolates: [],
    deliveries: [
      {
        productId: bouquet.id,
        category: bouquet.category,
        price: bouquet.price,
        unitNo: 1,
        recipientName: "김영희",
        recipientPhone: "010-3333-4444",
        recipientAddress: "전주시 덕진구 1",
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
    totalQuantity: 1,
    totalPrice: bouquet.price,
    date: "2026-11-12",
    time: "15:00",
    ordererName: "홍길동",
    ordererPhone: "010-1111-2222",
    color: "auto",
    colorOther: "",
    receiveMethod: "delivery",
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
    submittedAt: "2026-11-10T01:00:00.000Z",
    privacyAgreed: true,
    locale: "ko",
  },
};

describe("예약 목록 인쇄 (lib/reservationPrint)", () => {
  it("상품·쇼핑백 1개당 한 줄, 예약 첫 줄 표시, 그림글자 빼기, 제목·건수", () => {
    const withBag: StoredReservation = {
      ...reservation,
      adminMemo: "📞 매장 예약",
      request: { ...reservation.request, chocolates: [{ chocolateId: "shoppingbag", price: 2000, quantity: 1 }] },
    };
    const list = buildPrintList("2026-11-12", [withBag, { ...reservation, id: "aaaaaaaa-0000" }]);
    assert.equal(list.rows.length, 3);
    assert.deepEqual(list.rows.map((row) => row.firstOfReservation), [true, false, true]);
    const at = (header: (typeof PRINT_COLUMNS)[number], row = 0) => list.rows[row].cells[PRINT_COLUMNS.indexOf(header)];
    assert.equal(at("시간"), "오후 3:00");
    assert.equal(at("받는분"), "김영희\n010-3333-4444");
    assert.equal(at("접수번호·메모"), "5D7BBC7E\n매장 예약");
    assert.ok(!/[\u{10000}-\u{10FFFF}]/u.test(at("상품", 1)));
    assert.ok(list.title.includes("11월 12일"));
    assert.equal(list.summary, "예약 2건 · 꽃 2개 (취소 제외)");
  });
});
