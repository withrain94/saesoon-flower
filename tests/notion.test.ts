import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { buildNotionRows, NOTION_TABLE_HEADERS } from "@/lib/notionReservation";
import type { StoredReservation } from "@/types/reservation";

const bouquet = allProducts.find((product) => product.category === "bouquet")!;

const reservation: StoredReservation = {
  id: "5d7bbc7e-1111-2222-3333-444455556666",
  createdAt: "2026-11-10T01:00:00.000Z",
  status: "confirmed",
  adminMemo: '메모에 "따옴표"와, 쉼표',
  cancelRequest: null,
  reminderSentAt: null,
  request: {
    items: [{ productId: bouquet.id, category: bouquet.category, price: bouquet.price, quantity: 1 }],
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

describe("노션 표 줄 (lib/notionReservation)", () => {
  const cell = (status: StoredReservation["status"], header: (typeof NOTION_TABLE_HEADERS)[number]) =>
    buildNotionRows({ ...reservation, status })[0][NOTION_TABLE_HEADERS.indexOf(header)];

  it("입금 여부를 결제 방법 칸 앞에 표시 — 접수면 [입금 전], 입금·결제 확인 이후는 [입금 확인]", () => {
    assert.equal(cell("received", "결제 방법").startsWith("[입금 전] "), true);
    for (const status of ["confirmed", "made", "delivered"] as const) {
      assert.equal(cell(status, "결제 방법").startsWith("[입금 확인] "), true);
    }
  });

  it("취소면 입금 표시 없이 예약종류 앞에 [취소]", () => {
    assert.equal(cell("canceled", "결제 방법").startsWith("["), false);
    assert.equal(cell("canceled", "예약종류").startsWith("[취소] "), true);
  });

  it("표 칸 수는 그대로 (이미 만든 날짜 표에 올릴 수 있게)", () => {
    assert.equal(buildNotionRows(reservation)[0].length, 15);
  });
});
