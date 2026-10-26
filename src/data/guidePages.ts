import type { ProductCategoryId } from "@/types/reservation";

/**
 * 구글 검색용 주제별 소개 페이지 (/guide/{slug}) — 한국어만.
 * 2026-10-26 사용자 요청("지역 꽃집 키워드로 모두 노출") → Claude 제안으로 주제마다 한 페이지.
 * 금액·배송 기준·행사 일정은 여기 적지 않고 products·reservationOptions·events에서 읽어 자동으로 맞춘다.
 */
/** 페이지 주소 끝부분 — 새 페이지를 추가하면 언어 파일 footer.guides 에도 이름을 넣어야 함(타입 오류가 알려줌) */
export type GuideSlug = "occasions" | "orchid" | "institute" | "business";

export type GuidePage = {
  slug: GuideSlug;
  /** 페이지 큰 제목 (h1) */
  heading: string;
  /** 구글 검색 결과 제목 */
  metaTitle: string;
  /** 구글 검색 결과 설명 */
  description: string;
  keywords: string[];
  /** 맨 위 소개 문장 */
  intro: string[];
  /** 보여줄 사진 — 상품 id (관리자 사진 관리에서 바꾼 사진이 그대로 나옴) */
  photoProducts: string[];
  sections: { title: string; items: string[] }[];
  /** 금액 표를 보여줄 상품 종류 */
  priceCategories: ProductCategoryId[];
  /** 무료배송 기준을 보여줄지 */
  showDeliveryRules: boolean;
  /** 지방자치인재개발원 다가오는 행사 일정을 보여줄지 */
  showInstituteEvents: boolean;
  /** 예약 버튼 글자 */
  ctaLabel: string;
  /** 다른 페이지 목록에 보일 짧은 이름 */
  linkLabel: string;
};

