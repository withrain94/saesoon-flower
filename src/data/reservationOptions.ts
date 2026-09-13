import type {
  BusinessDocumentType,
  CardPayerType,
  CashReceiptType,
  MessageType,
  PaymentMethod,
  ProductCategoryId,
} from "@/types/reservation";

export const colorOptions = [
  "알아서",
  "화사하게",
  "기념일에 어울리게",
  "핑크톤",
  "따듯한계열",
  "은은한 색감",
  "기타",
];

/** 이 색감을 고르면 직접 입력 칸이 열림 */
export const COLOR_OTHER = "기타";

export const RIBBON_MAX_LENGTH = 12;
export const BLACKBOARD_MAX_LENGTH = 40;

export const MESSAGE_GUIDE =
  "꽃다발은 인쇄된 메모지 부착, 꽃바구니는 리본글씨 또는 블랙보드, 호접난은 블랙보드로 가능해요.";

export type MessageOption = { value: MessageType; label: string };

const NO_MESSAGE: MessageOption = { value: "none", label: "없음" };

const BLACKBOARD: MessageOption = {
  value: "blackboard",
  label: `블랙보드 칠판 (띄어쓰기 포함 ${BLACKBOARD_MAX_LENGTH}자 이내)`,
};

/** 상품 종류별 메시지 방식 — 첫 번째가 기본값. 하나뿐이면 고르는 칸 없이 고정 */
export const messageOptionsByCategory: Record<ProductCategoryId, MessageOption[]> = {
  bouquet: [NO_MESSAGE, { value: "memo", label: "인쇄된 메모지 부착" }],
  basket: [
    NO_MESSAGE,
    { value: "ribbon", label: `리본글씨 (양쪽 문구, 한 쪽에 ${RIBBON_MAX_LENGTH}자 내외)` },
    BLACKBOARD,
  ],
  orchid: [BLACKBOARD],
};

/** 블랙보드 "직접 입력" 선택값 */
export const BLACKBOARD_CUSTOM = "custom";

export type BlackboardPreset = {
  id: string;
  label: string;
  /** 블랙보드에 쓸 문구. 빈 문자열이면 매장에서 알아서 작성 */
  text: string;
};

/**
 * 상품 종류별 블랙보드 문구 선택지 — 첫 번째가 기본값, 목록 뒤에 "직접 입력"이 붙음.
 * 없는 종류는 바로 직접 입력.
 */
export const blackboardPresetsByCategory: Partial<Record<ProductCategoryId, BlackboardPreset[]>> = {
  orchid: [
    { id: "auto", label: "알아서 써주세요", text: "" },
    {
      id: "thanks",
      label: "키워주셔서 감사합니다 앞으로 잘 살겠습니다.",
      text: "키워주셔서 감사합니다 앞으로 잘 살겠습니다.",
    },
    {
      id: "luck",
      label: "호접난의 꽃말처럼 행운이 날아오길 바라며 행복하게 잘 살겠습니다.",
      text: "호접난의 꽃말처럼 행운이 날아오길 바라며 행복하게 잘 살겠습니다.",
    },
  ],
};

/** 연락처 형식 (예: 010-1234-5678, 01012345678) — input pattern 속성용 */
export const PHONE_PATTERN = "0\\d{1,2}-?\\d{3,4}-?\\d{4}";

/** 사업자등록번호 형식 (예: 123-45-67890, 1234567890) */
export const BUSINESS_NUMBER_PATTERN = "\\d{3}-?\\d{2}-?\\d{5}";

export type PaymentMethodOption = {
  value: PaymentMethod;
  label: string;
  /** 결제 방법 버튼 아래 한 줄 설명 */
  description: string;
  /** 완료 화면 안내 문구 */
  completeMessage: string;
};

/** 결제 방법 — 첫 번째가 기본값 */
export const paymentMethodOptions: PaymentMethodOption[] = [
  {
    value: "bank",
    label: "계좌이체",
    description: "입금 확인 후 완료",
    completeMessage: "입금이 되어야 예약이 완료됩니다.",
  },
  {
    value: "card",
    label: "카드 결제",
    description: "전화로 카드번호 전달",
    completeMessage:
      "매장에서 연락드리면 카드번호와 유효기간을 알려주세요. 결제가 되어야 예약이 완료됩니다.",
  },
];

