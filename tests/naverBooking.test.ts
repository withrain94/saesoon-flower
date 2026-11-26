import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { describePayment } from "@/lib/adminFormat";
import { planAutoSms } from "@/lib/autoSms";
import { buildNaverReservationRequest, parseNaverBooking } from "@/lib/naverBooking";

// 네이버 예약 상세 화면을 복사한 글 모양 (이름·번호는 가짜)
const basketText = `예약자\t홍길동
전화번호\t010-1111-2222
예약번호\t1400000001
예약유형\t일반
예약내역
상품\t플라워바스켓(꽃바구니):7만원부터~
이용일시\t2026. 11. 27.(금) 오전 7:00
옵션\t
BEST)이벤트형 꽃바구니 2
요청사항\t리본: 수료를 축하합니다 (010-1111-2222)
유입경로\t네이버 지도
예약자입력정보
보내는분은 누구인가요?(성함 또는 팀 이름. 받는분께 전달시에 반드시 필요합니다.)
총무과 일동
원하는 색상(불가능한 색상의 경우 따로 연락 드립니다)
화사한 파스텔
배송정보:받는분 성함,연락처,주소 /// 무료배송 기준: 인재개발원 5만원 이상 무료
받는분: 김수료(010-3333-4444) 주소: 지방자치인재개발원 고급(4급) 과정 수료식
결제정보
결제상태\t결제완료
결제수단\t네이버페이 머니
결제금액\t200,000원
쿠폰적용금액\t-5,000원
실결제금액\t195,000원`;

const bouquetText = `예약자\t이꽃님
전화번호\t010-5555-6666
예약번호\t1400000002
상품\t꽃다발(5만원~,그 이하:단체꽃은 문의
이용일시\t2026. 12. 2.(수) 오후 3:00
옵션\t
쇼핑백 1
TOP5)사이즈보다 퀄리티 1
요청사항\t
결제정보
결제수단\t신용카드 간편결제
결제금액\t72,000원`;

describe("네이버 예약 글 읽기", () => {
  it("꽃바구니·배송·받는 분·토퍼·수료 과정·실결제 금액", () => {
    const draft = parseNaverBooking(basketText);
    assert.equal(draft.bookingNumber, "1400000001");
    assert.equal(draft.ordererName, "홍길동");
    assert.equal(draft.date, "2026-11-27");
    assert.equal(draft.time, "07:00");
    assert.deepEqual(draft.items, [{ productId: "basket-100000", quantity: 2, label: "BEST)이벤트형 꽃바구니" }]);
    assert.equal(draft.receiveMethod, "delivery");
    assert.equal(draft.recipientName, "김수료");
    assert.equal(draft.recipientPhone, "010-3333-4444");
    assert.equal(draft.recipientAddress, "지방자치인재개발원 고급(4급) 과정 수료식");
    assert.equal(draft.sender, "총무과 일동");
    assert.equal(draft.course, "고급(4급) 과정");
    assert.equal(draft.forEvent, true);
    assert.equal(draft.colorNote, "화사한 파스텔");
    assert.equal(draft.paidAmount, 195000);
  });
  it("꽃다발 + 쇼핑백, 오후 시간, 픽업", () => {
    const draft = parseNaverBooking(bouquetText);
    assert.equal(draft.time, "15:00");
    assert.equal(draft.shoppingBags, 1);
    assert.deepEqual(draft.items.map((item) => item.productId), ["bouquet-70000"]);
    assert.equal(draft.receiveMethod, "pickup");
    assert.equal(draft.forEvent, false);
    assert.equal(draft.paidAmount, 72000);
  });
});

describe("네이버 예약 저장 모양", () => {
  it("상품 1개마다 받는 분·토퍼·요청사항, 결제는 네이버로 표시, 자동 문자 없음", () => {
    const built = buildNaverReservationRequest(parseNaverBooking(basketText), "2026-11-26T00:00:00.000Z");
    assert.ok(built.ok);
    const { request } = built;
    assert.equal(request.totalPrice, 200000);
    assert.equal(request.deliveries.length, 2);
    assert.equal(request.deliveries[1].topperSender, "총무과 일동");
    assert.equal(request.deliveries[1].topperCourse, "고급(4급) 과정");
    assert.match(request.deliveries[0].memo, /^\[네이버 요청사항\] 리본/);
    assert.equal(request.naver?.paidAmount, 195000);
    assert.match(describePayment(request), /^네이버 예약 · 네이버페이 머니 195,000원 결제완료/);
    const reservation = {
      id: "00000000-0000-0000-0000-000000000000",
      createdAt: "2026-11-26T00:00:00.000Z",
      updatedAt: "2026-11-26T00:00:00.000Z",
      status: "confirmed" as const,
      request,
      reminderSentAt: null,
    };
    assert.deepEqual(planAutoSms(reservation), []);
  });
  it("토퍼 없는 날은 보내는 분을 메시지 앞에, 쇼핑백은 합계에", () => {
    const draft = { ...parseNaverBooking(bouquetText), sender: "친구들" };
    const built = buildNaverReservationRequest(draft, "2026-11-26T00:00:00.000Z");
    assert.ok(built.ok);
    assert.equal(built.request.totalPrice, 72000);
    assert.equal(built.request.chocolates[0].chocolateId, "shoppingbag");
    assert.equal(built.request.deliveries[0].memo, "[네이버 요청사항] 보내는 분: 친구들");
  });
  it("상품을 못 찾았거나 배송지가 없으면 저장 안 됨", () => {
    const draft = parseNaverBooking(basketText);
    const noProduct = buildNaverReservationRequest({ ...draft, items: [{ productId: "", quantity: 1, label: "화분" }] }, "x");
    assert.equal(noProduct.ok, false);
    const noAddress = buildNaverReservationRequest({ ...draft, recipientAddress: "" }, "x");
    assert.equal(noAddress.ok, false);
  });
});