export const guidePages: GuidePage[] = [
  {
    slug: "occasions",
    heading: "생일·어버이날·졸업식·칠순 꽃다발·꽃바구니",
    metaTitle: "전주 꽃다발·꽃바구니 | 생일·어버이날·졸업식·칠순 꽃 · 새순꽃집",
    description:
      "전주혁신도시 24시 무인꽃집 새순의 꽃다발·꽃바구니. 생일·기념일·프로포즈, 어버이날·스승의날, 졸업식·입학식, 칠순·팔순 꽃과 빼빼로데이·크리스마스·발렌타인데이 꽃선물을 사진으로 보고 예약하세요.",
    keywords: [
      "전주꽃다발",
      "전주꽃바구니",
      "생일꽃다발",
      "생일꽃바구니",
      "전주 어버이날 꽃집",
      "어버이날 꽃바구니",
      "스승의날 꽃다발",
      "전주 졸업식 꽃다발",
      "입학식 꽃다발",
      "전주 칠순 꽃바구니",
      "칠순꽃다발",
      "팔순 꽃바구니",
      "프로포즈 꽃다발",
      "빼빼로데이 꽃다발",
      "크리스마스 꽃다발",
      "화이트데이 꽃배달",
      "발렌타인데이 꽃배달",
      "로즈데이 꽃선물",
    ],
    intro: [
      "전주혁신도시 24시 무인꽃집 새순에서 기념일 꽃다발·꽃바구니를 사진으로 보고 예약하세요.",
      "원하는 날짜와 시간을 고르면 그 시간에 맞춰 준비해 드려요. 꽃다발·꽃바구니·호접난을 한 번에 여러 개 담을 수 있어요.",
    ],
    photoProducts: ["bouquet-80000", "basket-100000", "bouquet-60000", "basket-150000"],
    sections: [
      {
        title: "이런 날 많이 찾으세요",
        items: [
          "생일·결혼기념일·프로포즈",
          "어버이날·스승의날 감사 꽃",
          "졸업식·입학식 꽃다발",
          "칠순·팔순·환갑 잔치 꽃바구니",
          "승진·퇴임·정년퇴직 축하 꽃",
          "발렌타인데이·화이트데이·로즈데이·빼빼로데이·크리스마스 꽃선물",
        ],
      },
      {
        title: "함께 담을 수 있어요",
        items: ["초콜릿(해피히포·페레로로쉐·킨더조이)", "들고 다니기 편한 꽃다발 쇼핑백"],
      },
      {
        title: "받는 방법",
        items: [
          "예약한 시간에 맞춰 매장에서 픽업 (예약 시간은 오전 8시~오후 7시)",
          "당일 예약은 받는 시간 2시간 전까지 가능해요",
          "받는 분께 배송도 가능해요 (아래 무료배송 기준)",
        ],
      },
    ],
    priceCategories: ["bouquet", "basket"],
    showDeliveryRules: true,
    showInstituteEvents: false,
    ctaLabel: "꽃다발·꽃바구니 예약하기",
    linkLabel: "생일·어버이날·졸업식·칠순 꽃",
  },
  {
    slug: "orchid",
    heading: "전주 상견례 선물 호접난",
    metaTitle: "전주 상견례 선물 호접난 | 보자기 호접난 2개 1세트 · 새순꽃집",
    description:
      "전주 상견례 선물 호접난. 화이트 호접난을 신랑·신부 색 보자기로 포장해 양가에 하나씩 드리는 2개 1세트, 호남각·궁·고궁담 등 전주 상견례 식당 무료배송. 사진으로 보고 온라인으로 예약하세요.",
    keywords: [
      "전주 상견례 선물 호접난",
      "상견례 호접난",
      "상견례 선물",
      "전주 상견례 꽃",
      "보자기 호접난",
      "호남각 상견례 선물",
      "고궁담 상견례 선물",
    ],
    intro: [
      "상견례 자리에서 양가 부모님께 드리는 호접난을 준비해 드려요.",
      "단정한 화이트 호접난에 신랑·신부를 상징하는 핑크·블루 등의 보자기 색상을 디자이너가 골라 포장해요.",
    ],
    photoProducts: ["orchid-120000"],
    sections: [
      {
        title: "이렇게 준비해요",
        items: [
          "양가에 하나씩 드릴 수 있게 2개 1세트",
          "선물 후에도 포장을 유지하며 관리할 수 있는 이중 포장",
          "블랙보드 문구는 매장에서 알아서 써 드리거나, 준비된 문구 중 고르거나, 직접 적으실 수 있어요",
        ],
      },
      {
        title: "받는 방법",
        items: [
          "매장(전주혁신도시 24시 무인꽃집)에서 픽업",
          "호남각·궁·고궁담 등 전주 상견례 식당으로 무료배송 — 식당 이름과 식당 예약 이름만 적어 주세요",
        ],
      },
    ],
    priceCategories: ["orchid"],
    showDeliveryRules: false,
    showInstituteEvents: false,
    ctaLabel: "상견례 호접난 예약하기",
    linkLabel: "상견례 선물 호접난",
  },
  {
    slug: "institute",
    heading: "지방자치인재개발원 승진식·수료식 꽃",
    metaTitle: "완주 지방자치인재개발원 꽃집 | 승진식·수료식 꽃배달 · 새순꽃집",
    description:
      "완주 지방자치인재개발원 승진식·장기과정 수료식 꽃다발·꽃바구니. 보내는 분 이름을 넣은 무료 토퍼, 행사 당일 오전 8시 준비. 행사 전날 오후 5시까지 온라인으로 예약하세요.",
    keywords: [
      "지방자치인재개발원 꽃배달",
      "완주 지방자치인재개발원 꽃집",
      "지방자치인재개발원 승진식 꽃",
      "지방자치인재개발원 수료식 꽃",
      "승진 축하 꽃바구니",
      "완주 꽃배달",
    ],
    intro: [
      "완주 지방자치인재개발원 승진식·장기과정 수료식 날 축하 꽃을 준비해 드려요.",
      "전국에서 완주로 모이는 자리라 멀리서 오신 분들이 많아 꽃바구니 선호도가 높아요.",
    ],
    photoProducts: ["basket-100000", "basket-150000", "bouquet-100000"],
    sections: [
      {
        title: "행사 꽃 이렇게 준비해요",
        items: [
          "보내는 분 이름 또는 팀 이름을 넣은 승진·수료 토퍼를 무료로 꽂아 드려요",
          "행사 날 받으실 시간은 오전 8시예요",
          "행사 전날 오후 5시에 예약이 마감돼요",
          "여러 분께 보내실 때는 한 번에 담고 받는 분·메시지를 상품마다 따로 적을 수 있어요",
        ],
      },
    ],
    priceCategories: ["basket", "bouquet"],
    showDeliveryRules: true,
    showInstituteEvents: true,
    ctaLabel: "승진식·수료식 꽃 예약하기",
    linkLabel: "지방자치인재개발원 승진식·수료식 꽃",
  },
  {
    slug: "business",
    heading: "전주 기업·공공기관 행사 꽃",
    metaTitle: "전주 기업 전문꽃집 | 기업·공공기관 행사 꽃배달·꽃장식 · 새순꽃집",
    description:
      "전주 기업·공공기관 행사용 꽃바구니·꽃다발. 여러 개 한 번에 예약, 견적서·거래명세표 PDF 바로 받기, 계좌이체 지출증빙 현금영수증, 전주혁신도시·만성동·이서면 기관 행사 무료배송 기준 안내.",
    keywords: [
      "전주 기업 전문꽃집",
      "전주 기업 행사 꽃장식",
      "전주 공공기관 행사 꽃배달",
      "기업 꽃배달",
      "행사 꽃바구니",
      "개업식 꽃바구니",
      "전주혁신도시꽃집",
    ],
    intro: [
      "전주혁신도시·만성동·이서면 기관과 기업의 행사 꽃을 준비해 드려요.",
      "행사장·전시회·오픈식에 어울리는 대형 꽃바구니부터 축하 꽃다발까지 한 번에 예약할 수 있어요.",
    ],
    photoProducts: ["basket-300000", "basket-200000", "basket-150000"],
    sections: [
      {
        title: "행사 꽃 주문",
        items: [
          "여러 개를 한 번에 담고, 받는 분·메시지를 상품마다 따로 적을 수 있어요",
          "멀리서도 눈에 띄는 대형 꽃바구니 (행사용·프리미엄)",
          "꽃장식처럼 신청서에 없는 주문은 전화로 상담해 주세요",
        ],
      },
      {
        title: "서류·결제",
        items: [
          "견적서·거래명세표 — 예약할 때 체크하면 상호·사업자번호로 자동 작성되고 PDF로 바로 받을 수 있어요",
          "계좌이체·카드 결제 (카드는 매장에서 연락드려 전화로 받아요)",
          "계좌이체는 현금영수증(지출증빙) 신청 가능",
        ],
      },
    ],
    priceCategories: ["basket", "bouquet"],
    showDeliveryRules: true,
    showInstituteEvents: false,
    ctaLabel: "행사 꽃 예약하기",
    linkLabel: "기업·공공기관 행사 꽃",
  },
];

export const guidePath = (slug: string) => `/guide/${slug}`;

export function getGuidePage(slug: string) {
  return guidePages.find((page) => page.slug === slug);
}
