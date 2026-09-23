import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { buildReservationCsv, reservationCsvFileName } from "@/lib/reservationBackup";
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
        topperName: "",
        topperRank: "",
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

describe("예약 전체 내려받기 (lib/reservationBackup)", () => {
  const csv = buildReservationCsv([reservation]);

  it("엑셀에서 한글이 깨지지 않도록 맨 앞에 표시를 넣음", () => {
    assert.equal(csv.startsWith("﻿"), true);
  });

  it("머리글 한 줄 + 예약 한 줄", () => {
    // 칸 안의 줄바꿈은 따옴표 안에 있으므로 줄 수로 세지 않고 시작 글자로 확인
    assert.equal(csv.includes('"접수번호","접수 시각"'), true);
    assert.equal(csv.includes("5D7BBC7E"), true);
  });

  it("예약 내용과 배송지가 들어감", () => {
    assert.equal(csv.includes("홍길동"), true);
    assert.equal(csv.includes("전주시 덕진구 1"), true);
    assert.equal(csv.includes("배송"), true);
  });

  it("따옴표·쉼표가 있어도 칸이 밀리지 않게 감쌈", () => {
    assert.equal(csv.includes('"메모에 ""따옴표""와, 쉼표"'), true);
  });

  it("신청서 원본(JSON)이 마지막 칸에 들어가 되살릴 수 있음", () => {
    assert.equal(csv.includes('""ordererName"":""홍길동""'), true);
  });

  it("파일 이름에 날짜가 들어감", () => {
    assert.equal(reservationCsvFileName("2026-11-12"), "saesoon-reservations-2026-11-12.csv");
  });
});
