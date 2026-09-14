import type {
  BusinessDocumentType,
  CardPayerType,
  CashReceiptType,
  MessageType,
  OrchidDeliveryMethod,
  PaymentMethod,
  ProductCategoryId,
} from "@/types/reservation";

/**
 * 신청서 선택지의 "값(코드)"만 모아둔 곳. 화면에 보이는 이름·안내 문구는 언어별 파일(src/i18n/ko.ts 등).
 * 주문 데이터에는 이 코드(또는 한국어)가 그대로 저장된다.
 */

/** 원하는 색감 — 첫 번째가 기본값 */
export const colorOptionIds = ["auto", "bright", "anniversary", "pink", "warm", "soft", "other"] as const;
export type ColorOptionId = (typeof colorOptionIds)[number];

/** 이 색감을 고르면 직접 입력 칸이 열림 */
export const COLOR_OTHER: ColorOptionId = "other";

export const RIBBON_MAX_LENGTH = 12;
export const BLACKBOARD_MAX_LENGTH = 40;

/** 상품 종류별 메시지 방식 — 첫 번째가 기본값. 하나뿐이면 고르는 칸 없이 고정 */
export const messageOptionsByCategory: Record<ProductCategoryId, MessageType[]> = {
  bouquet: ["none", "memo"],
  basket: ["none", "ribbon", "blackboard"],
  orchid: ["blackboard"],
};

/** 블랙보드 "직접 입력" 선택값 */
export const BLACKBOARD_CUSTOM = "custom";

export type BlackboardPreset = {
  /** 언어 파일 blackboardPresets의 키 */
  id: "auto" | "thanks" | "luck";
  /** 블랙보드에 실제로 쓸 문구 (한국어). 빈 문자열이면 매장에서 알아서 작성 */
  text: string;
};

/**
 * 상품 종류별 블랙보드 문구 선택지 — 첫 번째가 기본값, 목록 뒤에 "직접 입력"이 붙음.
 * 없는 종류는 바로 직접 입력.
 */
export const blackboardPresetsByCategory: Partial<Record<ProductCategoryId, BlackboardPreset[]>> = {
  orchid: [
    { id: "auto", text: "" },
    { id: "thanks", text: "키워주셔서 감사합니다 앞으로 잘 살겠습니다." },
    { id: "luck", text: "호접난의 꽃말처럼 행운이 날아오길 바라며 행복하게 잘 살겠습니다." },
  ],
};

/** 저장된 선택지 id로 블랙보드 문구 선택지 찾기 (직접 입력·없는 id면 undefined) */
export function findBlackboardPreset(category: ProductCategoryId, presetId: string) {
  return blackboardPresetsByCategory[category]?.find((preset) => preset.id === presetId);
}

/**
 * 연락처 형식 — 국내(010-1234-5678, 01012345678) 또는 해외(+1 415 555 0100, +82 10-1234-5678).
 * input pattern 속성용
 */
export const PHONE_PATTERN = "0\\d{1,2}-?\\d{3,4}-?\\d{4}|\\+\\d[\\d\\s-]{6,18}\\d";

/** 사업자등록번호 형식 (예: 123-45-67890, 1234567890) */
export const BUSINESS_NUMBER_PATTERN = "\\d{3}-?\\d{2}-?\\d{5}";

/** 결제 방법 — 첫 번째가 기본값. label은 서류·관리자 화면용 한국어 이름 */
export const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "bank", label: "계좌이체" },
  { value: "card", label: "카드 결제" },
  { value: "paypal", label: "PayPal" },
];

/** PayPal(해외 결제) 수수료 — 상품 금액에 더함 */
export const PAYPAL_FEE_RATE = 0.1;

/** 카드 결제하실 분 연락처 — 첫 번째가 기본값 */
export const cardPayerTypes: CardPayerType[] = ["same", "other"];

/** 요청할 수 있는 서류 — 체크하면 둘 다 선택된 상태로 시작. label은 서류 제목(한국어) */
export const documentOptions: { value: BusinessDocumentType; label: string }[] = [
  { value: "quote", label: "견적서" },
  { value: "statement", label: "거래명세표" },
];

export type CashReceiptOption = {
  value: CashReceiptType;
  /** 번호 입력칸 (신청 안 함이면 없음) */
  input?: {
    pattern: string;
    inputMode: "tel" | "numeric";
  };
};

/** 현금영수증 — 계좌이체일 때만. 첫 번째가 기본값 */
export const cashReceiptOptions: CashReceiptOption[] = [
  { value: "none" },
  { value: "income", input: { pattern: PHONE_PATTERN, inputMode: "tel" } },
  { value: "expense", input: { pattern: BUSINESS_NUMBER_PATTERN, inputMode: "numeric" } },
];

/** 호접난 받는 방법 — 첫 번째가 기본값 */
export const orchidDeliveryMethods: OrchidDeliveryMethod[] = ["pickup", "restaurant"];

/** 호접난 무료 배송 상견례 식당 — 값은 저장되는 한국어 식당 이름 (외국어 표기는 언어 파일 restaurants) */
export const orchidRestaurants = ["호남각", "궁", "고궁담"] as const;

/** 식당 목록에 없을 때 고르는 값 → 직접 입력 칸이 열림 */
export const RESTAURANT_OTHER = "other";

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
