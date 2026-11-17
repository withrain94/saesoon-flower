import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { buildOrdererSmsText, completionPhotoPageUrl, isAppleMobile, smsAppLink, toSmsPhoneNumber } from "@/lib/ordererSms";
import type { ReservationRequest } from "@/types/reservation";

const bouquet = allProducts.find((product) => product.category === "bouquet")!;
const id = "5d7bbc7e-1111-2222-3333-444455556666";

function request(receiveMethod: ReservationRequest["receiveMethod"]): ReservationRequest {
  return {
    items: [{ productId: bouquet.id, category: bouquet.category, price: bouquet.price, quantity: 1 }],
    deliveries: [],
    chocolates: [],
    totalQuantity: 1,
    totalPrice: bouquet.price,
    date: "2026-11-27",
    time: "15:00",
    ordererName: "홍길동",
    ordererPhone: "010-1111-2222",
    color: "auto",
    colorOther: "",
    receiveMethod,
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
    submittedAt: "2026-11-20T01:00:00.000Z",
    privacyAgreed: true,
    locale: "ko",
  };
}

describe("예약자 안내 문자 (lib/ordererSms)", () => {
  it("휴대폰 번호를 국제 형식으로", () => {
    assert.equal(toSmsPhoneNumber("010-1234-5678"), "+821012345678");
    assert.equal(toSmsPhoneNumber("01012345678"), "+821012345678");
    assert.equal(toSmsPhoneNumber("011-123-4567"), "+82111234567");
    assert.equal(toSmsPhoneNumber("+1 (555) 123-4567"), "+15551234567");
    assert.equal(toSmsPhoneNumber("+82 10-1234-5678"), "+821012345678");
    assert.equal(toSmsPhoneNumber("063-123-4567"), null);
    assert.equal(toSmsPhoneNumber("abc"), null);
  });

  it("픽업 + 완성 사진 → 준비됐어요·매장 주소·사진 링크", () => {
    const text = buildOrdererSmsText(id, request("pickup"), { hasPhotos: true });
    assert.ok(text.startsWith("[새순 꽃집] 홍길동님, 예약하신 꽃이 예쁘게 준비됐어요."));
    assert.ok(text.includes("- 픽업 일시: 11월 27일(금)"));
    assert.ok(text.includes("- 매장: "));
    assert.ok(text.includes(completionPhotoPageUrl(id)));
  });

  it("배송 + 사진 없음 → 주소·링크 없음", () => {
    const text = buildOrdererSmsText(id, request("delivery"), { hasPhotos: false });
    assert.ok(text.includes("- 배송 일시:"));
    assert.ok(!text.includes("- 매장:"));
    assert.ok(!text.includes("/photo/"));
  });

  it("문자 앱 링크 — 안드로이드 ?body= / 아이폰 &body=", () => {
    const body = encodeURIComponent("안녕 a&b");
    assert.equal(smsAppLink("010-1234-5678", "안녕 a&b", { ios: false }), `sms:01012345678?body=${body}`);
    assert.equal(smsAppLink("010-1234-5678", "안녕 a&b", { ios: true }), `sms:01012345678&body=${body}`);
  });

  it("아이폰·아이패드 구분", () => {
    assert.equal(isAppleMobile("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", 5), true);
    assert.equal(isAppleMobile("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5), true);
    assert.equal(isAppleMobile("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0), false);
    assert.equal(isAppleMobile("Mozilla/5.0 (Linux; Android 14; SM-S918N)", 5), false);
  });
});
