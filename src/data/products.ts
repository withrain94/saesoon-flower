import type { ProductCategoryId } from "@/types/reservation";

/**
 * 상품 데이터 (금액·사진·순위). 화면에 보이는 이름·설명 문구는 언어별 파일(src/i18n/ko.ts 등)의
 * categories / products 에 있다 — 상품을 추가하면 타입 오류가 각 언어 파일의 빠진 곳을 알려준다.
 */
export type Product = {
  /** 고유 id — 예: "bouquet-60000" (금액이 같은 꽃다발·꽃바구니를 구분) */
  id: string;
  category: ProductCategoryId;
  price: number;
  /** 카테고리 안 인기 순위 */
  rank?: number;
  /** 대표 사진 인덱스 */
  cover: number;
  images: string[];
};

export type ProductCategory = {
  id: ProductCategoryId;
  /** 첫 화면 입구 카드 사진 */
  thumbnail: string;
  /** 신청서에서 "원하는 색감"을 고르는 상품인지 */
  colorChoice: boolean;
  /** 상품이 하나뿐인 종류 — 사진을 먼저 크게 보여주는 화면 (호접난) */
  featured: boolean;
  /** 가장 낮은 금액 (원) */
  startingPrice: number;
  products: Product[];
  /**
   * 기간 한정 종류 — 받는 날이 이 날짜(포함)까지인 예약만 되고, 이 날짜가 지나면(한국 시각) 탭·입구 카드가 사라짐.
   * 규칙은 lib/salePeriod.ts. 없으면 연중 판매
   */
  lastDate?: string;
  /** 졸업시즌 등 최소 금액 규칙(minPricePeriods)에서 빠지는 종류 */
  minPriceExempt?: boolean;
};

type CategoryInfo<C extends ProductCategoryId> = Omit<ProductCategory, "id" | "products" | "startingPrice"> & {
  id: C;
};

/** public/flowers/ 안의 파일명 목록 → 경로 */
const photos = (files: string[]) => files.map((file) => `/flowers/${file}`);

const range = (prefix: string, count: number, ext = "jpg") =>
  Array.from({ length: count }, (_, i) => `${prefix}-${String(i + 1).padStart(2, "0")}.${ext}`);

type ProductSeed<P extends number> = Omit<Product, "id" | "category" | "price"> & { price: P };

/** id를 "종류-금액" 글자 그대로의 타입으로 만들어, 언어 파일에서 빠진 상품 문구를 타입 오류로 잡음 */
function defineCategory<const C extends ProductCategoryId, const P extends number>(
  info: CategoryInfo<C>,
  seeds: ProductSeed<P>[],
) {
  return {
    ...info,
    startingPrice: Math.min(...seeds.map((seed) => seed.price)),
    products: seeds.map((seed) => ({
      ...seed,
      id: `${info.id}-${seed.price}` as `${C}-${P}`,
      category: info.id,
    })),
  } satisfies ProductCategory;
}

const bouquet = defineCategory(
  {
    id: "bouquet",
    thumbnail: "/flowers/bouquet-100000-16.jpg",
    colorChoice: true,
    featured: false,
  },
  [
    {
      price: 50000,
      cover: 0,
      images: photos([
        "bouquet-50000-15.jpg",
        "bouquet-50000-14.jpg",
        "bouquet-50000-13.jpg",
        "bouquet-50000-01.jpg",
        "bouquet-50000-05.jpg",
        "bouquet-50000-03.jpg",
        "bouquet-50000-07.jpg",
        "bouquet-50000-17.jpg",
      ]),
    },
    {
      price: 60000,
      rank: 2,
      cover: 0,
      images: photos([
        "bouquet-60000-18.jpg",
        "bouquet-60000-03.jpg",
        "bouquet-60000-01.jpg",
        "bouquet-60000-14.jpg",
        "bouquet-60000-09.jpg",
        "bouquet-60000-12.jpg",
        "bouquet-60000-10.jpg",
      ]),
    },
    {
      price: 70000,
      rank: 5,
      cover: 1,
      images: photos([
        "bouquet-70000-01.jpg",
        "bouquet-70000-02.jpg",
        "bouquet-70000-03.jpg",
        "bouquet-70000-04.jpg",
        "bouquet-70000-05.jpg",
        "bouquet-70000-06.jpg",
        "bouquet-70000-10.jpg",
        "bouquet-70000-11.jpg",
      ]),
    },
    {
      price: 80000,
      rank: 1,
      cover: 2,
      images: photos([
        "bouquet-80000-01.jpg",
        "bouquet-80000-03.jpg",
        "bouquet-80000-04.jpg",
        "bouquet-80000-05.jpg",
        "bouquet-80000-06.jpg",
        "bouquet-80000-20.jpg",
        "bouquet-80000-17.jpg",
        "bouquet-80000-19.jpg",
      ]),
    },
    {
      price: 90000,
      cover: 2,
      images: photos([
        "bouquet-90000-01.jpg",
        "bouquet-90000-02.jpg",
        "bouquet-90000-03.jpg",
        "bouquet-90000-04.jpg",
        "bouquet-90000-05.jpg",
        "bouquet-90000-09.jpg",
        "bouquet-90000-10.jpg",
        "bouquet-90000-11.jpg",
      ]),
    },
    {
      price: 100000,
      rank: 3,
      cover: 0,
      images: photos([
        "bouquet-100000-01.jpg",
        "bouquet-100000-02.jpg",
        "bouquet-100000-04.jpg",
        "bouquet-100000-08.jpg",
        "bouquet-100000-11.jpg",
        "bouquet-100000-16.jpg",
        "bouquet-100000-10.jpg",
        "bouquet-100000-13.jpg",
      ]),
    },
    {
      price: 150000,
      rank: 4,
      cover: 4,
      images: photos([
        "bouquet-150000-01.jpg",
        "bouquet-150000-02.jpg",
        "bouquet-150000-03.jpg",
        "bouquet-150000-04.jpg",
        "bouquet-150000-06.jpg",
        "bouquet-150000-07.jpg",
        "bouquet-150000-05.jpg",
        "bouquet-150000-08.jpg",
      ]),
    },
    {
      price: 200000,
      cover: 1,
      images: photos([
        "bouquet-200000-01.jpg",
        "bouquet-200000-02.jpg",
        "bouquet-200000-03.jpg",
        "bouquet-200000-05.jpg",
        "bouquet-200000-06.jpg",
        "bouquet-200000-04.jpg",
      ]),
    },
    {
      price: 300000,
      cover: 0,
      images: photos([
        "bouquet-300000-03.jpg",
        "bouquet-300000-02.jpg",
        "bouquet-300000-01.jpg",
      ]),
    },
  ],
);

