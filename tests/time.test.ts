import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { specialEvents } from "@/data/events";
import { isSlotBookable, toNowInTimeZone } from "@/lib/time";

/** 한국 시각으로 "지금" 만들기 */
const at = (iso: string) => toNowInTimeZone(new Date(`${iso}+09:00`));

describe("예약 가능한 시간 (lib/time)", () => {
  it("같은 날은 받는 시간 2시간 전까지만", () => {
    assert.equal(isSlotBookable("15:00", "2026-11-10", at("2026-11-10T12:59")), true);
    assert.equal(isSlotBookable("15:00", "2026-11-10", at("2026-11-10T13:01")), false);
  });

  it("오늘부터 6주(42일) 뒤까지만 고를 수 있음 (토스페이먼츠 정책)", () => {
    const today = at("2026-11-25T10:00");
    assert.equal(isSlotBookable("15:00", "2027-01-06", today), true);
    assert.equal(isSlotBookable("15:00", "2027-01-07", today), false);
  });

  it("지난 날짜는 고를 수 없음", () => {
    assert.equal(isSlotBookable("15:00", "2026-11-09", at("2026-11-10T09:00")), false);
  });

  it("오후 5시가 지나면 다음날 오전 9시까지는 막히고 10시부터 가능", () => {
    const evening = at("2026-11-10T17:30");
    assert.equal(isSlotBookable("09:00", "2026-11-11", evening), false);
    assert.equal(isSlotBookable("10:00", "2026-11-11", evening), true);
  });

  it("토·일 예약은 전날 오후 5시가 되면 낮 12시까지(포함) 막히고 오후 1시부터 가능", () => {
    // 2026-11-27 금 17시 → 11/28 토
    const friday = at("2026-11-27T17:00");
    assert.equal(isSlotBookable("12:00", "2026-11-28", friday), false);
    assert.equal(isSlotBookable("13:00", "2026-11-28", friday), true);
    // 토 17시 → 일요일도 같음, 토 오전 11시에 보면 같은 날 12시까지 막힘
    assert.equal(isSlotBookable("10:00", "2026-11-29", at("2026-11-28T17:30")), false);
    assert.equal(isSlotBookable("13:00", "2026-11-29", at("2026-11-28T17:30")), true);
    // 일 17시 → 월요일은 평일 규칙(9시까지)
    assert.equal(isSlotBookable("10:00", "2026-11-30", at("2026-11-29T17:30")), true);
    // 금 오후 5시 전이면 토 오전도 가능
    assert.equal(isSlotBookable("08:00", "2026-11-28", at("2026-11-27T16:59")), true);
  });

  it("하루 전체 마감하는 날(12/5)은 전날 오후 5시부터 모든 시간 불가", () => {
    assert.equal(isSlotBookable("18:00", "2026-12-05", at("2026-12-04T16:59")), true);
    assert.equal(isSlotBookable("18:00", "2026-12-05", at("2026-12-04T17:00")), false);
    assert.equal(isSlotBookable("19:00", "2026-12-05", at("2026-12-05T09:00")), false);
    assert.equal(isSlotBookable("13:00", "2026-12-06", at("2026-12-04T17:00")), true);
  });

  it("오후 5시 전에는 다음날 이른 시간도 가능", () => {
    const afternoon = at("2026-11-10T16:30");
    assert.equal(isSlotBookable("08:00", "2026-11-11", afternoon), true);
  });

  it("특별한 날은 그 날 정해진 시간만 (승진식·수료식 오전 8시)", () => {
    const event = specialEvents[0];
    const week = at("2026-09-30T10:00");
    assert.deepEqual(event.slots, ["08:00"]);
    assert.equal(isSlotBookable("08:00", event.date, week), true);
    assert.equal(isSlotBookable("09:00", event.date, week), false);
    assert.equal(isSlotBookable("14:00", event.date, week), false);
  });

  it("특별한 날은 전날 오후 5시에 마감", () => {
    const event = specialEvents.find((candidate) => candidate.date === "2026-10-23");
    assert.ok(event);
    assert.equal(isSlotBookable("08:00", event.date, at("2026-10-22T16:59")), true);
    assert.equal(isSlotBookable("08:00", event.date, at("2026-10-22T17:00")), false);
  });
});
