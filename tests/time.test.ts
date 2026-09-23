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

  it("지난 날짜는 고를 수 없음", () => {
    assert.equal(isSlotBookable("15:00", "2026-11-09", at("2026-11-10T09:00")), false);
  });

  it("오후 5시가 지나면 다음날 오전 9시까지는 막히고 10시부터 가능", () => {
    const evening = at("2026-11-10T17:30");
    assert.equal(isSlotBookable("09:00", "2026-11-11", evening), false);
    assert.equal(isSlotBookable("10:00", "2026-11-11", evening), true);
  });

  it("오후 5시 전에는 다음날 이른 시간도 가능", () => {
    const afternoon = at("2026-11-10T16:30");
    assert.equal(isSlotBookable("08:00", "2026-11-11", afternoon), true);
  });

  it("특별한 날은 그 날 정해진 시간만 (승진식·수료식 오전 8·9시)", () => {
    const event = specialEvents[0];
    const week = at("2026-09-30T10:00");
    assert.deepEqual(event.slots, ["08:00", "09:00"]);
    assert.equal(isSlotBookable("09:00", event.date, week), true);
    assert.equal(isSlotBookable("14:00", event.date, week), false);
  });

  it("특별한 날은 전날 오후 5시에 마감", () => {
    const event = specialEvents.find((candidate) => candidate.date === "2026-10-30");
    assert.ok(event);
    assert.equal(isSlotBookable("08:00", event.date, at("2026-10-29T16:59")), true);
    assert.equal(isSlotBookable("08:00", event.date, at("2026-10-29T17:00")), false);
  });
});
