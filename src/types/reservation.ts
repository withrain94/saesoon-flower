import type { Locale } from "./i18n";

/** 상품 종류 */
export type ProductCategoryId = "bouquet" | "basket" | "orchid";

/** 메시지 방식 — 꽃다발: 없음/메모지, 꽃바구니: 없음/리본글씨/블랙보드, 호접난: 블랙보드 */
export type MessageType = "none" | "memo" | "ribbon" | "blackboard";

/**
 * 이 페이지 신청서의 결제 방법 — 계좌이체 / 카드 결제(전화로 카드번호 전달) / PayPal(해외 결제, 수수료 추가).
 * 네이버 예약은 첫 화면에서 따로 안내
 */
export type PaymentMethod = "bank" | "card" | "paypal";

/** 호접난 받는 방법 — 매장 픽업 / 상견례 식당으로 배송 */
export type OrchidDeliveryMethod = "pickup" | "restaurant";

/** 호접난 받는 방법 (호접난을 담았을 때만) */
export type OrchidDelivery = {
  method: OrchidDeliveryMethod;
  /** 식당 이름 (한국어) — 배송이 아니면 "" */
  restaurant: string;
  /** 식당에 예약된 이름 — 배송이 아니면 "" */
  reservationName: string;
};

/** 현금영수증 — 계좌이체일 때만 */
export type CashReceiptType = "none" | "income" | "expense";

/** 카드 결제하실 분 — 예약자와 동일 / 다름(연락처 직접 입력). 카드 결제일 때만 */
export type CardPayerType = "same" | "other";

/** 요청할 수 있는 증빙 서류 — 견적서 / 거래명세표 */
export type BusinessDocumentType = "quote" | "statement";

/** 화면에서 고르는 항목 (신청서 입력값과 별개로 상태로 관리) */
export type Selection = {
  /** 상품 id("bouquet-60000") → 수량. 0개인 항목은 두지 않음 */
  quantities: Record<string, number>;
  /** "YYYY-MM-DD" */
  date: string | null;
  /** "HH:00" */
  time: string | null;
};

/** 아직 선택되지 않은 항목 */
export type SelectionIssue = "items" | "date" | "time";

/** 받는 분 (비워두면 예약자가 픽업) */
export type Recipient = {
  name: string;
  phone: string;
};

/** 상품 1개에 들어갈 메시지 */
export type UnitMessage = {
  type: MessageType;
  memo: string;
  ribbonLeft: string;
  ribbonRight: string;
  /** 블랙보드 직접 입력 문구 */
  blackboard: string;
  /** 블랙보드 문구 선택지 id (reservationOptions의 blackboardPresetsByCategory) 또는 "custom"(직접 입력) */
  blackboardPreset: string;
};

/** 특별한 날(승진식) 무료 토퍼에 넣을 이름·직급 */
export type Topper = {
  name: string;
  rank: string;
};

/**
 * 상품 1개(수량 단위)별 입력값.
 * same* 가 true면 자기 값 대신 앞 상품의 값을 쓴다.
 */
export type UnitDetail = {
  /** 받는 분이 같으면 토퍼(이름·직급)도 앞 상품을 따름 */
  sameRecipient: boolean;
  recipient: Recipient;
  topper: Topper;
  /** 같은 종류의 앞 상품 메시지를 따름 */
  sameMessage: boolean;
  message: UnitMessage;
};

/** 예약 한 건에 담긴 상품 한 줄 (집계) */
export type ReservationItem = {
  productId: string;
  category: ProductCategoryId;
  price: number;
  quantity: number;
};

/** 상품 1개가 누구에게 어떤 메시지로 가는지 ("같음"이 풀린 최종 값) */
export type ReservationDelivery = {
  productId: string;
  category: ProductCategoryId;
  price: number;
  /** 같은 상품 안에서 몇 번째인지 (1부터) */
  unitNo: number;
  recipientName: string;
  recipientPhone: string;
  /** 승진식 무료 토퍼 — 토퍼가 없는 날·상품이면 "" */
  topperName: string;
  topperRank: string;
} & Omit<UnitMessage, "type"> & { messageType: MessageType };

/**
 * 제출되는 예약 한 건 (여러 종류 상품을 한 번에).
 * 나중에 Supabase에 저장할 때 이 타입을 기준으로 한다.
 */
