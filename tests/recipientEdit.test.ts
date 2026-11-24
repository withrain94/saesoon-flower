import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import {
  applyRecipientEdit,
  buildRecipientEditNotice,
  canEditRecipients,
  getRecipientEditDeadline,
} from "@/lib/recipientEdit";
import type { ReservationRequest, ReservationStatus } from "@/types/reservation";

const bouquet = allProducts.find((product) => product.category === "bouquet")!;

function request(receiveMethod: ReservationRequest["receiveMethod"] = "delivery"): ReservationRequest {
  return {
    items: [{ productId: bouquet.id, category: bouquet.category, price: bouquet.price, quantity: 1 }],
    deliveries: [
      {
        productId: bouquet.id,
        category: bouquet.category,
        price: bouquet.price,
        unitNo: 1,
        recipientName: "김받음",
        recipientPhone: "010-3333-4444",
        recipientAddress: receiveMethod === "delivery" ? "전주시 기지로 1" : "",
        topperSender: "",
        topperCourse: "",
        messageType: "memo",
        memo: "축하해",
        ribbonLeft: "",
        ribbonRight: "",
        blackboard: "",
        blackboardPreset: "",
      },
    ],
    chocolates: [],
    totalQuantity: 1,
    totalPrice: bouquet.price,
    date: "2026-11-30",
    time: "15:00",
    ordererName: "홍길동",
    ordererPhone: "010-1111-2222",
    color: "auto",
    colorOther: "",
    receiveMethod,
    forEvent: false,
    orchidDelivery: null,
    paymentMethod: "bank",
    cardKind: "keyin",
    tossPayment: false,
    paypalEmail: "",
    paypalAmount: 0,
    cashReceiptType: "none",
    cashReceiptNumber: "",
    cardPayer: "same",
    cardPayerContact: "",
    documents: [],
    documentCompany: "",
    documentBusinessNumber: "",
    submittedAt: "2026-11-24T10:00:00+09:00",
    privacyAgreed: true,
    locale: "ko",
  };
}

const at = (dateKey: string, hour: number, minute = 0) => ({ dateKey, minutes: hour * 60 + minute });
const can = (date: string, time: string, now: { dateKey: string; minutes: number }, status: ReservationStatus = "confirmed") =>
  canEditRecipients({ status, cancelRequested: false, date, time }, now);

describe("받는 분 정보 고치기 (lib/recipientEdit)", () => {
  it("기한 — 토·일은 금요일 17시, 9시 이전(9시 포함)은 전날 17시, 그 외는 2시간 전", () => {
    assert.deepEqual(getRecipientEditDeadline("2026-11-28", "15:00"), { dateKey: "2026-11-27", hour: 17 }); // 토
    assert.deepEqual(getRecipientEditDeadline("2026-11-29", "08:00"), { dateKey: "2026-11-27", hour: 17 }); // 일
    assert.deepEqual(getRecipientEditDeadline("2026-11-30", "09:00"), { dateKey: "2026-11-29", hour: 17 }); // 월 9시
    assert.deepEqual(getRecipientEditDeadline("2026-11-30", "10:00"), { dateKey: "2026-11-30", hour: 8 });
    assert.deepEqual(getRecipientEditDeadline("2026-11-30", "15:00"), { dateKey: "2026-11-30", hour: 13 });
  });

  it("기한 전에는 되고, 기한이 되면·취소·전달 완료면 안 됨", () => {
    assert.equal(can("2026-11-28", "15:00", at("2026-11-27", 16, 59)), true);
    assert.equal(can("2026-11-28", "15:00", at("2026-11-27", 17)), false);
    assert.equal(can("2026-11-30", "15:00", at("2026-11-30", 12, 59)), true);
    assert.equal(can("2026-11-30", "15:00", at("2026-11-30", 13)), false);
    assert.equal(can("2026-11-30", "15:00", at("2026-11-29", 10), "canceled"), false);
    assert.equal(can("2026-11-30", "15:00", at("2026-11-29", 10), "delivered"), false);
    assert.equal(canEditRecipients({ status: "received", cancelRequested: true, date: "2026-11-30", time: "15:00" }, at("2026-11-29", 10)), false);
  });

  it("받는 분 칸만 바뀌고 메시지는 그대로, 배송이면 성함·연락처·배송지 필수, 연락처 형식 검사", () => {
    const before = request();
    const edit = (patch: Partial<{ recipientName: string; recipientPhone: string; recipientAddress: string }>, memo = "바꿔치기") => ({
      deliveries: [{ recipientName: "김받음", recipientPhone: "010-3333-4444", recipientAddress: "전주시 기지로 1", memo, ...patch }],
      orchid: null,
    });
    const ok = applyRecipientEdit(before, edit({ recipientPhone: "010-5555-6666" }));
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.request.deliveries[0].recipientPhone, "010-5555-6666");
      assert.equal(ok.request.deliveries[0].memo, "축하해");
      const notice = buildRecipientEditNotice("5d7bbc7e-1111", before, ok.request, "confirmed", null);
      assert.match(notice, /연락처: 010-3333-4444 → 010-5555-6666/);
    }
    assert.deepEqual(applyRecipientEdit(before, edit({ recipientAddress: "" })), { ok: false, code: "recipientAddress" });
    assert.deepEqual(applyRecipientEdit(before, edit({ recipientPhone: "12" })), { ok: false, code: "recipientPhone" });
    assert.deepEqual(applyRecipientEdit(before, edit({})), { ok: false, code: "unchanged" });
    assert.deepEqual(applyRecipientEdit(before, { deliveries: [], orchid: null }), { ok: false, code: "invalid" });
    // 픽업이면 받는 분은 비워도 되고 배송지는 버림
    const pickup = applyRecipientEdit(request("pickup"), {
      deliveries: [{ recipientName: "", recipientPhone: "", recipientAddress: "어딘가" }],
      orchid: null,
    });
    assert.equal(pickup.ok && pickup.request.deliveries[0].recipientAddress, "");
  });
});
