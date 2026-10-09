import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { validateReservationRequest } from "@/lib/reservationValidation";
import { toNowInTimeZone } from "@/lib/time";
import type { ReservationRequest } from "@/types/reservation";

const bouquet = allProducts.find((product) => product.category === "bouquet")!;
const now = toNowInTimeZone(new Date("2026-11-10T10:00+09:00"));
const submittedAt = new Date("2026-11-10T10:00+09:00");

const delivery = (extra: Partial<ReservationRequest["deliveries"][number]> = {}) => ({
  productId: bouquet.id,
  category: bouquet.category,
  price: bouquet.price,
  unitNo: 1,
  recipientName: "",
  recipientPhone: "",
  recipientAddress: "",
  topperSender: "",
  messageType: "none" as const,
  memo: "",
  ribbonLeft: "",
  ribbonRight: "",
  blackboard: "",
  blackboardPreset: "",
  ...extra,
});

/** 서버로 보내는 예약 한 건 (기본: 픽업, 꽃다발 1개, 11/12 오후 3시) */
function request(extra: Partial<ReservationRequest> = {}): ReservationRequest {
  return {
    items: [{ productId: bouquet.id, category: bouquet.category, price: bouquet.price, quantity: 1 }],
    deliveries: [delivery()],
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
    ...extra,
  };
}

const check = (input: ReservationRequest) => validateReservationRequest(input, now, submittedAt);

describe("서버에서 다시 검사 (lib/reservationValidation)", () => {
  it("기본 예약은 통과", () => {
    const result = check(request());
    assert.equal(result.ok, true);
  });

  it("개인정보 동의가 없으면 거절", () => {
    assert.equal(check(request({ privacyAgreed: false })).ok, false);
  });

  it("금액은 손님이 보낸 값이 아니라 상품 데이터로 다시 계산", () => {
    const result = check(request({ totalPrice: 10 }));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.request.totalPrice, bouquet.price);
  });

  it("배송이면 받는 분 성함·연락처·배송지가 모두 있어야 통과", () => {
    const missing = check(request({ receiveMethod: "delivery" }));
    assert.equal(missing.ok, false);

    const full = check(
      request({
        receiveMethod: "delivery",
        deliveries: [delivery({ recipientName: "김영희", recipientPhone: "010-3333-4444", recipientAddress: "전주시 1" })],
      }),
    );
    assert.equal(full.ok, true);
    if (full.ok) assert.equal(full.request.deliveries[0].recipientAddress, "전주시 1");
  });

  it("픽업이면 배송지는 저장하지 않음", () => {
    const result = check(request({ deliveries: [delivery({ recipientAddress: "전주시 1" })] }));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.request.deliveries[0].recipientAddress, "");
  });

  it("행사 꽃이 아니면 토퍼를 저장하지 않음", () => {
    const eventDay = { date: "2026-10-30", time: "08:00" };
    const eventNow = toNowInTimeZone(new Date("2026-10-20T10:00+09:00"));
    const withTopper = (forEvent: boolean) =>
      validateReservationRequest(
        request({ ...eventDay, forEvent, deliveries: [delivery({ topperSender: "총무과 일동" })] }),
        eventNow,
        submittedAt,
      );

    const yes = withTopper(true);
    assert.equal(yes.ok, true);
    if (yes.ok) assert.equal(yes.request.deliveries[0].topperSender, "총무과 일동");

    const no = withTopper(false);
    assert.equal(no.ok, true);
    if (no.ok) assert.equal(no.request.deliveries[0].topperSender, "");
  });

  it("수료식 날에도 토퍼는 보내는 분 이름·팀 한 칸", () => {
    const graduationNow = toNowInTimeZone(new Date("2026-11-20T10:00+09:00"));
    const result = validateReservationRequest(
      request({
        date: "2026-11-27",
        time: "08:00",
        forEvent: true,
        deliveries: [delivery({ topperSender: "고위정책과정 동기 일동" })],
      }),
      graduationNow,
      submittedAt,
    );
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.request.deliveries[0].topperSender, "고위정책과정 동기 일동");
  });

  it("지난 시간·마감된 시간은 거절", () => {
    assert.equal(check(request({ date: "2026-11-09" })).ok, false);
    // 오후 5시가 지난 뒤 다음날 오전 9시
    const evening = toNowInTimeZone(new Date("2026-11-11T17:30+09:00"));
    assert.equal(validateReservationRequest(request({ date: "2026-11-12", time: "09:00" }), evening, submittedAt).ok, false);
  });

  it("PayPal은 이메일이 있어야 하고 수수료가 더해짐", () => {
    assert.equal(check(request({ paymentMethod: "paypal" })).ok, false);
    const result = check(request({ paymentMethod: "paypal", paypalEmail: "guest@example.com" }));
    assert.equal(result.ok, true);
    if (result.ok) assert.ok(result.request.paypalAmount > result.request.totalPrice);
  });
});
