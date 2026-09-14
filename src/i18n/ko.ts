import type { ProductId } from "@/data/products";
import { businessInfo } from "@/data/shop";
import {
  BLACKBOARD_MAX_LENGTH,
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  RIBBON_MAX_LENGTH,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import type { ProductCategoryId } from "@/types/reservation";
import type { CategoryCopy, EventCopy, ProductCopy } from "./types";

/**
 * 한국어 화면 문구 — 기준 언어. 다른 언어 파일(en/ja/zh/vi)은 이 파일과 같은 모양이어야 하며,
 * 빠진 문구가 있으면 타입 오류로 알려준다. 문구를 바꿀 땐 모든 언어 파일을 함께 바꾼다.
 */

const hour12 = (hour: number) => (hour > 12 ? hour - 12 : hour);
const period = (hour: number) => (hour < 12 ? "오전" : "오후");
const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

const categories: Record<ProductCategoryId, CategoryCopy> = {
  bouquet: { name: "꽃다발", tagline: "손에 들고 전하는 선물" },
  basket: { name: "꽃바구니", tagline: "놓아두고 오래 보는 선물" },
  orchid: {
    name: "호접난",
    tagline: "상견례 첫인사 보자기 선물",
    popularNote: "2개 1세트 · 양가에 하나씩 준비해 드려요",
    notice: {
      summary: [
        "품종은 고를 수 없어요. 시즌마다 들어오는 품종이 달라요.",
        "색상은 흰색으로 준비해 드려요.",
        "보자기 색은 보자기 아트 1급 전문가가 난에 맞춰 골라 직접 포장해요.",
      ],
      full: [
        "!품종 지정이 불가능한 점 양해 부탁드립니다!",
        "호접난은\n매 시즌마다 들어오는 품종이 다르고,",
        "같은 색상이라도\n잎의 배치, 꽃망울의 개수, 톤이 조금씩 다릅니다.",
        "그래서 저희는\n공산품처럼 똑같은 꽃이 아닌\n우리 커플만의 고유한 호접난으로\n보내드리는 걸 추구해요.",
        "다만! 색상은 흰색으로 고정 가능합니다.",
        "신부처럼 맑고 단정한 인상을 주는\n흰색 호접난을 요청하시면\n그에 맞는 최상의 품질의 난으로\n정성껏 준비해드립니다.",
        "저희 새순에서는\n플로리스트이자\n보자기 아트 1급 자격증 보유 전문가가\n직접 꽃을 포장합니다.",
        "보자기 컬러 선정은\n-흰 호접난의 색감\n-꽃대의 길이\n-잎의 퍼짐\n등을 고려해,\n매번 가장 어울리는\n감성 컬러 보자기로 준비해드려요.",
      ],
    },
  },
};

const products: Record<ProductId, ProductCopy> = {
  "bouquet-50000": {
    title: "TOP3) 작지만 예쁜꽃으로",
    points: [
      "작아도 괜찮은데, 예쁜 메인 꽃이 주로 들어가면 좋겠어요.",
      "부담스럽지 않은 사이즈로 선물하고 싶어요.",
      "간편하게 이동하고 싶어요.",
    ],
  },
  "bouquet-60000": {
    title: "BEST) 꽃다발다운 꽃다발",
    points: [
      "너무 크지는 않아도 되는데 받았을 때 기분 좋은 꽃다발을 선물하고 싶어요.",
      "기념일을 예쁘게 기억하고 싶어요.",
      "가장 잘나가는 사이즈로 해주세요.",
    ],
  },
  "bouquet-70000": {
    title: "[퀄리티중심] 사이즈보다 퀄리티",
    points: [
      "가장 잘나가는 사이즈에 예쁜 꽃 더 추가해주세요.",
      "사이즈보다 퀄리티가 중요해요.",
      "너무 작지 않았으면 좋겠어요.",
    ],
  },
  "bouquet-80000": {
    title: "TOP5) 조금 더 풍성하게",
    points: [
      "풍성한 느낌으로 하고 싶어요.",
      "받았을 때 기분좋은 느낌을 주고 싶어요.",
      "저번보다 더 신경쓰고 싶어요.",
    ],
  },
  "bouquet-90000": {
    title: "[기념일] 예쁘고 풍성하게",
    points: [
      "예쁜 꽃으로 풍성하게 하고 싶어요.",
      "메인 꽃을 더 추가하고 싶어요.",
      "꽃을 한아름 안겨주고 싶어요.",
    ],
  },
  "bouquet-100000": {
    title: "TOP2) 중요한 날이에요",
    points: [
      "기념일에 감동 주고 싶어요.",
      "프로포즈에 쓰려고해요.",
      "사이즈보다 퀄리티에 신경써주세요.",
    ],
  },
  "bouquet-150000": {
    title: "TOP4) 대형꽃다발",
    points: [
      "감탄사가 나오는 사이즈였으면 좋겠어요.",
      "예쁜 꽃을 쓰되 풍성한 느낌이 더 있었으면 좋겠어요.",
      "한번쯤 해보고 싶어요.",
    ],
  },
  "bouquet-200000": {
    title: "[이벤트용] 초대형꽃다발",
    points: ["무조건 크게 해주세요.", "초대형 꽃다발 하고 싶어요."],
  },
  "bouquet-300000": {
    title: "[프리미엄] 한아름 스페셜 꽃다발",
    points: [
      "꽃 중의 최고라고 하는 웨딩 꽃들로 만드는 스페셜 꽃다발! (계절 꽃을 활용합니다)",
      "당일 상황에 따라 제작이 어려울 수 있으니, 미리 예약하시는 것을 추천합니다.",
      "무조건 크게, 스페셜한 꽃다발 하고 싶어요.",
      "프로포즈 하려고 해요.",
    ],
  },
  "basket-70000": {
    title: "[일상선물] 베이직 꽃바구니",
    points: ["부담 없이 예쁘게 선물하기 좋은 사이즈", "집들이, 작은 선물, 축하에 잘 어울려요"],
  },
  "basket-80000": {
    title: "TOP2) 베이직 꽃바구니를 풍성하게",
    points: ["베이직 꽃바구니를 풍성하게 또는 특별한 색감으로"],
  },
  "basket-100000": {
    title: "BEST) 이벤트형 꽃바구니",
    points: [
      "기념일 선물, 행사용으로 인기 있는 사이즈",
      "생일·연인·부모님 선물로 가장 인기 있는 사이즈",
      "받는 사람이 사진 찍기 좋은 비율",
    ],
  },
  "basket-150000": {
    title: "TOP3) 이벤트형 꽃바구니를 풍성하게",
    points: ["이벤트 꽃바구니를 풍성하게 또는 특별한 색감으로", "행사·전시·축하에 가장 적합한 풍성도"],
  },
  "basket-200000": {
    title: "[행사용] 대형 꽃바구니",
    points: ["행사장·전시회·오픈식에서 존재감 있는 크기", "멀리서도 시선 확 끌리는 스타일"],
  },
  "basket-300000": {
    title: "[프리미엄] 대형 꽃바구니를 풍성하게",
    points: [
      "바구니 자체가 큰 대형 바구니를 풍성하게",
      "대형보다 꽃양이 확연히 많습니다",
      "사진·행사용으로 압도적 사이즈",
    ],
  },
  "orchid-120000": {
    title: "상견례 보자기 호접난 (2개 1세트)",
    points: [
      "단정한 화이트 호접난 + 신랑·신부를 상징하는 핑크·블루 등의 보자기 색상을 디자이너가 선정",
      "양가에 하나씩 드릴 수 있게 2개 1세트로 준비해요",
      "호남각·궁·고궁담 등 전주 상견례 식당 무료배송",
      "선물 후에도 포장을 유지하며 관리 가능한 이중 포장",
    ],
  },
};

const events: Record<"institutePromotion", EventCopy> = {
  institutePromotion: {
    calendarLabel: "승진식",
    shortTitle: (term) => `제${term}기 승진식`,
    title: (term) => `지방자치인재개발원 제${term}기 승진식`,
    highlights: [
      "전국에서 완주로 모이는 자리라 멀리서 오신 분들이 많아 꽃바구니 선호도가 높아요.",
      "무료 승진 토퍼를 함께 제공해 드려요.",
      "받으실 시간은 오전 8시·9시 중에서 골라주세요.",
    ],
  },
};

export const ko = {
  /** html lang 속성 */
  htmlLang: "ko",

  format: {
    /** 60000 → "60,000원" */
    price: (price: number) => `${price.toLocaleString("ko-KR")}원`,
    /** 60000 → "6만원" (상품 이름용) */
    priceShort: (price: number) => `${price / 10000}만원`,
    /** 달력 요일 머리글 (일요일부터) */
    weekdays,
    /** 9, 16, 3(수) → "9. 16(수)" */
    dateShort: (month: number, day: number, weekday: number) => `${month}. ${day}(${weekdays[weekday]})`,
    /** "10월 8일(목)" */
    dateLong: (month: number, day: number, weekday: number) =>
      `${month}월 ${day}일(${weekdays[weekday]})`,
    /** 15 → "오후 3:00" */
    time: (hour: number) => `${period(hour)} ${hour12(hour)}:00`,
    /** 시간 버튼 — 오전/오후 묶음 안에서 15 → "3:00" */
    slotShort: (hour: number) => `${hour12(hour)}:00`,
    /** 오전/오후 시간 버튼 묶음 이름 */
    morning: "오전",
    afternoon: "오후",
    /** "10월 7일(수) 오후 5시" */
    deadline: (dateLong: string, hour: number, minute: number) =>
      `${dateLong} ${period(hour)} ${hour % 12 === 0 ? 12 : hour % 12}시${minute ? ` ${minute}분` : ""}`,
    /** "꽃다발 6만원" */
    itemName: (categoryName: string, priceLabel: string) => `${categoryName} ${priceLabel}`,
    /** "꽃다발 6만원 (1/2)" */
    unitName: (itemName: string, unitNo: number, quantity: number) => `${itemName} (${unitNo}/${quantity})`,
    /** 이름 나열 구분 */
    listSeparator: "·",
  },

  common: {
    optional: "선택",
    close: "접기",
  },

  shop: {
    name: "새순 전주혁신도시점",
    tagline: "예약, 주문제작, 무인픽업도 가능한 24시 무인꽃집.",
  },

  header: {
    siteLink: "새순 소개 사이트 ›",
    language: "언어",
  },

  hero: {
    title: (categoryNames: string) => `${categoryNames} 예약하기`,
    imageAlt: "새순꽃집 꽃다발",
  },

  categories,
  products,
  events,

  eventBanner: {
    ariaLabel: "특별한 날 예약 안내",
    book: (shortTitle: string, categoryName: string) => `${shortTitle} ${categoryName} 예약하기`,
    later: "다음 일정",
    bookShort: "예약하기",
    deadline: (deadline: string) => `${deadline} 전까지 예약해 주세요.`,
  },

  categoryEntry: {
    ariaLabel: "예약할 상품 종류",
    title: "무엇을 예약하시나요?",
    subtitle: "여러 가지를 함께 담아 한 번에 예약할 수도 있어요.",
    photoAlt: (name: string) => `${name} 예시 사진`,
    count: (count: number) => `${count}개 담음`,
    startingFrom: (price: string) => `${price}부터`,
  },

  naverOnly: {
    plant: { title: "개업·승진·축하 화분 예약하기", description: "네이버 예약으로만 받아요" },
  },

  naverBanner: {
    ariaLabel: "네이버 예약",
    title: "네이버페이로 결제하실 건가요?",
    description: "신청서 없이 네이버 예약에서 바로 예약해요.",
    linkAria: (name: string) => `${name} 네이버 예약`,
  },

  sectionTabs: {
    items: "꽃 고르기",
    dateTime: "날짜·시간",
    reserve: "신청하기",
  },

  productSection: {
    heading: "예약할 상품을 골라주세요",
    subtitle: (categoryNames: string) => `${categoryNames} 모두 함께 담아 한 번에 예약할 수 있어요.`,
    error: "상품을 1개 이상 담아주세요.",
    tabsAria: "상품 종류",
    listAria: (name: string) => `${name} 목록`,
    sortPrice: "금액순",
    sortRank: "인기순",
    popular: (labels: string) => `인기 금액: ${labels} 순`,
    photoNote: "* 사진과 동일하게 제작은 어려워요. 색감과 크기 참고용으로 봐주세요.",
    moreSite: (name: string) => `📷 ${name} 사진·설명 더 보기`,
    moreSiteSub: "새순 소개 사이트에서 실제 제작 사례를 볼 수 있어요",
    nextCategory: (name: string) => `${name}도 보러 가기`,
  },

  notice: {
    title: "꼭 확인해 주세요!",
    showFull: "전체 안내 보기",
    hideFull: "전체 안내 접기",
  },

  productOption: {
    photoToggle: (name: string, open: boolean) => `${name} 사진 ${open ? "접기" : "더보기"}`,
    coverAlt: (name: string) => `${name} 대표 사진`,
    photoCount: (count: number) => `사진 ${count}`,
    photoAlt: (name: string, index: number) => `${name} 실제 제작 사진 ${index}`,
    morePhotos: "사진 더 보기",
    morePhotosSub: "새순 소개 사이트로 이동",
    quantity: (name: string) => `${name} 수량`,
    decrease: (name: string) => `${name} 빼기`,
    increase: (name: string) => `${name} 더하기`,
  },

  dateTime: {
    headingDate: "날짜",
    headingTime: "시간을 선택해 주세요",
    sameDayRule: `당일 예약은 받으실 시간 ${SAME_DAY_LEAD_HOURS}시간 전까지 가능해요.`,
    closeRule: `오후 ${ORDER_CLOSE_HOUR - 12}시가 되면 다음날 오전 ${ORDER_OPEN_HOUR}시까지는 예약할 수 없어요.`,
    errorDate: "받으실 날짜를 선택해 주세요.",
    errorTime: "받으실 시간을 선택해 주세요.",
    eventQuick: "특별한 날 바로 선택",
    pickDateFirst: "날짜를 먼저 선택하면 시간을 고를 수 있어요.",
    eventSlots: (shortTitle: string) => `${shortTitle} 시간`,
    prevMonth: "이전 달",
    nextMonth: "다음 달",
    today: "오늘",
    dayAria: (month: number, day: number, label: string | undefined, isToday: boolean) =>
      `${month}월 ${day}일${label ? ` ${label}` : ""}${isToday ? " 오늘" : ""}`,
  },

  reserve: {
    heading: "예약 정보를 입력해 주세요",
    ordererName: "예약자 성함",
    ordererNamePlaceholder: "성함을 입력해 주세요",
    ordererPhone: "예약자 연락처",
    phonePlaceholder: "010-0000-0000",
    phoneTitle: "연락처를 다시 확인해 주세요. (예: 010-1234-5678)",
  },

  summary: {
    items: "담은 상품",
    itemsEmpty: "예약할 상품을 담아주세요",
    schedule: "날짜·시간",
    scheduleEmpty: "날짜와 시간을 선택해 주세요",
    total: (count: number) => `총 ${count}개`,
  },

  color: {
    label: "원하는 색감",
    options: {
      auto: "알아서",
      bright: "화사하게",
      anniversary: "기념일에 어울리게",
      pink: "핑크톤",
      warm: "따듯한계열",
      soft: "은은한 색감",
      other: "기타",
    },
    otherAria: "원하는 색감 직접 입력",
    otherPlaceholder: "원하는 색감을 적어주세요",
  },

  orchidDelivery: {
    title: "호접난 받는 방법",
    methods: {
      pickup: { label: "매장에서 픽업", description: "새순 전주혁신도시점" },
      restaurant: { label: "상견례 식당으로 배송", description: "전주 상견례 식당 무료배송" },
    },
    restaurant: "식당",
    restaurantOther: "기타 (직접 입력)",
    restaurantOtherPlaceholder: "식당 이름을 적어주세요",
    reservationName: "식당에 예약된 이름",
    reservationNamePlaceholder: "식당 예약자 성함 (예: 김신랑)",
    timeNote: "선택하신 날짜·시간에 맞춰 식당에 도착하도록 보내드려요.",
    describePickup: "매장에서 픽업",
    describeRestaurant: (restaurant: string, reservationName: string) =>
      `${restaurant}(으)로 배송 · 예약자 ${reservationName}`,
  },

  /** 호접난 배송 식당 표시 이름 (한국어 이름 → 이 언어 표기) */
  restaurants: {
    호남각: "호남각",
    궁: "궁",
    고궁담: "고궁담",
  },

  recipient: {
    title: "받는 분·메시지",
    guide: "꽃다발은 인쇄된 메모지 부착, 꽃바구니는 리본글씨 또는 블랙보드, 호접난은 블랙보드로 가능해요.",
    empty: "상품을 담으면 받는 분과 메시지를 적을 수 있어요.",
    bulkAria: "받는 분·메시지 한 번에 바꾸기",
    allSame: "모두 같음",
    allSameDescription: "받는 분·메시지 한 번만 입력",
    allSeparate: "모두 따로",
    allSeparateDescription: "상품마다 각각 입력",
    mixed: "일부만 따로 입력 중이에요. 버튼을 누르면 모든 상품에 한 번에 적용돼요.",
    recipientTitle: "받는 분",
    sameRecipient: "앞 상품과 같음",
    nameAria: "받는 분 성함",
    namePlaceholder: "받는 분 성함 (픽업자가 다르거나 배송일 때)",
    phoneAria: "받는 분 연락처",
    phonePlaceholder: "받는 분 연락처 010-0000-0000",
    messageTitle: "메시지",
    sameMessage: (categoryName: string) => `앞 ${categoryName} 메시지와 같음`,
    describeEmpty: "입력 안 함 (예약자가 픽업)",
  },

  topper: {
    title: "🎓 승진 토퍼 (무료)",
    description: "토퍼에 넣을 이름과 직급을 적어주세요. 비워두시면 매장에서 연락드려요.",
    nameAria: "토퍼에 넣을 이름",
    namePlaceholder: "이름 (예: 홍길동)",
    rankAria: "토퍼에 넣을 직급",
    rankPlaceholder: "직급 (예: 사무관)",
    describe: (name: string, rank: string) => `토퍼 · ${[name, rank].filter(Boolean).join(" ") || "미입력 (매장에서 연락)"}`,
  },

  message: {
    typeAria: "메시지 방식",
    types: {
      none: "없음",
      memo: "인쇄된 메모지 부착",
      ribbon: `리본글씨 (양쪽 문구, 한 쪽에 ${RIBBON_MAX_LENGTH}자 내외)`,
      blackboard: `블랙보드 칠판 (띄어쓰기 포함 ${BLACKBOARD_MAX_LENGTH}자 이내)`,
    },
    memoAria: "메모지 문구",
    memoPlaceholder: "메모지에 인쇄할 문구를 적어주세요",
    ribbonLeftAria: "리본 한쪽 문구",
    ribbonLeftPlaceholder: `한쪽 문구 (${RIBBON_MAX_LENGTH}자 내외)`,
    ribbonRightAria: "리본 다른 쪽 문구",
    ribbonRightPlaceholder: `다른 쪽 문구 (${RIBBON_MAX_LENGTH}자 내외)`,
    presetsAria: "블랙보드 문구",
    custom: "직접 입력",
    customAria: "블랙보드 문구 직접 입력",
    customPlaceholder: `블랙보드에 적을 문구를 자유롭게 적어주세요 (띄어쓰기 포함 ${BLACKBOARD_MAX_LENGTH}자 이내)`,
    /** 외국어 화면에서 선택지 아래 보여줄 "실제로 적히는 한국어 문구" 머리말 — 한국어는 빈 문자열(표시 안 함) */
    writtenInKorean: "",
    describeNone: "없음",
    describeMemo: (text: string) => `메모지 · ${text || "(문구 미입력)"}`,
    describeRibbon: (left: string, right: string) => `리본 · ${left || "-"} / ${right || "-"}`,
    describeBlackboard: (text: string) => `블랙보드 · ${text || "(문구 미입력)"}`,
  },

  /** 블랙보드 문구 선택지 이름 (실제로 적히는 한국어 문구는 reservationOptions) */
  blackboardPresets: {
    auto: "알아서 써주세요",
    thanks: "키워주셔서 감사합니다 앞으로 잘 살겠습니다.",
    luck: "호접난의 꽃말처럼 행운이 날아오길 바라며 행복하게 잘 살겠습니다.",
  },

  payment: {
    legend: "결제 방법",
    methods: {
      bank: {
        label: "계좌이체",
        description: "입금 확인 후 완료",
        complete: "입금이 되어야 예약이 완료됩니다.",
      },
      card: {
        label: "카드 결제",
        description: "전화로 카드번호 전달",
        complete: "매장에서 연락드리면 카드번호와 유효기간을 알려주세요. 결제가 되어야 예약이 완료됩니다.",
      },
      paypal: {
        label: "PayPal",
        description: "해외 결제 · 수수료 10%",
        complete: "매장에서 PayPal 결제 요청을 이메일로 보내드려요. 결제가 되어야 예약이 완료됩니다.",
      },
    },
    cardGuide: [
      "예약 확인 후 매장에서 연락드려요.",
      "통화로 카드번호와 유효기간을 알려주시면 결제해 드려요.",
      "카드번호는 이 신청서에 적지 마세요.",
    ],
    cardPayerTitle: "카드 결제하실 분 연락처",
    cardPayerDescription: "예약자 연락처와 카드 결제하실 분의 연락처가 다르면 아래에 적어주세요.",
    cardPayerOptions: { same: "예약자와 동일합니다", other: "예약자와 다릅니다" },
    cardPayerAria: "카드 결제하실 분 성함·연락처",
    cardPayerPlaceholder: "결제하실 분 성함과 연락처 (예: 김결제 010-1234-5678)",
    cashReceiptTitle: "현금영수증",
    cashReceiptOptions: { none: "신청 안 함", income: "소득공제", expense: "지출증빙" },
    cashReceiptInputs: {
      income: { placeholder: "휴대폰 번호 010-0000-0000", title: "휴대폰 번호를 확인해 주세요. (예: 010-1234-5678)" },
      expense: { placeholder: "사업자등록번호 000-00-00000", title: "사업자등록번호 10자리를 확인해 주세요. (예: 123-45-67890)" },
    },
    cashReceiptNumberAria: (label: string) => `${label} 번호`,
    naverNote: "네이버페이 결제는 네이버 예약에서 따로 예약해 주세요.",
    naverLink: "네이버 예약 바로가기 ›",
    /** 해외 결제 안내 — 외국어 화면에서는 결제 방법 위에 크게 */
    overseasTitle: "해외에서 결제하시나요?",
    overseasBody: "PayPal로 결제할 수 있어요. 상품·배송 금액에 수수료 10%가 추가돼요.",
    paypalGuide: [
      "예약 확인 후 매장에서 아래 이메일로 PayPal 결제 요청을 보내드려요.",
      "상품·배송 금액에 PayPal 수수료 10%가 추가돼요.",
    ],
    paypalProducts: "상품 금액",
    paypalFee: (percent: number) => `수수료 ${percent}%`,
    paypalTotal: "PayPal 결제 금액",
    paypalEmail: "PayPal 결제 요청 받을 이메일",
    paypalEmailPlaceholder: "name@example.com",
  },

  bankCard: {
    title: "입금 계좌",
    bank: "농협",
    holderNote: (holder: string) => `${holder} · 입금 후 입금자명을 알려주세요`,
    copy: "계좌 복사",
    copied: "복사됨 ✓",
  },

  documents: {
    toggle: "견적서·거래명세표가 필요해요",
    description: "회사·기관 행사 등 증빙이 필요하면 체크해 주세요. 신청하면 바로 만들어 드려요.",
    groupAria: "필요한 서류",
    options: { quote: "견적서", statement: "거래명세표" },
    emailAria: "서류 받을 이메일",
    emailPlaceholder: "서류 받을 이메일 (예: name@company.com)",
    companyAria: "상호·기관명",
    companyPlaceholder: "상호·기관명 (공급받는 자)",
    businessNumberAria: "사업자등록번호",
    businessNumberPlaceholder: "사업자등록번호 (선택) 000-00-00000",
    businessNumberTitle: "사업자등록번호 10자리를 확인해 주세요. (예: 123-45-67890)",
    panelTitle: "요청하신 서류",
    print: "인쇄 / PDF 저장",
    emailNote: (email: string) =>
      `매장에서 확인 후 ${email}로 보내드려요. 지금 바로 필요하면 인쇄 창에서 ‘PDF로 저장’을 골라주세요.`,
    tabsAria: "서류 종류",
    /** 외국어 화면에서만 — 서류는 한국어로 작성됨 */
    koreanOnly: "",
  },

  complete: {
    title: "작성이 완료되었습니다! 🎉",
    receiptNumber: (no: string) => `접수번호 ${no}`,
    orderer: (name: string, phone: string) => `예약자 ${name} · ${phone}`,
    paymentMethod: (label: string) => `결제 방법 · ${label}`,
    cashReceipt: (label: string, number: string) => `현금영수증 · ${label} ${number}`,
    cardPayer: (contact: string) => `결제하실 분 · ${contact}`,
    cardPayerSame: "예약자와 동일",
    paypal: (amount: string, email: string) => `PayPal 결제 금액 ${amount} · 결제 요청 받을 이메일 ${email}`,
    orchidDelivery: (text: string) => `호접난 받는 방법 · ${text}`,
    recipient: (text: string) => `받는 분 · ${text}`,
    message: (text: string) => `메시지 · ${text}`,
  },

  submitBar: {
    empty: "상품과 날짜·시간을 선택해 주세요",
    submit: "예약하기",
  },

  privacy: {
    consentLabel: "[필수] 개인정보 수집·이용에 동의합니다",
    showDetails: "내용 보기",
    hideDetails: "접기",
    items: [
      {
        title: "수집 항목",
        body: "예약자 성함·연락처(필수), 받는 분 성함·연락처, 메시지 문구, 승진 토퍼 이름·직급, 호접난 배송 식당·식당 예약 이름, 현금영수증 번호, 카드 결제하실 분 연락처, PayPal 결제 요청 이메일, 서류 받을 이메일·상호·사업자등록번호 (해당하는 경우)",
      },
      {
        title: "이용 목적",
        body: "예약 접수·확인 연락, 상품 제작 및 픽업·배송, 결제 확인, 현금영수증·견적서·거래명세표 발급",
      },
      {
        title: "보유 기간",
        body: "상품 전달 후 1년간 보관 후 파기 (관계 법령에 따라 보존이 필요한 정보는 해당 기간 동안 보관)",
      },
    ],
    refusal: "동의를 거부할 수 있으나, 거부하시면 온라인 예약이 어렵습니다. 전화나 네이버 예약을 이용해 주세요.",
    policyLink: "개인정보 처리방침 전체 보기 ›",
  },

  submit: {
    saving: "신청을 저장하고 있어요…",
    unavailable: `지금은 온라인 신청을 받을 수 없어요. 전화(${businessInfo.phone})나 네이버 예약을 이용해 주세요.`,
    failed: `신청을 저장하지 못했어요. 잠시 후 다시 시도하거나 전화(${businessInfo.phone})로 연락해 주세요.`,
  },

  footer: {
    privacy: "개인정보 처리방침",
  },

  /** 서버에서 다시 검사할 때의 안내 */
  validation: {
    unreadable: "예약 정보를 읽을 수 없어요.",
    privacy: "개인정보 수집·이용에 동의해 주세요.",
    ordererName: "예약자 성함을 입력해 주세요.",
    ordererPhone: "예약자 연락처를 다시 확인해 주세요.",
    unknownProduct: "없는 상품이 포함되어 있어요. 페이지를 새로고침해 주세요.",
    quantity: "상품 수량을 다시 확인해 주세요.",
    duplicateProduct: "상품 정보가 중복되었어요.",
    noItems: "상품을 1개 이상 담아주세요.",
    schedule: "날짜와 시간을 선택해 주세요.",
    scheduleClosed: "선택한 시간은 지금 예약할 수 없어요. 날짜·시간을 다시 골라주세요.",
    deliveries: "받는 분·메시지 정보를 다시 확인해 주세요.",
    recipientPhone: "받는 분 연락처를 다시 확인해 주세요.",
    orchidRestaurant: "호접난을 배송할 식당 이름을 적어주세요.",
    orchidReservationName: "식당에 예약된 이름을 적어주세요.",
    cashReceiptPhone: "현금영수증 휴대폰 번호를 확인해 주세요.",
    cashReceiptBusiness: "현금영수증 사업자등록번호를 확인해 주세요.",
    cardPayer: "카드 결제하실 분 연락처를 적어주세요.",
    paypalEmail: "PayPal 결제 요청 받을 이메일을 확인해 주세요.",
    documentEmail: "서류 받을 이메일을 확인해 주세요.",
    documentCompany: "서류에 적을 상호·기관명을 입력해 주세요.",
    documentBusinessNumber: "서류용 사업자등록번호를 확인해 주세요.",
  },
};

export type Messages = typeof ko;
