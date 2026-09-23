import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { localeOptions, messages } from "@/i18n";
import { buildReservationShareText, KAKAO_TEXT_MAX } from "@/lib/reservationShare";
import type { PaymentMethod, ReservationRequest } from "@/types/reservation";

const bouquet = allProducts.find((product) => product.category === "bouquet")!;

function request(paymentMethod: PaymentMethod = "bank"): ReservationRequest {
  return {
    items: [{ productId: bouquet.id, category: bouquet.category, price: bouquet.price, quantity: 2 }],
    deliveries: [],
    totalQuantity: 2,
    totalPrice: bouquet.price * 2,
    date: "2026-11-27",
    time: "09:00",
    ordererName: "홍길동",
    ordererPhone: "010-1111-2222",
    color: "auto",
    colorOther: "",
    receiveMethod: "delivery",
    forEvent: true,
    orchidDelivery: null,
    paymentMethod,
    paypalEmail: paymentMethod === "paypal" ? "guest@example.com" : "",
    paypalAmount: paymentMethod === "paypal" ? bouquet.price * 2.2 : 0,
    cashReceiptType: "none",
    cashReceiptNumber: "",
    cardPayer: "same",
    cardPayerContact: "",
    documents: [],
    documentCompany: "",
    documentBusinessNumber: "",
    submittedAt: "2026-11-20T01:00:00.000Z",
    privacyAgreed: true,
    locale: "ko",
  };
}

const id = "5d7bbc7e-1111-2222-3333-444455556666";

describe("카카오톡·복사 글 (lib/reservationShare)", () => {
  it("모든 언어에서 접수번호가 들어감", () => {
    for (const { code } of localeOptions) {
      const text = buildReservationShareText(messages[code], id, request(), KAKAO_TEXT_MAX);
      assert.ok(text.includes("5D7BBC7E"), `${code}에 접수번호가 없음`);
    }
  });

  it("카카오톡 200자를 넘지 않고, 안내가 중간에서 잘리지 않음", () => {
    for (const { code } of localeOptions) {
      for (const method of ["bank", "card", "paypal"] as PaymentMethod[]) {
        const text = buildReservationShareText(messages[code], id, request(method), KAKAO_TEXT_MAX);
        assert.ok(text.length <= KAKAO_TEXT_MAX, `${code}/${method} 글이 너무 김`);
        const note = messages[code].share.receiptNote;
        // 안내는 통째로 들어가거나 아예 빠짐 (반쯤 잘린 글이 남지 않게)
        const lastLine = text.split("\n").at(-1) ?? "";
        assert.ok(!note.startsWith(lastLine) || lastLine === note, `${code}/${method} 안내가 잘림`);
      }
    }
  });

  it("글자 수 제한이 없으면(복사·다른 앱 공유) 접수번호 안내가 항상 들어감", () => {
    for (const { code } of localeOptions) {
      const text = buildReservationShareText(messages[code], id, request());
      assert.ok(text.endsWith(messages[code].share.receiptNote), `${code}에 안내가 없음`);
    }
  });

  it("계좌이체면 입금 계좌가 들어감", () => {
    const text = buildReservationShareText(messages.ko, id, request(), KAKAO_TEXT_MAX);
    assert.ok(text.includes("302-0690-4409-61"));
  });
});
