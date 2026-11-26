import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildStoreReservationRequest, emptyStoreDraft, parseStoreBookings, parseStoreDate } from "@/lib/storeBooking";

const TODAY = "2026-11-26";
const build = (draft: Parameters<typeof buildStoreReservationRequest>[0]) =>
  buildStoreReservationRequest(draft, "2026-11-26T15:00:00+09:00");

describe("매장 예약 넣기 (lib/storeBooking)", () => {
  it("노션 표 줄 2개(같은 예약자·날짜) → 한 예약, 받는 분·수료 과정은 줄마다", () => {
    const text =
      "폰 예약\t50,000원\t2026. 11. 27.(금)\t춘천 애인들\t01063778488\t정해숙\t01053746451\t\t꽃다발\t\t지방자치인재개발원 고위정책과정\n" +
      "폰예약\t50,000원\t2026. 11. 27.(금)\t춘천 애인들\t01063778488\t유현주\t01071517357\t\t꽃다발\t\t고급리더과정";
    const drafts = parseStoreBookings(text, TODAY);
    assert.equal(drafts.length, 1);
    const [draft] = drafts;
    assert.equal(draft.ordererName, "춘천 애인들");
    assert.equal(draft.time, "08:00");
    assert.equal(draft.receiveMethod, "delivery");
    assert.deepEqual(draft.recipients.map((r) => r.name), ["정해숙", "유현주"]);
    const built = build(draft);
    assert.ok(built.ok);
    assert.equal(built.request.totalPrice, 100000);
    assert.deepEqual(built.request.deliveries.map((d) => d.topperCourse), ["지방자치인재개발원 고위정책과정", "고급리더과정"]);
    assert.deepEqual(built.request.deliveries.map((d) => d.topperSender), ["춘천 애인들", "춘천 애인들"]);
  });

  it("카톡 주문 글 → 예약자·상품·쇼핑백·받는 분·보내는 분·메시지·입금 완료", () => {
    const [draft] = parseStoreBookings(
      `주문자: 원미옥 010-2464-6374
꽃다발 6만원 + 쇼핑백 2천원
받는분: 한순옥 국장님 010-3679-2735
2026.11.27(금) 지방자치인재개발원 장기과정 수료식, 고위정책과정
보내는 분: 원미옥 드림
메시지: 교육수료 축하드립니다
입금 완료`,
      TODAY,
    );
    assert.equal(draft.ordererName, "원미옥");
    assert.equal(draft.ordererPhone, "010-2464-6374");
    assert.deepEqual(draft.items, [{ productId: "bouquet-60000", quantity: 1 }]);
    assert.equal(draft.shoppingBags, 1);
    assert.equal(draft.recipients[0].phone, "010-3679-2735");
    assert.equal(draft.recipients[0].course, "고위정책과정");
    assert.equal(draft.sender, "원미옥 드림");
    assert.equal(draft.message, "교육수료 축하드립니다");
    assert.equal(draft.paid, true);
    const built = build(draft);
    assert.ok(built.ok);
    assert.equal(built.request.totalPrice, 62000);
  });

  it("이름표 없는 짧은 글 — 연락처 앞 이름, 월/일, 오후 시각, 수량, 카드, 픽업", () => {
    const [draft] = parseStoreBookings("12/5 오후 3시 픽업\n김철수 010-1234-5678\n꽃바구니 10만원 2개\n카드결제", TODAY);
    assert.equal(draft.ordererName, "김철수");
    assert.equal(draft.date, "2026-12-05");
    assert.equal(draft.time, "15:00");
    assert.deepEqual(draft.items, [{ productId: "basket-100000", quantity: 2 }]);
    assert.equal(draft.receiveMethod, "pickup");
    assert.equal(draft.paymentMethod, "card");
    assert.equal(draft.paid, false);
  });

  it("지난 월/일은 내년으로", () => {
    assert.equal(parseStoreDate("1/10", TODAY), "2027-01-10");
  });

  it("빈 칸·잘못된 값은 저장 안 됨", () => {
    assert.equal(build(emptyStoreDraft()).ok, false);
    const draft = { ...emptyStoreDraft(), ordererName: "홍길동", ordererPhone: "010-1111-2222", date: "2026-12-05", time: "15:00" };
    assert.equal(build(draft).ok, false); // 상품 없음
    const ok = build({ ...draft, items: [{ productId: "bouquet-80000", quantity: 1 }] });
    assert.ok(ok.ok);
    assert.equal(ok.request.paymentMethod, "bank");
    assert.equal(build({ ...draft, items: [{ productId: "bouquet-80000", quantity: 1 }], receiveMethod: "delivery" }).ok, false); // 배송지 없음
  });
});
