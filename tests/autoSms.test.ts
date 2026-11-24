import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { getDueAutoSms, type AutoSmsReservation } from "@/lib/autoSms";
import type { ReservationRequest, ReservationStatus } from "@/types/reservation";

const bouquet = allProducts.find((product) => product.category === "bouquet")!;
const id = "5d7bbc7e-1111-2222-3333-444455556666";
const ORDERER = "+821011112222";
const RECIPIENT = "+821033334444";

function reservation({
  date = "2026-11-20",
  time = "15:00",
  receiveMethod = "pickup",
  forEvent = false,
  status = "confirmed",
  recipientName = "김받음",
  recipientPhone = "010-3333-4444",
  ordererPhone = "010-1111-2222",
  reminderSentAt = null,
  createdAt = "2026-11-18T10:00:00+09:00",
  updatedAt = createdAt,
}: {
  date?: string;
  time?: string;
  receiveMethod?: ReservationRequest["receiveMethod"];
  forEvent?: boolean;
  status?: ReservationStatus;
  recipientName?: string;
  recipientPhone?: string;
  ordererPhone?: string;
  reminderSentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
} = {}): AutoSmsReservation {
  const request: ReservationRequest = {
    items: [{ productId: bouquet.id, category: bouquet.category, price: bouquet.price, quantity: 1 }],
    deliveries: [
      {
        productId: bouquet.id,
        category: bouquet.category,
        price: bouquet.price,
        unitNo: 1,
        recipientName,
        recipientPhone,
        recipientAddress: receiveMethod === "delivery" ? "전주시 어딘가" : "",
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
    date,
    time,
    ordererName: "홍길동",
    ordererPhone,
    color: "auto",
    colorOther: "",
    receiveMethod,
    forEvent,
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
    submittedAt: createdAt,
    privacyAgreed: true,
    locale: "ko",
  };
  return { id, createdAt, updatedAt, status, request, reminderSentAt };
}

const at = (iso: string) => new Date(iso);
const kinds = (r: AutoSmsReservation, iso: string) => getDueAutoSms(r, at(iso)).map((sms) => `${sms.kind}:${sms.phoneNumber}`);

describe("자동 문자 (lib/autoSms)", () => {
  it("픽업 오후 3시 — 2시간 전(13시)부터 예약 시간 전까지, 사진 문자", () => {
    const r = reservation();
    assert.deepEqual(kinds(r, "2026-11-20T12:50+09:00"), []);
    assert.deepEqual(kinds(r, "2026-11-20T13:00+09:00"), [`pickupPhoto:${ORDERER}`]);
    assert.equal(getDueAutoSms(r, at("2026-11-20T13:00+09:00"))[0].withPhoto, true);
    assert.deepEqual(kinds(r, "2026-11-20T15:00+09:00"), []);
  });

  it("픽업 오전 10시 — 전날 오후 5시, 밤(21~7시)엔 안 보내고 아침에 다시", () => {
    const r = reservation({ time: "10:00" });
    assert.deepEqual(kinds(r, "2026-11-19T16:50+09:00"), []);
    assert.deepEqual(kinds(r, "2026-11-19T17:00+09:00"), [`pickupPhoto:${ORDERER}`]);
    assert.deepEqual(kinds(r, "2026-11-19T22:00+09:00"), []);
    assert.deepEqual(kinds(r, "2026-11-20T08:00+09:00"), [`pickupPhoto:${ORDERER}`]);
  });

  it("입금 전·직접 문자 보낸 예약·해외 번호는 안 보냄", () => {
    assert.deepEqual(kinds(reservation({ status: "received" }), "2026-11-20T13:00+09:00"), []);
    assert.deepEqual(kinds(reservation({ reminderSentAt: "2026-11-20T12:00+09:00" }), "2026-11-20T13:00+09:00"), []);
    assert.deepEqual(kinds(reservation({ ordererPhone: "+1 555-123-4567" }), "2026-11-20T13:00+09:00"), []);
  });

  it("인재개발원 승진식(12/4 금) — 전날 19시 받는 분, 20시 예약자 사진, 당일 8시 받는 분, 10시 배송 완료", () => {
    const r = reservation({ date: "2026-12-04", time: "08:00", forEvent: true });
    assert.deepEqual(kinds(r, "2026-12-03T19:00+09:00"), [`instituteRecipientEve:${RECIPIENT}`]);
    assert.deepEqual(kinds(r, "2026-12-03T20:00+09:00"), [`instituteOrdererPhoto:${ORDERER}`, `instituteRecipientEve:${RECIPIENT}`]);
    assert.deepEqual(kinds(r, "2026-12-04T08:00+09:00"), [`instituteRecipientDay:${RECIPIENT}`]);
    const done = getDueAutoSms(r, at("2026-12-04T10:00+09:00"));
    assert.deepEqual(done.map((sms) => sms.kind), ["instituteOrdererDone"]);
    assert.match(done[0].text, /즐거운 주말/);
    const eve = getDueAutoSms(r, at("2026-12-03T19:00+09:00"))[0].text;
    assert.match(eve, /승진을 축하드립니다\. 내일 아침 8시 인재개발원 수료식장 앞으로/);
  });

  it("장기과정 수료식은 '수료를 축하드립니다', 행사 꽃 아니면 일반 픽업 규칙", () => {
    const r = reservation({ date: "2026-11-27", time: "08:00", forEvent: true });
    assert.match(getDueAutoSms(r, at("2026-11-26T19:00+09:00"))[0].text, /수료를 축하드립니다/);
    const normal = reservation({ date: "2026-11-27", time: "08:00", forEvent: false });
    assert.deepEqual(kinds(normal, "2026-11-26T19:00+09:00"), [`pickupPhoto:${ORDERER}`]);
  });

  it("받는 분(예약자 본인 아님) 연락처가 없으면 예약자에게 매장 번호로 남겨 달라고", () => {
    const r = reservation({ date: "2026-12-04", time: "08:00", forEvent: true, recipientPhone: "" });
    const due = getDueAutoSms(r, at("2026-11-18T10:10+09:00"));
    assert.deepEqual(due.map((sms) => `${sms.kind}:${sms.phoneNumber}`), [`recipientPhoneMissing:${ORDERER}`]);
    assert.match(due[0].text, /김받음님.*010-5954-3963/);
    // 받는 분이 예약자 본인이면 안 보냄
    const self = reservation({ date: "2026-12-04", time: "08:00", forEvent: true, recipientPhone: "", recipientName: "홍길동" });
    assert.deepEqual(kinds(self, "2026-11-18T10:10+09:00"), []);
  });

  it("일반 배송 — 받는 시간 1시간 전 받는 분에게 (예약자 이름), 받는 분 = 예약자 번호면 안 보냄", () => {
    const r = reservation({ receiveMethod: "delivery" });
    assert.deepEqual(kinds(r, "2026-11-20T13:50+09:00"), []);
    const due = getDueAutoSms(r, at("2026-11-20T14:00+09:00"));
    assert.deepEqual(due.map((sms) => `${sms.kind}:${sms.phoneNumber}`), [`deliveryRecipient:${RECIPIENT}`]);
    assert.match(due[0].text, /홍길동님 앞으로 꽃배달/);
    const same = reservation({ receiveMethod: "delivery", recipientPhone: "010-1111-2222" });
    assert.deepEqual(kinds(same, "2026-11-20T14:00+09:00"), []);
  });

  it("취소 — 예약자에게 취소 안내 (밤이면 아침에), 기능 전 예약은 안 보냄", () => {
    const r = reservation({ status: "canceled", updatedAt: "2026-11-19T22:30+09:00" });
    assert.deepEqual(kinds(r, "2026-11-19T22:40+09:00"), []);
    const due = getDueAutoSms(r, at("2026-11-20T07:00+09:00"));
    assert.deepEqual(due.map((sms) => sms.kind), ["canceled"]);
    assert.match(due[0].text, /11\/20 오후 3시 예약\(접수번호 5D7BBC7E\)이 취소되었습니다/);
    const old = reservation({ status: "canceled", createdAt: "2026-11-10T10:00+09:00", updatedAt: "2026-11-19T10:00+09:00" });
    assert.deepEqual(kinds(old, "2026-11-19T10:10+09:00"), []);
  });
});
