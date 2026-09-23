import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getCustomerCancelOption,
  isSameName,
  isSamePhone,
  maskReceiptNumber,
  normalizeReceiptNumber,
  phoneLastDigits,
} from "@/lib/customerLookup";

describe("손님 예약 조회·취소 규칙 (lib/customerLookup)", () => {
  it("이름은 띄어쓰기·대소문자를 무시하고 비교", () => {
    assert.equal(isSameName("홍 길동", "홍길동"), true);
    assert.equal(isSameName("Hong Gildong", "hong gildong"), true);
    assert.equal(isSameName("홍길동", "김길동"), false);
  });

  it("연락처는 - 와 띄어쓰기를 무시하고 비교", () => {
    assert.equal(isSamePhone("010-1234-5678", "01012345678"), true);
    assert.equal(isSamePhone("+82 10 1234 5678", "+821012345678"), true);
    assert.equal(isSamePhone("010-1234-5678", "010-1234-5679"), false);
  });

  it("해외 번호도 끝 4자리를 찾아냄 (조회 후보 찾기)", () => {
    assert.equal(phoneLastDigits("+1 415 555 0100"), "0100");
    assert.equal(phoneLastDigits("010-1234-5678"), "5678");
  });

  it("접수번호는 대문자로 정리하고, 조회 화면에는 앞 2자리만 보여줌", () => {
    assert.equal(normalizeReceiptNumber(" 5d7bbc7e "), "5D7BBC7E");
    assert.equal(maskReceiptNumber("5D7BBC7E"), "5D••••••");
  });

  it("상태별로 손님이 할 수 있는 일", () => {
    assert.equal(getCustomerCancelOption("received", false), "cancel");
    assert.equal(getCustomerCancelOption("confirmed", false), "request");
    assert.equal(getCustomerCancelOption("made", false), "call");
    assert.equal(getCustomerCancelOption("delivered", false), "call");
    assert.equal(getCustomerCancelOption("canceled", false), "none");
    // 이미 취소 요청을 보낸 예약은 다시 못 보냄
    assert.equal(getCustomerCancelOption("confirmed", true), "requested");
  });
});
