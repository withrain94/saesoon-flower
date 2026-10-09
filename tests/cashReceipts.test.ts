import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cashReceiptMonthKey, groupCashReceiptsByMonth } from "@/lib/cashReceipts";
import type { StoredReservation } from "@/types/reservation";

const make = (createdAt: string, totalPrice: number, extra: Partial<StoredReservation> = {}) =>
  ({
    id: createdAt,
    createdAt,
    status: "received",
    cashReceiptIssuedAt: null,
    request: { totalPrice },
    ...extra,
  }) as StoredReservation;

describe("현금영수증 달별 모음 (lib/cashReceipts)", () => {
  it("접수 달은 한국 시각 기준 (UTC 9월 30일 밤 = 한국 10월 1일)", () => {
    assert.equal(cashReceiptMonthKey("2026-09-30T15:30:00.000Z"), "2026-10");
    assert.equal(cashReceiptMonthKey("2026-09-30T14:30:00.000Z"), "2026-09");
  });

  it("최근 달부터, 합계·발급 대기는 취소 제외", () => {
    const months = groupCashReceiptsByMonth([
      make("2026-10-05T01:00:00.000Z", 70000),
      make("2026-10-03T01:00:00.000Z", 50000, { cashReceiptIssuedAt: "2026-10-04T01:00:00.000Z" }),
      make("2026-10-02T01:00:00.000Z", 90000, { status: "canceled" }),
      make("2026-09-20T01:00:00.000Z", 60000),
    ]);
    assert.deepEqual(months.map((month) => month.monthKey), ["2026-10", "2026-09"]);
    assert.equal(months[0].reservations.length, 3);
    assert.equal(months[0].totalPrice, 120000);
    assert.equal(months[0].pendingCount, 1);
    assert.equal(months[1].pendingCount, 1);
  });
});
