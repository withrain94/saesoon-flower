import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { buildMakeChecklist, buildNameTags, buildNotionRows, makeCheckKey, NOTION_TABLE_HEADERS } from "@/lib/notionReservation";
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

describe("받는분 이름표 목록", () => {
  const row = (name: string, receive: string, kind = "꽃다발") => {
    const cells: string[] = NOTION_TABLE_HEADERS.map(() => "");
    cells[NOTION_TABLE_HEADERS.indexOf("받는분 성함")] = name;
    cells[NOTION_TABLE_HEADERS.indexOf("받는 방법")] = receive;
    cells[NOTION_TABLE_HEADERS.indexOf("예약종류")] = kind;
    return cells;
  };
  it("상품 1개당 1줄, 취소·픽업은 빼고, 이름 없으면 (성함 미입력)", () => {
    const tags = buildNameTags([
      row("김하나", "배송"),
      row("김하나", "배송"),
      row("(성함 미입력)", "배송"),
      row("(예약자 픽업)", "매장에서 픽업"),
      row("이두리", "배송", "[취소] 꽃바구니"),
    ]);
    assert.equal(tags.title, "받는분 이름표 (3장 · 상품 1개당 1장)");
    assert.deepEqual(tags.lines, ["김하나\n김하나\n(성함 미입력)"]);
  });
});

describe("제작 체크 목록", () => {
  const row = (receipt: string, name: string, kind = "꽃바구니") => {
    const cells: string[] = NOTION_TABLE_HEADERS.map(() => "");
    cells[NOTION_TABLE_HEADERS.indexOf("접수번호")] = receipt;
    cells[NOTION_TABLE_HEADERS.indexOf("받는분 성함")] = name;
    cells[NOTION_TABLE_HEADERS.indexOf("예약종류")] = kind;
    cells[NOTION_TABLE_HEADERS.indexOf("금액")] = "100,000원";
    cells[NOTION_TABLE_HEADERS.indexOf("날짜/시간대")] = "2026. 11. 27.(금) 오전 8시 인재개발원";
    cells[NOTION_TABLE_HEADERS.indexOf("보내는분 성함")] = "홍길동";
    return cells;
  };
  it("상품 1개당 한 줄, 끝에 (접수번호-순번), 취소는 뺌", () => {
    const list = buildMakeChecklist([row("A1B2C3D4", "김하나"), row("A1B2C3D4", "이두리"), row("FFFF0000", "박셋", "[취소] 꽃다발")]);
    assert.equal(list.title, "제작 체크 (2개)");
    assert.deepEqual(list.items.map((item) => item.key), ["A1B2C3D4-1", "A1B2C3D4-2"]);
    assert.equal(list.items[1].text, "오전 8시 꽃바구니 100,000원 · 받는분 이두리 · 보내는분 홍길동 (A1B2C3D4-2)");
    assert.equal(makeCheckKey(list.items[1].text), "A1B2C3D4-2");
  });
});
