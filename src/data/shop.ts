import type { ProductCategoryId } from "@/types/reservation";

/** 매장 이름·한 줄 소개는 언어 파일(i18n)의 shop 에 있음 */
export const shop = {
  heroImage: "/flowers/bouquet-80000-06.jpg",
};

/**
 * 견적서·거래명세표의 "공급자" 정보.
 * 값을 비우면 서류에 "(확인 필요)"로 표시됨.
 */
export const businessInfo = {
  tradeName: "새순",
  representative: "김래인",
  businessNumber: "102-16-53653",
  address: "전북특별자치도 전주시 덕진구 기지로 77, 대방디엠시티 1층 D108~109호",
  /** 업태 */
  businessType: "도매 및 소매업",
  /** 종목 */
  businessItem: "화초 및 식물 소매업",
  phone: "010-5954-3963",
  /** 대표자 이름 옆에 찍는 직인 (투명 배경 PNG, public 기준 경로). 바꿀 땐 새 번호 파일명으로 */
  sealImage: "/documents/seal-01.png" as string | null,
  /**
   * 서류에 적는 품목의 부가세 — "exempt": 면세 품목(합계만) / "taxable": 과세 품목(공급가액·세액 나눠 표시)
   * null: 아직 모름 → 서류에 "부가세 구분 (확인 필요)"로 표시
   * 새순은 과세사업자이지만 판매 품목(생화·꽃바구니·호접난)이 면세 품목이라 "exempt"
   */
  taxType: "exempt" as "exempt" | "taxable" | null,
  /** 견적서 유효기간 (일) */
  quoteValidDays: 14,
};

/** 은행 이름은 언어별 표기가 달라 언어 파일(i18n)의 bankCard.bank 에 있음 */
export const bankAccount = {
  number: "302-0690-4409-61",
  holder: "김래인",
};

/**
 * 이 페이지에서 신청받지 않고 네이버 예약으로만 받는 상품 — 첫 화면에서 바로 연결.
 * 버튼 문구는 언어 파일(i18n)의 naverOnly[id] (id를 추가하면 타입 오류가 빠진 언어를 알려줌)
 */
export const naverOnlyBookings = [
  {
    id: "plant" as const,
    emoji: "🪴",
    url: "https://m.booking.naver.com/booking/6/bizes/1201254/items/7897484?area=pll&entry=pll&fbclid=PAb21jcAUUAXBjbGNrAhOIKGV4dG4DYWVtAjEwAAGmqiuZCxfN75n2HqwN8G5Jf8MVuLz2dHiXYUIUUzGuVLZpPlQjja3MvbXl_aem_wQIDFQI5CMD5rQV_zMIV3w&lang=ko&startDate=2026-09-14&theme=place",
  },
];

/** 개인정보 처리방침 페이지 주소 (신청서 동의 칸·페이지 아래쪽 링크) */
export const privacyPath = "/privacy";

/** 손님 예약 조회·취소 화면 (접수번호를 미리 채우려면 ?no=접수번호) */
export const lookupPath = "/check";

/** 견적서·거래명세표 PDF 받기 (POST — app/documents/pdf/route.ts) */
export const documentPdfPath = "/documents/pdf";

/** 새순 소개 사이트 — 예약 탭에 없는 사진·설명을 더 보고 싶은 분께 연결 */
export const siteUrl = "https://saesoon-jeonju.withrain94.chatgpt.site";

/** 상품 종류별 사이트 안의 해당 소개 위치 */
export const siteLinksByCategory: Record<ProductCategoryId, string> = {
  bouquet: `${siteUrl}/#product-01`,
  basket: `${siteUrl}/#product-02`,
  orchid: `${siteUrl}/#meeting`,
};

/** 상품 종류별 네이버 예약 페이지 */
export const naverBookingUrls: Record<ProductCategoryId, string> = {
  bouquet:
    "https://m.booking.naver.com/booking/6/bizes/1201254/items/6060631?area=pll&entry=pll&fbclid=PAQ0xDSwMRX6BjbGNrAhOIKGV4dG4DYWVtAjEwAAGmqiuZCxfN75n2HqwN8G5Jf8MVuLz2dHiXYUIUUzGuVLZpPlQjja3MvbXl_aem_wQIDFQI5CMD5rQV_zMIV3w&lang=ko&startDate=2026-09-19&theme=place",
  basket:
    "https://m.booking.naver.com/booking/6/bizes/1201254/items/6081710?area=pll&entry=pll&lang=ko&startDate=2026-09-19&theme=place",
  orchid:
    "https://m.booking.naver.com/booking/6/bizes/1201254/items/7199208?area=pll&entry=pll&lang=ko&startDate=2026-09-15&theme=place",
};

