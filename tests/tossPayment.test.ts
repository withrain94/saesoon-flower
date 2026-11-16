import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { guessTossBankCode, tossBanks } from "@/data/tossBanks";
import { validateReservationRequest } from "@/lib/reservationValidation";
import { toNowInTimeZone } from "@/lib/time";
import {
  buildTossCheckout,
  canStartTossPayment,
  readyPaymentRecord,
  reservationIdFromOrderId,
  shouldReplacePayment,
  toTossOrderId,
  toTossPaymentRecord,
  tossCustomerPhone,
  virtualAccountValidHours,
} from "@/lib/tossPayment";
import type { ReservationRequest, TossPaymentRecord } from "@/types/reservation";

const bouquet = allProducts.find((product) => product.category === "bouquet")!;
const submittedAt = new Date("2026-11-10T10:00+09:00");
const now = toNowInTimeZone(submittedAt);
const ID = "5d7bbc7e-1234-4abc-8def-0123456789ab";

function request(extra: Partial<ReservationRequest> = {}): ReservationRequest {
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
    chocolates: [],
    totalQuantity: 1,
    totalPrice: bouquet.price,
    date: "2026-11-12",
    time: "15:00",
    ordererName: "홍길동",
    ordererPhone: "010-1234-5678",
    color: "auto",
    colorOther: "",
    receiveMethod: "pickup",
    forEvent: false,
    orchidDelivery: null,
    paymentMethod: "bank",
    paypalEmail: "",
    paypalAmount: 0,
    cashReceiptType: "income",
    cashReceiptNumber: "010-1234-5678",
    cardKind: "online",
    tossPayment: true,
    cardPayer: "other",
    cardPayerContact: "김결제 010-0000-0000",
    documents: [],
    documentCompany: "",
    documentBusinessNumber: "",
    submittedAt: submittedAt.toISOString(),
    privacyAgreed: true,
    locale: "ko",
    ...extra,
  };
}

const validate = (input: ReservationRequest, tossEnabled: boolean) => {
  const result = validateReservationRequest(input, now, submittedAt, { tossEnabled });
  assert.equal(result.ok, true);
  return (result as { ok: true; request: ReservationRequest }).request;
};

describe("온라인 결제 여부는 서버가 정함 (reservationValidation)", () => {
  it("온라인 결제를 켜기 전: 손님이 tossPayment=true를 보내도 false, 카드는 키인", () => {
    const bank = validate(request(), false);
    assert.equal(bank.tossPayment, false);
    assert.equal(bank.cashReceiptType, "income");
    const card = validate(request({ paymentMethod: "card", cardKind: "online" }), false);
    assert.equal(card.tossPayment, false);
    assert.equal(card.cardKind, "keyin");
    assert.equal(card.cardPayer, "other");
  });

  it("켠 뒤 계좌이체: 온라인 결제 + 신청서 현금영수증은 버림(결제창에서 신청)", () => {
    const bank = validate(request(), true);
    assert.equal(bank.tossPayment, true);
    assert.equal(bank.cashReceiptType, "none");
    assert.equal(bank.cashReceiptNumber, "");
  });

  it("켠 뒤 개인카드: 온라인 결제, 결제하실 분 칸은 버림", () => {
    const card = validate(request({ paymentMethod: "card", cardKind: "online" }), true);
    assert.equal(card.tossPayment, true);
    assert.equal(card.cardPayer, "same");
  });

  it("켠 뒤 법인카드: 온라인 결제 아님(키인), 결제하실 분 칸은 남김", () => {
    const card = validate(request({ paymentMethod: "card", cardKind: "keyin" }), true);
    assert.equal(card.tossPayment, false);
    assert.equal(card.cardKind, "keyin");
    assert.equal(card.cardPayerContact, "김결제 010-0000-0000");
  });

  it("PayPal은 언제나 온라인 결제 아님", () => {
    const paypal = validate(request({ paymentMethod: "paypal", paypalEmail: "a@b.co" }), true);
    assert.equal(paypal.tossPayment, false);
  });
});

