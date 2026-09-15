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
