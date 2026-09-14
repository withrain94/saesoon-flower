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
    thumbnail: "/flowers/bouquet-100000-16.png",
    colorChoice: true,
    featured: false,
  },
  [
    {
      price: 50000,
      rank: 3,
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
      rank: 1,
      cover: 0,
      images: photos([
        "bouquet-60000-18.jpg",
        "bouquet-60000-03.jpg",
        "bouquet-60000-01.jpg",
        "bouquet-60000-02.jpg",
        "bouquet-60000-14.jpg",
        "bouquet-60000-09.jpg",
        "bouquet-60000-12.jpg",
        "bouquet-60000-10.jpg",
      ]),
    },
    {
      price: 70000,
      cover: 1,
      images: photos([
        "bouquet-70000-01.png",
        "bouquet-70000-02.png",
        "bouquet-70000-03.png",
        "bouquet-70000-04.png",
        "bouquet-70000-05.png",
        "bouquet-70000-06.png",
        "bouquet-70000-10.jpg",
        "bouquet-70000-11.jpg",
      ]),
    },
    {
      price: 80000,
      rank: 5,
      cover: 2,
      images: photos([
        "bouquet-80000-01.png",
        "bouquet-80000-03.jpg",
        "bouquet-80000-04.jpg",
        "bouquet-80000-05.jpg",
        "bouquet-80000-06.jpg",
        "bouquet-80000-20.png",
        "bouquet-80000-17.jpg",
        "bouquet-80000-19.jpg",
      ]),
    },
    {
      price: 90000,
      cover: 2,
      images: photos([
        "bouquet-90000-01.png",
        "bouquet-90000-02.png",
        "bouquet-90000-03.png",
        "bouquet-90000-04.jpg",
        "bouquet-90000-05.jpg",
        "bouquet-90000-09.png",
        "bouquet-90000-07.jpg",
        "bouquet-90000-08.jpg",
      ]),
    },
    {
      price: 100000,
      rank: 2,
      cover: 0,
      images: photos([
        "bouquet-100000-01.png",
        "bouquet-100000-02.png",
        "bouquet-100000-04.jpg",
        "bouquet-100000-08.jpg",
        "bouquet-100000-11.jpg",
        "bouquet-100000-16.png",
        "bouquet-100000-10.jpg",
        "bouquet-100000-13.jpg",
      ]),
    },
    {
      price: 150000,
      rank: 4,
      cover: 4,
      images: photos([
        "bouquet-150000-01.png",
        "bouquet-150000-02.png",
        "bouquet-150000-03.jpg",
        "bouquet-150000-04.jpg",
        "bouquet-150000-06.jpg",
        "bouquet-150000-07.jpg",
        "bouquet-150000-05.jpg",
      ]),
    },
    {
      price: 200000,
      cover: 1,
      images: photos([
        "bouquet-200000-01.png",
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
      rank: 2,
      cover: 0,
      images: photos([
        "basket-80000-19.jpg",
        "basket-80000-16.jpg",
        "basket-80000-20.jpg",
        "basket-80000-22.jpg",
        "basket-80000-24.jpg",
        "basket-80000-25.jpg",
        "basket-80000-13.jpg",
        "basket-80000-21.jpg",
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
        "basket-100000-06.jpg",
        "basket-100000-07.jpg",
        "basket-100000-20.jpg",
        "basket-100000-26.jpg",
        "basket-100000-36.jpg",
      ]),
    },
    {
      price: 150000,
      rank: 3,
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
      images: photos(range("basket-300000", 4)),
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

export const productCategories: ProductCategory[] = [bouquet, basket, orchid];

/** 모든 상품 id — "bouquet-50000" | ... (언어 파일의 products 키) */
export type ProductId = (typeof bouquet | typeof basket | typeof orchid)["products"][number]["id"];


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