describe("토스 결제 규칙 (lib/tossPayment)", () => {
  it("주문번호에서 예약 id를 다시 꺼냄, 이상한 값은 null", () => {
    const orderId = toTossOrderId(ID, "lx3k2a");
    assert.equal(orderId, `${ID}_lx3k2a`);
    assert.ok(orderId.length <= 64);
    assert.equal(reservationIdFromOrderId(orderId), ID);
    assert.equal(reservationIdFromOrderId("hello_1"), null);
    assert.equal(reservationIdFromOrderId(`${ID}_a/b`), null);
    assert.equal(reservationIdFromOrderId(42), null);
  });

  it("휴대폰 번호는 국내 번호만 숫자로", () => {
    assert.equal(tossCustomerPhone("010-1234-5678"), "01012345678");
    assert.equal(tossCustomerPhone("+1 415 555 0100"), null);
  });

  it("입금 기한: 받는 시간 1시간 전까지, 1~72시간", () => {
    // 11/10 10:00 → 11/12 15:00 = 53시간 → 52
    assert.equal(virtualAccountValidHours({ date: "2026-11-12", time: "15:00" }, submittedAt), 52);
    assert.equal(virtualAccountValidHours({ date: "2026-11-30", time: "15:00" }, submittedAt), 72);
    assert.equal(virtualAccountValidHours({ date: "2026-11-10", time: "12:00" }, submittedAt), 1);
  });

  it("결제창 정보: 계좌이체는 가상계좌 + 기한, 카드는 카드", () => {
    const bank = buildTossCheckout(ID, request(), "test_ck_x", toTossOrderId(ID, "a1"), submittedAt);
    assert.equal(bank.method, "VIRTUAL_ACCOUNT");
    assert.equal(bank.amount, bouquet.price);
    assert.equal(bank.validHours, 52);
    assert.equal(bank.orderName, "새순 꽃 예약 5D7BBC7E");
    const card = buildTossCheckout(ID, request({ paymentMethod: "card" }), "test_ck_x", "o", submittedAt);
    assert.equal(card.method, "CARD");
    assert.equal(card.validHours, null);
  });

  it("면세 금액: 꽃만 면세, 초콜릿·쇼핑백은 과세라 빠짐", () => {
    assert.equal(buildTossCheckout(ID, request(), "k", "o", submittedAt).taxFreeAmount, bouquet.price);
    const withAddOns = request({
      items: [{ productId: bouquet.id, category: bouquet.category, price: bouquet.price, quantity: 2 }],
      chocolates: [
        { chocolateId: "ferrero-1", price: 3000, quantity: 2 },
        { chocolateId: "shoppingbag", price: 2000, quantity: 1 },
      ],
      totalPrice: bouquet.price * 2 + 8000,
    });
    const checkout = buildTossCheckout(ID, withAddOns, "k", "o", submittedAt);
    assert.equal(checkout.amount, bouquet.price * 2 + 8000);
    assert.equal(checkout.taxFreeAmount, bouquet.price * 2);
  });

  it("토스 Payment 응답 → 저장 기록 (가상계좌·현금영수증·영수증)", () => {
    const record = toTossPaymentRecord(
      {
        orderId: `${ID}_a1`,
        paymentKey: "pk_1",
        status: "WAITING_FOR_DEPOSIT",
        method: "가상계좌",
        totalAmount: 60000,
        approvedAt: null,
        virtualAccount: { bankCode: "11", accountNumber: "79012345678901", dueDate: "2026-11-12T14:00:00", secret: "x" },
        cashReceipt: { type: "소득공제", issueNumber: "123", receiptUrl: "https://r" },
        receipt: { url: "https://receipt" },
        secret: "should-not-be-stored",
      },
      submittedAt,
    )!;
    assert.equal(record.status, "WAITING_FOR_DEPOSIT");
    assert.deepEqual(record.virtualAccount, { bankCode: "11", accountNumber: "79012345678901", dueDate: "2026-11-12T14:00:00" });
    assert.equal(record.cashReceipt?.type, "소득공제");
    assert.equal(record.receiptUrl, "https://receipt");
    assert.equal(JSON.stringify(record).includes("should-not-be-stored"), false);
    assert.equal(toTossPaymentRecord({ orderId: "x", status: "WHAT" }, submittedAt), null);
  });

  it("예전 결제창 소식이 결제된 기록을 덮지 않음", () => {
    const paid: TossPaymentRecord = { ...readyPaymentRecord(`${ID}_new`, 60000, submittedAt), status: "DONE" };
    const oldAborted: TossPaymentRecord = { ...readyPaymentRecord(`${ID}_old`, 60000, submittedAt), status: "ABORTED" };
    assert.equal(shouldReplacePayment(paid, oldAborted), false);
    assert.equal(shouldReplacePayment(paid, { ...paid, status: "CANCELED" }), true);
    assert.equal(shouldReplacePayment(oldAborted, { ...paid, orderId: `${ID}_x` }), true);
    assert.equal(shouldReplacePayment(null, oldAborted), true);
  });

  it("결제창 다시 열기: 접수 + 온라인 결제 + 아직 결제 안 됨일 때만", () => {
    const base = { request: request(), status: "received" as const, cancelRequest: null, payment: null };
    assert.equal(canStartTossPayment(base), true);
    assert.equal(canStartTossPayment({ ...base, status: "confirmed" }), false);
    assert.equal(canStartTossPayment({ ...base, request: request({ tossPayment: false }) }), false);
    const waiting = { ...readyPaymentRecord("o", 1, submittedAt), status: "WAITING_FOR_DEPOSIT" as const };
    assert.equal(canStartTossPayment({ ...base, payment: waiting }), false);
    const aborted = { ...waiting, status: "ABORTED" as const };
    assert.equal(canStartTossPayment({ ...base, payment: aborted }), true);
  });

  it("손님이 적은 은행 이름 → 토스 은행 코드", () => {
    assert.equal(guessTossBankCode("농협"), "11");
    assert.equal(guessTossBankCode("국민은행"), "06");
    assert.equal(guessTossBankCode("카카오뱅크"), "90");
    assert.equal(guessTossBankCode("전북은행"), "37");
    assert.equal(guessTossBankCode(""), null);
    // 손님 화면 목록에서 고른 이름은 모두 제 코드로 돌아와야 함
    for (const bank of tossBanks) assert.equal(guessTossBankCode(bank.name), bank.code, bank.name);
  });
});