/** 첫 화면 네이버 예약 안내 — 신청서를 쓰기 전에 네이버로 갈 사람을 나눔 */
export const NAVER_BOOKING_GUIDE = {
  title: "네이버페이로 결제하실 건가요?",
  description: "신청서 없이 네이버 예약에서 바로 예약해요.",
  /** 신청서 결제 방법 아래 작은 안내 */
  paymentNote: "네이버페이 결제는 네이버 예약에서 따로 예약해 주세요.",
};

/** 카드 결제 안내 — 카드번호는 신청서로 받지 않음 */
export const CARD_PAYMENT_GUIDE = [
  "예약 확인 후 매장에서 연락드려요.",
  "통화로 카드번호와 유효기간을 알려주시면 결제해 드려요.",
  "카드번호는 이 신청서에 적지 마세요.",
];

/** 카드 결제하실 분 연락처 — 첫 번째가 기본값 */
export const cardPayerOptions: { value: CardPayerType; label: string }[] = [
  { value: "same", label: "예약자와 동일합니다" },
  { value: "other", label: "예약자와 다릅니다" },
];

export const CARD_PAYER_GUIDE = {
  title: "카드 결제하실 분 연락처",
  description: "예약자 연락처와 카드 결제하실 분의 연락처가 다르면 아래에 적어주세요.",
  placeholder: "결제하실 분 성함과 연락처 (예: 김결제 010-1234-5678)",
};

/** 요청할 수 있는 서류 — 체크하면 둘 다 선택된 상태로 시작 */
export const documentOptions: { value: BusinessDocumentType; label: string }[] = [
  { value: "quote", label: "견적서" },
  { value: "statement", label: "거래명세표" },
];

export const DOCUMENT_GUIDE = {
  toggle: "견적서·거래명세표가 필요해요",
  description: "회사·기관 행사 등 증빙이 필요하면 체크해 주세요. 신청하면 바로 만들어 드려요.",
  emailPlaceholder: "서류 받을 이메일 (예: name@company.com)",
  companyPlaceholder: "상호·기관명 (공급받는 자)",
  businessNumberPlaceholder: "사업자등록번호 (선택) 000-00-00000",
};

export type CashReceiptOption = {
  value: CashReceiptType;
  label: string;
  /** 번호 입력칸 (신청 안 함이면 없음) */
  input?: {
    placeholder: string;
    pattern: string;
    title: string;
    inputMode: "tel" | "numeric";
  };
};

/** 현금영수증 — 계좌이체일 때만. 첫 번째가 기본값 */
export const cashReceiptOptions: CashReceiptOption[] = [
  { value: "none", label: "신청 안 함" },
  {
    value: "income",
    label: "소득공제",
    input: {
      placeholder: "휴대폰 번호 010-0000-0000",
      pattern: PHONE_PATTERN,
      title: "휴대폰 번호를 확인해 주세요. (예: 010-1234-5678)",
      inputMode: "tel",
    },
  },
  {
    value: "expense",
    label: "지출증빙",
    input: {
      placeholder: "사업자등록번호 000-00-00000",
      pattern: BUSINESS_NUMBER_PATTERN,
      title: "사업자등록번호 10자리를 확인해 주세요. (예: 123-45-67890)",
      inputMode: "numeric",
    },
  },
];

/** 오늘 기준 몇 달 뒤까지 예약 가능한지 */
export const MAX_MONTHS_AHEAD = 3;

export const morningSlots = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"];

export const afternoonSlots = [
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
];

export const allSlots = [...morningSlots, ...afternoonSlots];

/** 당일 예약은 받는 시간 기준 몇 시간 전까지 가능한지 */
export const SAME_DAY_LEAD_HOURS = 2;

/**
 * 예약 마감 — 매일 ORDER_CLOSE_HOUR시가 되면 다음날 ORDER_OPEN_HOUR시까지(포함) 시간대는 고를 수 없음.
 * (예: 오후 8시에 보면 오늘 남은 시간·내일 9시까지는 막히고, 내일 10시부터 선택 가능)
 */
export const ORDER_CLOSE_HOUR = 17;
export const ORDER_OPEN_HOUR = 9;

/** 상품 한 종류당 최대 수량 (단체 주문은 별도 문의) */
export const MAX_QUANTITY = 20;
