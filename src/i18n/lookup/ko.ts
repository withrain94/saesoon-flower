import { businessInfo } from "@/data/shop";
import type { ReservationStatus } from "@/types/reservation";

/**
 * 손님 예약 조회·취소 화면 문구 (한국어) — 다른 언어 파일은 이 모양과 같아야 한다.
 * 신청서 공통 문구(상품 이름·날짜 형식·결제 방법 등)는 i18n/ko.ts 를 같이 씀.
 */
export const lookupKo = {
  pageTitle: "예약 조회",
  intro: "신청 완료 화면의 접수번호와 예약자 연락처를 넣으면 예약 내용을 볼 수 있어요.",
  receiptLabel: "접수번호",
  receiptPlaceholder: "예: 5D7BBC7E",
  phoneLabel: "예약자 연락처",
  phonePlaceholder: "신청할 때 적은 연락처",
  submit: "조회하기",
  searching: "찾는 중…",
  backToReservation: "‹ 예약 페이지로",
  lookupLink: "예약 조회·취소",
  completeLookup: "예약 조회·취소 화면 열기",
  completeLookupNote: "접수번호와 연락처로 언제든 다시 확인할 수 있어요.",
  otherReservation: "다른 예약 조회",

  errors: {
    notFound: "접수번호와 연락처가 맞는 예약을 찾지 못했어요. 다시 확인해 주세요.",
    unavailable: `지금은 온라인 조회를 할 수 없어요. 전화(${businessInfo.phone})로 문의해 주세요.`,
    notCancelable: `지금 상태에서는 온라인으로 취소할 수 없어요. 전화(${businessInfo.phone})로 문의해 주세요.`,
    invalidRefund: "환불받을 은행명·계좌번호·예금주를 모두 정확히 적어주세요.",
    failed: `처리하지 못했어요. 잠시 후 다시 시도하거나 전화(${businessInfo.phone})로 문의해 주세요.`,
  },

  status: {
    received: "접수됨 · 입금(결제) 확인 전",
    confirmed: "입금·결제 확인됨",
    made: "제작 완료",
    delivered: "전달 완료",
    canceled: "취소됨",
  } satisfies Record<ReservationStatus, string>,
  cancelRequested: "취소 요청 접수됨 · 매장 확인 중",

  sections: {
    schedule: "받는 날짜·시간",
    items: "상품",
    total: (quantity: number) => `합계 ${quantity}개`,
    deliveries: "받는 분·메시지",
    payment: "결제",
  },

  cancel: {
    title: "예약 취소",
    open: "예약 취소하기",
    close: "취소하지 않기",
    /** 결제 방법별로 묻기 (입금 전 예약) */
    paidQuestion: { bank: "입금하셨나요?", card: "카드 결제를 하셨나요?", paypal: "PayPal 결제를 하셨나요?" },
    notPaid: { bank: "아직 입금하지 않았어요", card: "아직 카드 결제하지 않았어요", paypal: "아직 PayPal 결제하지 않았어요" },
    paid: { bank: "이미 입금했어요", card: "이미 카드 결제했어요", paypal: "이미 PayPal 결제했어요" },
    notPaidHint: "바로 취소돼요.",
    paidHint: "취소 요청으로 접수되고, 매장에서 확인 후 환불해 드려요.",
    /** 입금·결제 확인된 예약 — 묻지 않고 안내만 */
    confirmedNote: { bank: "매장에서 입금 확인이 끝난 예약이에요. 취소 요청으로 접수돼요.", card: "매장에서 카드 결제 확인이 끝난 예약이에요. 취소 요청으로 접수돼요.", paypal: "매장에서 PayPal 결제 확인이 끝난 예약이에요. 취소 요청으로 접수돼요." },
    refundTitle: "환불받을 계좌",
    refundBank: "은행명",
    refundBankPlaceholder: "예: 농협, 국민은행",
    refundAccount: "계좌번호",
    refundAccountPlaceholder: "숫자만 또는 - 포함",
    refundHolder: "예금주",
    refundHolderPlaceholder: "통장에 적힌 이름",
    refundWarning: "실제로 입금하신 분의 이름·계좌와 다르면 환불 처리가 어려울 수 있어요.",
    refundPrivacy: "환불을 위해 은행명·계좌번호·예금주를 받아요. 개인정보 처리방침에 따라 보관 후 파기해요.",
    cardRefund: "카드 결제는 매장에서 결제를 취소해 드려요.",
    paypalRefund: "PayPal 결제는 PayPal로 환불해 드려요.",
    submitCancel: "예약 취소하기",
    submitRequest: "취소 요청 보내기",
    sending: "보내는 중…",
    canceledDone: "예약을 취소했어요.",
    requestedDone: "취소 요청을 보냈어요. 매장에서 확인 후 환불해 드릴게요.",
    requestedInfo: "취소 요청을 받았어요. 매장에서 확인 후 환불해 드릴게요.",
    callInfo: "꽃 제작이 시작되어 온라인으로 취소할 수 없어요. 전화로 문의해 주세요.",
    call: `전화하기 ${businessInfo.phone}`,
  },
};

export type LookupMessages = typeof lookupKo;