export type ReservationRequest = {
  items: ReservationItem[];
  /** 상품 1개 단위 받는 분·메시지 */
  deliveries: ReservationDelivery[];
  totalQuantity: number;
  totalPrice: number;
  date: string;
  time: string;
  ordererName: string;
  ordererPhone: string;
  /** 원하는 색감 선택지 id (reservationOptions의 colorOptionIds). 색감을 고르지 않는 주문이면 "" */
  color: string;
  colorOther: string;
  /** 호접난 받는 방법 — 호접난이 없으면 null */
  orchidDelivery: OrchidDelivery | null;
  paymentMethod: PaymentMethod;
  /** PayPal 결제 요청을 받을 이메일 — PayPal이 아니면 "" */
  paypalEmail: string;
  /** PayPal 결제 금액 (상품 금액 + 수수료) — PayPal이 아니면 0 */
  paypalAmount: number;
  /** 계좌이체가 아니면 "none" */
  cashReceiptType: CashReceiptType;
  /** 소득공제: 휴대폰 번호 / 지출증빙: 사업자등록번호 */
  cashReceiptNumber: string;
  /** 카드 결제가 아니면 "same" */
  cardPayer: CardPayerType;
  /** 예약자와 다를 때 적은 결제하실 분 성함·연락처 */
  cardPayerContact: string;
  /** 요청한 서류 (필요 없으면 빈 배열) */
  documents: BusinessDocumentType[];
  /** 서류 받을 이메일 */
  documentEmail: string;
  /** 서류에 적을 공급받는 자 상호·기관명 */
  documentCompany: string;
  /** 공급받는 자 사업자등록번호 (선택) */
  documentBusinessNumber: string;
  /** 제출 시각 (ISO) — 서류 작성일 */
  submittedAt: string;
  /** [필수] 개인정보 수집·이용 동의 */
  privacyAgreed: boolean;
  /** 고객이 신청서를 본 화면 언어 (주문 내용은 한국어·옵션 코드로 저장) */
  locale: Locale;
};

/** 관리자 페이지 예약 진행 상태 */
export type ReservationStatus = "received" | "confirmed" | "made" | "delivered" | "canceled";

/**
 * 손님이 예약 조회 화면에서 취소한 기록.
 * - paid=false: "아직 입금(결제) 안 했어요" → 바로 취소됨 (매장은 실제로 입금이 없는지만 확인)
 * - paid=true: "이미 입금(결제)했어요" 또는 입금 확인된 예약 → 취소 요청, 매장이 환불 후 관리자에서 "취소"로 마무리
 * 환불 계좌는 paid=true + 계좌이체일 때만 (카드·PayPal은 결제 취소로 환불하므로 빈 값)
 */
export type CancelRequest = {
  requestedAt: string;
  /** 손님이 입금(결제)했다고 답했는지 */
  paid: boolean;
  refundBank: string;
  refundAccount: string;
  refundHolder: string;
};

/** DB에 저장된 예약 한 건 */
export type StoredReservation = {
  id: string;
  createdAt: string;
  status: ReservationStatus;
  adminMemo: string;
  request: ReservationRequest;
  /** 손님 취소 요청 — 없으면 null */
  cancelRequest: CancelRequest | null;
};

/** 손님 예약 조회 화면에 보내는 내용 (매장 메모 등 매장 전용 정보는 뺌) */
export type CustomerReservationView = {
  receiptNumber: string;
  status: ReservationStatus;
  /** 취소 요청을 보냈으면 요청 시각 */
  cancelRequestedAt: string | null;
  request: ReservationRequest;
};

/** 신청서 input의 name 목록 (받는 분·메시지는 상태로 관리하므로 제외) */
export type ReservationFormField =
  | "ordererName"
  | "ordererPhone"
  | "color"
  | "colorOther"
  | "orchidDelivery"
  | "orchidRestaurant"
  | "orchidRestaurantOther"
  | "orchidReservationName"
  | "paymentMethod"
  | "paypalEmail"
  | "cashReceiptType"
  | "cashReceiptNumber"
  | "cardPayer"
  | "cardPayerContact"
  | "documents"
  | "documentEmail"
  | "documentCompany"
  | "documentBusinessNumber"
  | "privacyConsent";