const basket = defineCategory(
  {
    id: "basket",
    thumbnail: "/flowers/basket-150000-02.jpg",
    colorChoice: true,
    featured: false,
  },
  [
    {
      price: 70000,
      rank: 4,
      cover: 1,
      images: photos([
        "basket-70000-01.jpg",
        "basket-70000-02.jpg",
        "basket-70000-03.jpg",
        "basket-70000-04.jpg",
        "basket-70000-05.jpg",
        "basket-70000-06.jpg",
        "basket-70000-08.jpg",
        "basket-70000-11.jpg",
      ]),
    },
    {
      price: 80000,
      rank: 3,
      cover: 0,
      images: photos([
        "basket-80000-27.jpg",
        "basket-80000-28.jpg",
        "basket-80000-29.jpg",
        "basket-80000-30.jpg",
        "basket-80000-31.jpg",
        "basket-80000-32.jpg",
        "basket-80000-33.jpg",
        "basket-80000-34.jpg",
      ]),
    },
    {
      price: 100000,
      rank: 1,
      cover: 0,
      images: photos([
        "basket-80000-26.jpg",
        "basket-100000-01.jpg",
        "basket-100000-03.jpg",
        "basket-100000-37.jpg",
        "basket-100000-38.jpg",
        "basket-100000-36.jpg",
      ]),
    },
    {
      price: 150000,
      rank: 2,
      cover: 0,
      images: photos([
        "basket-150000-01.jpg",
        "basket-150000-02.jpg",
        "basket-150000-03.jpg",
        "basket-150000-04.jpg",
        "basket-150000-05.jpg",
        "basket-100000-02.jpg",
        "basket-150000-12.jpg",
        "basket-150000-13.jpg",
      ]),
    },
    {
      price: 200000,
      cover: 0,
      images: photos(range("basket-200000", 6)),
    },
    {
      price: 300000,
      cover: 0,
      images: photos(range("basket-300000", 7)),
    },
  ],
);

const orchid = defineCategory(
  {
    id: "orchid",
    thumbnail: "/flowers/orchid-120000-01.jpg",
    colorChoice: false,
    featured: true,
  },
  [
    {
      price: 120000,
      cover: 0,
      images: photos([
        "orchid-120000-01.jpg",
        "orchid-120000-11.jpg",
        "orchid-120000-02.jpg",
        "orchid-120000-08.jpg",
        "orchid-120000-04.jpg",
        "orchid-120000-05.jpg",
        "orchid-120000-09.jpg",
        "orchid-120000-10.jpg",
        "orchid-120000-12.jpg",
      ]),
    },
  ],
);

/**
 * 금액이 같은 상품이 여러 개인 종류(치이카와 꽃다발 — 캐릭터마다 8만원)는 금액 대신 key로 id를 만든다.
 * 예: "doll-chiikawa"
 */
function defineKeyedCategory<const C extends ProductCategoryId, const K extends string>(
  info: CategoryInfo<C>,
  seeds: (Omit<Product, "id" | "category"> & { key: K })[],
) {
  return {
    ...info,
    startingPrice: Math.min(...seeds.map((seed) => seed.price)),
    products: seeds.map(({ key, ...seed }) => ({
      ...seed,
      id: `${info.id}-${key}` as `${C}-${K}`,
      category: info.id,
    })),
  } satisfies ProductCategory;
}

