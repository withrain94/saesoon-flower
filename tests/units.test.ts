import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allProducts } from "@/data/products";
import { defaultUnitDetail, getOrderUnits, resolveUnits, type OrdererContact } from "@/lib/units";
import type { Selection, UnitDetail } from "@/types/reservation";

const bouquet = allProducts.find((product) => product.category === "bouquet")!;
const orchid = allProducts.find((product) => product.category === "orchid")!;
const orderer: OrdererContact = { name: "홍길동", phone: "010-1111-2222" };

/** 상품을 담고 칸별 입력값을 넣어 "같음"을 푼 결과 */
function resolve(quantities: Record<string, number>, patch: Record<number, Partial<UnitDetail>> = {}, dateKey: string | null = null) {
  const selection: Selection = { quantities, date: dateKey, time: "12:00" };
  const units = getOrderUnits(selection);
  const details: Record<string, UnitDetail> = {};
  units.forEach((unit, index) => {
    details[unit.key] = { ...defaultUnitDetail(unit.product), ...patch[index] };
  });
  return resolveUnits(units, details, dateKey, orderer);
}

describe("받는 분·메시지 같음 (lib/units)", () => {
  it("두 번째 상품은 기본으로 앞 상품의 받는 분을 따라감", () => {
    const [first, second] = resolve(
      { [bouquet.id]: 2 },
      { 0: { recipient: { name: "김영희", phone: "010-3333-4444", address: "전주시 1" } } },
    );
    assert.equal(first.recipient.name, "김영희");
    assert.equal(second.recipientCopied, true);
    assert.equal(second.recipient.phone, "010-3333-4444");
  });

  it("'앞과 같음'을 끄면 자기 입력값을 씀", () => {
    const [, second] = resolve(
      { [bouquet.id]: 2 },
      {
        0: { recipient: { name: "김영희", phone: "010-3333-4444", address: "전주시 1" } },
        1: { sameRecipient: false, recipient: { name: "박철수", phone: "010-5555-6666", address: "전주시 2" } },
      },
    );
    assert.equal(second.recipient.name, "박철수");
    assert.equal(second.recipient.address, "전주시 2");
  });

  it("'예약자와 같음'이면 예약자 성함·연락처가 들어가고 배송지는 자기 입력값", () => {
    const [first] = resolve(
      { [bouquet.id]: 1 },
      { 0: { sameAsOrderer: true, recipient: { name: "", phone: "", address: "전주시 3" } } },
    );
    assert.equal(first.recipientFromOrderer, true);
    assert.equal(first.recipient.name, orderer.name);
    assert.equal(first.recipient.phone, orderer.phone);
    assert.equal(first.recipient.address, "전주시 3");
  });

  it("메시지 '같음'은 같은 종류끼리만 (꽃다발 메시지가 호접난으로 넘어가지 않음)", () => {
    const units = resolve({ [bouquet.id]: 1, [orchid.id]: 1 });
    const [bouquetUnit, orchidUnit] = units;
    assert.equal(bouquetUnit.canCopyMessage, false);
    assert.equal(orchidUnit.canCopyMessage, false);
    assert.equal(orchidUnit.message.type, "blackboard");
  });

  it("토퍼 칸(보내는 분 이름·팀)은 특별한 날에만", () => {
    const normal = resolve({ [bouquet.id]: 1 }, {}, "2026-11-10");
    assert.equal(normal[0].topperAvailable, false);
    assert.equal(normal[0].topperEvent, null);

    const promotion = resolve({ [bouquet.id]: 1 }, {}, "2026-10-30");
    assert.equal(promotion[0].topperEvent?.kind, "institutePromotion");

    const graduation = resolve({ [bouquet.id]: 1 }, {}, "2026-11-27");
    assert.equal(graduation[0].topperEvent?.kind, "instituteLongCourse");

    // 호접난은 토퍼를 넣지 않음
    const orchidOnEventDay = resolve({ [orchid.id]: 1 }, {}, "2026-10-30");
    assert.equal(orchidOnEventDay[0].topperAvailable, false);
  });
});
