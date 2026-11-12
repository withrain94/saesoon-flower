import { businessInfo } from "@/data/shop";

/**
 * 취소·환불 정책 (/refund 페이지, 한국어). 결제 회사(토스페이먼츠) 심사에도 이 주소를 냄.
 * 손님 조회 화면의 실제 취소 규칙은 lib/customerLookup.ts 의 getCustomerCancelOption — 규칙을 바꾸면 여기도 같이 바꾼다.
 */
export const REFUND_EFFECTIVE_DATE = "2026년 11월 13일";

export const refundPolicySections: { title: string; paragraphs: string[] }[] = [
  {
    title: "1. 예약 취소 방법",
    paragraphs: [
      "예약 페이지 위쪽의 [예약 조회]에서 예약자 성함과 연락처로 예약을 찾은 뒤 취소하거나 취소를 요청할 수 있습니다.",
      `조회 화면에서 처리하기 어려운 경우 매장 전화(${businessInfo.phone})로 연락해 주세요.`,
    ],
  },
  {
    title: "2. 입금·결제 전",
    paragraphs: ["입금·결제 전 예약은 언제든지 바로 취소할 수 있으며, 비용이 발생하지 않습니다."],
  },
  {
    title: "3. 입금·결제 후, 상품 제작 전",
    paragraphs: [
      "입금·결제를 마친 뒤 상품 제작 전에 취소를 요청하시면 결제 금액 전액을 환불해 드립니다.",
      "계좌이체: 취소 요청 때 적어 주신 환불 계좌로 돌려드립니다.",
      "카드 결제: 카드 승인을 취소합니다. 카드사에 따라 실제 반영까지 영업일 기준 3~7일이 걸릴 수 있습니다.",
      "PayPal: PayPal을 통해 환불합니다.",
      "환불은 취소가 확인된 날부터 영업일 기준 3일 이내에 처리합니다.",
    ],
  },
  {
    title: "4. 상품 제작 후",
    paragraphs: [
      "꽃다발·꽃바구니·호접난은 주문에 맞춰 생화로 제작하는 상품이라, 제작이 끝난 뒤에는 다시 판매할 수 없습니다. 이 경우 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항에 따라 단순 변심에 의한 취소·환불이 제한됩니다.",
      "부득이한 사정이 있으면 매장 전화로 먼저 상의해 주세요.",
    ],
  },
  {
    title: "5. 상품에 문제가 있는 경우",
    paragraphs: [
      "받으신 상품이 주문 내용과 다르거나 운반 중 훼손된 경우, 받은 날 사진과 함께 매장으로 연락해 주세요. 확인 후 다시 제작하거나 환불해 드립니다.",
      "생화는 계절과 입고 상황에 따라 꽃 종류·색감이 사진과 조금 다를 수 있으며, 이는 교환·환불 사유에 해당하지 않습니다.",
    ],
  },
  {
    title: "6. 문의",
    paragraphs: [
      `상호: ${businessInfo.tradeName} · 대표: ${businessInfo.representative} · 사업자등록번호: ${businessInfo.businessNumber}`,
      `주소: ${businessInfo.address}`,
      `전화: ${businessInfo.phone}`,
    ],
  },
];