/** 이 예약 사이트의 주소 — 구글 검색용 정보(sitemap·robots·대표 주소)에 씀. 주소가 바뀌면 여기만 */
export const bookingSiteUrl = "https://saesoon-flower.vercel.app";

/**
 * 구글 검색 노출용 정보 (한국어 — 검색 결과 제목·설명, 지도 정보).
 * 2026-10-26 사용자 요청 키워드: 전주꽃집 · 전주 꽃배달 · 완주 꽃배달 · 완주 지방자치인재개발원 꽃집 · 지방자치인재개발원 꽃배달
 * + 같은 날 추가: 전주 상견례 선물 호접난 · 전주꽃바구니 · 전주꽃다발 · 전주 기업 행사 꽃장식 · 전주 공공기관 행사 꽃배달 · 전주 칠순 꽃바구니 · 칠순꽃다발 · 전주 졸업식 꽃다발
 * + 같은 날 추가: 전주 어버이날 꽃집 · 전주 24시 무인꽃집 · 전주혁신도시꽃집 · 전주 기업 전문꽃집 · 생일꽃다발 · 생일꽃바구니 · 빼빼로데이 꽃다발 · 크리스마스 꽃다발 · 화이트데이·발렌타인데이 꽃배달 · 로즈데이 꽃선물 + Claude가 보탠 기념일 키워드
 * (구글은 keywords 칸보다 화면 글자·제목·설명을 더 보므로 푸터 문구(언어 파일 footer)도 같이 맞춤)
 */
export const searchInfo = {
  title: "전주꽃집 새순 | 전주·완주 꽃배달, 지방자치인재개발원 꽃집 예약",
  description:
    "전주혁신도시 24시 무인꽃집 새순. 전주 꽃다발·꽃바구니, 생일·어버이날·졸업식·칠순 꽃, 상견례 선물 호접난, 기업·공공기관 행사 꽃장식, 전주·완주·지방자치인재개발원 꽃배달까지 사진으로 보고 온라인으로 예약하세요.",
  keywords: [
    "전주꽃집",
    "전주 꽃집",
    "전주 꽃배달",
    "전주혁신도시 꽃집",
    "완주 꽃배달",
    "완주 꽃집",
    "완주 지방자치인재개발원 꽃집",
    "지방자치인재개발원 꽃배달",
    "지방자치인재개발원 승진식 꽃",
    "전주꽃다발",
    "전주 꽃다발",
    "전주꽃바구니",
    "전주 꽃바구니",
    "전주 상견례 선물 호접난",
    "상견례 호접난",
    "전주 칠순 꽃바구니",
    "칠순꽃다발",
    "칠순 꽃바구니",
    "전주 졸업식 꽃다발",
    "졸업식 꽃다발",
    "전주 기업 행사 꽃장식",
    "전주 공공기관 행사 꽃배달",
    "행사 꽃장식",
    "전주혁신도시꽃집",
    "전주 24시 무인꽃집",
    "24시 무인꽃집",
    "전주 무인꽃집",
    "전주 기업 전문꽃집",
    "기업 꽃배달",
    "전주 어버이날 꽃집",
    "어버이날 꽃바구니",
    "어버이날 꽃다발",
    "스승의날 꽃다발",
    "생일꽃다발",
    "생일꽃바구니",
    "생일 꽃배달",
    "기념일 꽃다발",
    "결혼기념일 꽃다발",
    "프로포즈 꽃다발",
    "입학식 꽃다발",
    "졸업 꽃다발",
    "팔순 꽃바구니",
    "환갑 꽃바구니",
    "승진 축하 꽃",
    "퇴임 꽃다발",
    "정년퇴직 꽃다발",
    "빼빼로데이 꽃다발",
    "빼빼로데이 선물",
    "발렌타인데이 꽃다발",
    "화이트데이 꽃다발",
    "화이트데이 꽃배달",
    "발렌타인데이 꽃배달",
    "로즈데이 장미",
    "로즈데이 꽃선물",
    "성년의날 장미",
    "크리스마스 꽃배달",
    "연말 꽃선물",
    "꽃선물",
    "크리스마스 꽃다발",
    "전주 덕진구 꽃집",
    "전주 만성동 꽃집",
    "완주 이서면 꽃집",
    "전주 꽃 예약",
    "당일 꽃 예약",
    "새순꽃집",
  ],
  /** 꽃을 보내는 지역 (지도·검색 정보의 "배달 지역") */
  areaServed: ["전주시", "완주군", "전주혁신도시", "지방자치인재개발원"],
  postalAddress: {
    region: "전북특별자치도",
    locality: "전주시 덕진구",
    street: "기지로 77, 대방디엠시티 1층 D108~109호",
  },
};
