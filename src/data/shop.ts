import type { ProductCategoryId } from "@/types/reservation";

export const shop = {
  name: "새순 전주혁신도시점",
  tagline: "예약, 주문제작, 무인픽업도 가능한 24시 무인꽃집.",
  heroImage: "/flowers/bouquet-80000-06.jpg",
};

/**
 * 견적서·거래명세표의 "공급자" 정보.
 * 값을 비우면 서류에 "(확인 필요)"로 표시됨. TODO(자료 필요): 직인 이미지
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
  /**
   * 서류에 적는 품목의 부가세 — "exempt": 면세 품목(합계만) / "taxable": 과세 품목(공급가액·세액 나눠 표시)
   * null: 아직 모름 → 서류에 "부가세 구분 (확인 필요)"로 표시
   * 새순은 과세사업자이지만 판매 품목(생화·꽃바구니·호접난)이 면세 품목이라 "exempt"
   */
  taxType: "exempt" as "exempt" | "taxable" | null,
  /** 견적서 유효기간 (일) */
  quoteValidDays: 14,
};

export const bankAccount = {
  bank: "농협",
  number: "302-0690-4409-61",
  holder: "김래인",
};

/** 이 페이지에서 신청받지 않고 네이버 예약으로만 받는 상품 — 첫 화면에서 바로 연결 */
export const naverOnlyBookings = [
  {
    id: "plant",
    emoji: "🪴",
    title: "개업·승진·축하 화분 예약하기",
    description: "네이버 예약으로만 받아요",
    url: "https://m.booking.naver.com/booking/6/bizes/1201254/items/7897484?area=pll&entry=pll&fbclid=PAb21jcAUUAXBjbGNrAhOIKGV4dG4DYWVtAjEwAAGmqiuZCxfN75n2HqwN8G5Jf8MVuLz2dHiXYUIUUzGuVLZpPlQjja3MvbXl_aem_wQIDFQI5CMD5rQV_zMIV3w&lang=ko&startDate=2026-09-14&theme=place",
  },
];

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
