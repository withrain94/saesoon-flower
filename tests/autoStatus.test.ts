import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldAutoDeliver, statusAfterCompletionPhoto } from "@/lib/autoStatus";
import type { CancelRequest, ReservationRequest, ReservationStatus } from "@/types/reservation";

function reservation(status: ReservationStatus, date: string, cancelRequest: CancelRequest | null = null) {
  return { status, cancelRequest, request: { date } as ReservationRequest };
}

describe("완성 사진 올리면 제작 완료", () => {
  it("입금·결제 확인 → 제작 완료", () => {
    assert.equal(statusAfterCompletionPhoto("confirmed"), "made");
  });
  it("접수(입금 전)·제작 완료·전달 완료·취소는 그대로", () => {
    for (const status of ["received", "made", "delivered", "canceled"] as const) {
      assert.equal(statusAfterCompletionPhoto(status), null, status);
    }
  });
});

describe("받는 날 7일 지나면 전달 완료", () => {
  it("11/20 받는 예약은 11/27부터 (11/26엔 아직)", () => {
    assert.equal(shouldAutoDeliver(reservation("made", "2026-11-20"), "2026-11-26"), false);
    assert.equal(shouldAutoDeliver(reservation("made", "2026-11-20"), "2026-11-27"), true);
    assert.equal(shouldAutoDeliver(reservation("confirmed", "2026-11-20"), "2026-12-05"), true);
  });
  it("달이 바뀌어도 7일로 셈 (11/28 → 12/5)", () => {
    assert.equal(shouldAutoDeliver(reservation("made", "2026-11-28"), "2026-12-04"), false);
    assert.equal(shouldAutoDeliver(reservation("made", "2026-11-28"), "2026-12-05"), true);
  });
  it("접수(입금 전)·전달 완료·취소는 바꾸지 않음", () => {
    for (const status of ["received", "delivered", "canceled"] as const) {
      assert.equal(shouldAutoDeliver(reservation(status, "2026-11-01"), "2026-11-27"), false, status);
    }
  });
  it("손님 취소 요청 중이면 바꾸지 않음", () => {
    const cancel = { requestedAt: "2026-11-19T10:00:00+09:00" } as unknown as CancelRequest;
    assert.equal(shouldAutoDeliver(reservation("confirmed", "2026-11-01", cancel), "2026-11-27"), false);
  });
});