/**
 * 탭 "초콜릿 꽃다발&인형꽃다발" (2026-11-17 사용자 요청, "치이카와 꽃다발"에서 바꿈 — 패키지 상품 탭)
 * 치이카와(먼작귀) 꽃다발이 위, 초콜릿 꽃다발이 아래. id는 저장된 예약 때문에 "doll" 그대로. 사진은 매장 예시 1장씩
 */
const doll = defineKeyedCategory(
  {
    id: "doll",
    thumbnail: "/flowers/doll-trio-01.jpg",
    colorChoice: true,
    featured: false,
  },
  [
    { key: "chiikawa", price: 80000, cover: 0, images: photos(["doll-chiikawa-01.jpg"]) },
    { key: "hachiware", price: 80000, cover: 0, images: photos(["doll-hachiware-01.jpg"]) },
    { key: "usagi", price: 80000, cover: 0, images: photos(["doll-usagi-01.jpg"]) },
    { key: "trio", price: 100000, cover: 0, images: photos(["doll-trio-01.jpg"]) },
    // 하치와레 + 초콜릿(해피히포·페레로로쉐) 꽃다발 (2026-11-21 사용자 요청 — 제목·금액 사용자, 설명 Claude)
    { key: "hachiware-snack", price: 90000, cover: 0, images: photos(["doll-hachiware-snack-01.jpg"]) },
    // 치이카와·하치와레·우사기 셋 + 크림 포장 축하 꽃다발 (2026-11-22 사용자 요청 — 제목·금액 사용자, 설명 Claude)
    { key: "trio-celebrate", price: 110000, cover: 0, images: photos(["doll-trio-celebrate-01.jpg"]) },
    // 초콜릿 꽃다발 패키지 (2026-11-17 사용자 요청 — 주문 제작했던 꽃다발을 패키지로, 치이카와 아래)
    // 금액 = 8만원 꽃다발 + 초콜릿 단품 금액(해피히포 1,500·페레로로쉐 3,000, 사용자 확인), 실바핑크는 사용자가 정한 18만원
    { key: "choco-hippo15", price: 102500, cover: 0, images: photos(["doll-choco-hippo15-01.jpg"]) },
    { key: "choco-hippo20", price: 110000, cover: 0, images: photos(["doll-choco-hippo20-01.jpg"]) },
    { key: "choco-ferrero10", price: 110000, cover: 0, images: photos(["doll-choco-ferrero10-01.jpg"]) },
    { key: "choco-ferrero15", price: 125000, cover: 0, images: photos(["doll-choco-ferrero15-01.jpg"]) },
    { key: "choco-ferrero20", price: 140000, cover: 0, images: photos(["doll-choco-ferrero20-01.jpg"]) },
    { key: "choco-silvapink", price: 180000, cover: 0, images: photos(["doll-choco-silvapink-01.jpg"]) },
  ],
);

/**
 * 탭 "크리스마스 식물트리" (2026-11-17 사용자 요청) — 네이버 예약과 같은 상품·금액.
 * 받는 날 12/28까지만, 12/29부터 탭이 사라짐. 졸업시즌 6만원 규칙에서 빠짐(사용자 결정). 사진은 사용자가 준 원본 1장씩
 */
const xmastree = defineKeyedCategory(
  {
    id: "xmastree",
    thumbnail: "/flowers/xmastree-araucaria-01.jpg",
    colorChoice: false,
    featured: false,
    lastDate: "2026-12-28",
    minPriceExempt: true,
  },
  [
    { key: "araucaria", price: 35000, cover: 0, images: photos(["xmastree-araucaria-01.jpg"]) },
    { key: "cypress", price: 35000, cover: 0, images: photos(["xmastree-cypress-01.jpg"]) },
    { key: "poinsettia-mini", price: 12000, cover: 0, images: photos(["xmastree-poinsettia-mini-01.jpg"]) },
    { key: "poinsettia-gift", price: 25000, cover: 0, images: photos(["xmastree-poinsettia-gift-01.jpg"]) },
  ],
);

export const productCategories: ProductCategory[] = [bouquet, basket, orchid, doll, xmastree];

/** 모든 상품 id — "bouquet-50000" | ... | "doll-chiikawa" (언어 파일의 products 키) */
export type ProductId = (typeof bouquet | typeof basket | typeof orchid | typeof doll | typeof xmastree)["products"][number]["id"];


export const allProducts: Product[] = productCategories.flatMap((category) => category.products);

export function getCategory(id: ProductCategoryId): ProductCategory {
  const category = productCategories.find((item) => item.id === id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}

/** 목록 끝 "다음 종류 보러 가기"용 — 마지막 다음은 처음 */
export function getNextCategory(id: ProductCategoryId): ProductCategory {
  const index = productCategories.findIndex((item) => item.id === id);
  return productCategories[(index + 1) % productCategories.length];
}

/** 인기 순위가 있는 상품을 먼저, 나머지는 금액순 */
export function sortProductsByRank(products: Product[]) {
  return [...products].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
}
