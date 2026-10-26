import {
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  PAYPAL_FEE_RATE,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import { storeContact } from "@/data/shop";

/**
 * 첫 화면 매장 소개 문구 (한국어) — 맨 위 사진 안내·매장 한 줄 요약·예약 3단계·손님 후기·매장 안내·자주 묻는 질문.
 * 2026-10-26 사용자 요청: 소개 사이트 내용을 참고해 검색으로 들어온 분이 매장 위치·정보를 알고 예약하게.
 * 다른 언어 파일은 이 모양과 같아야 한다. 주소는 모든 언어에서 한국어 그대로(택시·지도 검색용) 보여준다.
 */
const { open, close } = storeContact.staffedHours;
const pm = (hour: number) => (hour > 12 ? hour - 12 : hour);

export const storeInfoKo = {
  hero: {
    eyebrow: "중요한 날의 꽃, 마음까지 잘 도착하도록",
    badges: ["24시 무인꽃집 · 연중무휴", "12년 경력 플로리스트", "전주·완주 꽃배달"],
    book: "꽃 예약하기",
    location: "매장 위치",
  },

  quick: {
    ariaLabel: "매장 위치 요약",
    landmark: "롯데프레시 전주혁신점 옆",
    hours: "24시간 · 연중무휴",
    call: "전화",
    map: "지도",
    kakao: "카톡 상담",
  },

  steps: {
    title: "예약은 3단계면 끝나요",
    subtitle: "회원가입 없이 바로 신청해요. 입금·결제는 신청 후에 안내해 드려요.",
    items: {
      items: "꽃 고르기",
      dateTime: "날짜·시간",
      reserve: "이름·연락처",
    },
  },

  reviews: {
    title: "손님 후기",
    subtitle: "꽃을 받고 카카오톡으로 보내주신 말씀이에요.",
    items: [
      { tag: "상견례 호접난", text: "어머! 너무 예뻐요. 감사합니다!" },
      { tag: "인재개발원 꽃배달", text: "받는 분도 예쁘다고 하셨습니다. 감사합니다." },
      { tag: "기업 행사꽃", text: "와아, 진심 너무 예쁩니다. 배송까지 잘 부탁드립니다." },
      { tag: "24시 무인 픽업", text: "부모님들이 너무 좋아하실 것 같아요! 사장님 번창하세요." },
    ],
  },

  store: {
    title: "매장 안내",
    name: "새순꽃집 전주혁신도시점",
    addressLabel: "주소",
    landmark: "롯데프레시 전주혁신점 옆",
    copyAddress: "주소 복사",
    copied: "복사했어요",
    hoursLabel: "영업 시간",
    hours: "24시간 · 연중무휴 (공휴일·명절 연휴에도 열어요)",
    staffLabel: "직원 있는 시간",
    staff: `월~금 오전 ${open}시 ~ 오후 ${pm(close)}시 (현장 상황에 따라 달라질 수 있어요)`,
    buyLabel: "매장에서",
    buy: "진열된 꽃은 바로 구매 · 예약한 꽃은 24시간 언제든 무인 픽업",
    payLabel: "결제",
    pay: "키오스크에서 카드·카카오페이·계좌이체·온누리상품권 (포인트 적립)",
    phoneLabel: "전화",
    basketNote: "꽃바구니는 늘 진열해 두지 않아서 예약이 필요해요.",
    naverMap: "네이버 지도에서 보기",
    call: "전화하기",
    kakao: "카카오톡 상담",
    instagram: "인스타그램",
    blog: "네이버 블로그",
    coupang: "쿠팡이츠로 당일 주문",
    coupangNote: "매장 재고 기준",
  },

  delivery: {
    title: "무료배송 기준",
    subtitle: "신청서 '받는 방법'에서 배송을 고르시면 돼요.",
    otherArea: "완주·외곽 지역은 따로 상담해 드려요. 배송비가 생기면 예약자 연락처로 문자를 드려요.",
  },

  faq: {
    title: "자주 묻는 질문",
    items: [
      {
        q: "사진과 똑같이 만들어 주나요?",
        a: "사진은 참고용이에요. 계절과 그날 들어온 꽃에 따라 구성이 조금 달라질 수 있지만, 고르신 금액·색감에 맞춰 정성껏 만들어 드려요.",
      },
      {
        q: "언제까지 예약하면 되나요?",
        a: `받으실 날 3일 전 예약을 권해요. 당일 예약은 받으실 시간 ${SAME_DAY_LEAD_HOURS}시간 전까지 가능하고, 오후 ${pm(ORDER_CLOSE_HOUR)}시가 지나면 다음날 오전 ${ORDER_OPEN_HOUR}시까지는 예약할 수 없어요.`,
      },
      {
        q: "예약 확인·취소는 어떻게 하나요?",
        a: "화면 맨 위 [예약 조회]에서 예약자 이름과 연락처로 확인하고 취소할 수 있어요. 변경은 받으실 날 전날까지 전화나 카카오톡으로 알려주세요.",
      },
      {
        q: "배송도 되나요?",
        a: "네. 신청서 '받는 방법'에서 배송을 고르고 배송지를 적어주세요. 아래 무료배송 기준에 맞으면 무료예요.",
      },
      {
        q: "상견례 식당으로 호접난을 보내줄 수 있나요?",
        a: "네, 호남각·궁·고궁담 등 전주 상견례 식당으로 무료배송해요. 목록에 없는 식당도 신청서에 적어주세요.",
      },
      {
        q: "초콜릿도 함께 보낼 수 있나요?",
        a: "네. 꽃을 고른 바로 아래 '초콜릿 추가'에서 함께 담을 수 있어요.",
      },
      {
        q: "해외에서도 결제할 수 있나요?",
        a: `PayPal로 결제할 수 있어요. 결제 수수료 ${Math.round(PAYPAL_FEE_RATE * 100)}%가 더해져요.`,
      },
      {
        q: "예약 없이 바로 살 수도 있나요?",
        a: "24시 무인매장에서 진열된 꽃을 언제든 바로 살 수 있어요. 당일 배달은 쿠팡이츠(매장 재고 기준)로도 주문할 수 있어요.",
      },
    ],
  },

  bottomCta: {
    title: "마음에 드는 꽃을 찾으셨나요?",
    button: "꽃 고르러 가기",
  },
};

export type StoreInfoMessages = typeof storeInfoKo;
