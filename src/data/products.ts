import type { ProductCategoryId } from "@/types/reservation";

export type Product = {
  /** 고유 id — 예: "bouquet-60000" (금액이 같은 꽃다발·꽃바구니를 구분) */
  id: string;
  category: ProductCategoryId;
  price: number;
  /** "6만원" */
  label: string;
  /** 네이버 예약 옵션명 스타일 제목 */
  title: string;
  points: string[];
  /** 카테고리 안 인기 순위 */
  rank?: number;
  /** 대표 사진 인덱스 */
  cover: number;
  images: string[];
};

export type ProductCategory = {
  id: ProductCategoryId;
  name: string;
  /** 첫 화면 입구 카드 설명 */
  tagline: string;
  /** 첫 화면 입구 카드 사진 */
  thumbnail: string;
  popularNote: string;
  /** 신청서에서 "원하는 색감"을 고르는 상품인지 */
  colorChoice: boolean;
  /** 상품 목록 위 "꼭 확인해 주세요" 안내 문단 */
  notice?: string[];
  /** 가장 낮은 금액 (원) */
  startingPrice: number;
  products: Product[];
};

type CategoryInfo = Omit<ProductCategory, "products" | "startingPrice">;

/** public/flowers/ 안의 파일명 목록 → 경로 */
const photos = (files: string[]) => files.map((file) => `/flowers/${file}`);

const range = (prefix: string, count: number, ext = "jpg") =>
  Array.from({ length: count }, (_, i) => `${prefix}-${String(i + 1).padStart(2, "0")}.${ext}`);

type ProductSeed = Omit<Product, "id" | "category" | "label">;

function defineCategory(info: CategoryInfo, seeds: ProductSeed[]): ProductCategory {
  return {
    ...info,
    startingPrice: Math.min(...seeds.map((seed) => seed.price)),
    products: seeds.map((seed) => ({
      ...seed,
      id: `${info.id}-${seed.price}`,
      category: info.id,
      label: `${seed.price / 10000}만원`,
    })),
  };
}

const bouquet = defineCategory(
  {
    id: "bouquet",
    name: "꽃다발",
    tagline: "손에 들고 전하는 선물",
    thumbnail: "/flowers/bouquet-100000-16.png",
    popularNote: "인기 금액: 6만원 · 10만원 · 5만원 · 15만원 · 8만원 순",
    colorChoice: true,
  },
  [
    {
      price: 50000,
      title: "TOP3) 작지만 예쁜꽃으로",
      points: [
        "작아도 괜찮은데, 예쁜 메인 꽃이 주로 들어가면 좋겠어요.",
        "부담스럽지 않은 사이즈로 선물하고 싶어요.",
        "간편하게 이동하고 싶어요.",
      ],
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
      title: "BEST) 꽃다발다운 꽃다발",
      points: [
        "너무 크지는 않아도 되는데 받았을 때 기분 좋은 꽃다발을 선물하고 싶어요.",
        "기념일을 예쁘게 기억하고 싶어요.",
        "가장 잘나가는 사이즈로 해주세요.",
      ],
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
      title: "[퀄리티중심] 사이즈보다 퀄리티",
      points: [
        "가장 잘나가는 사이즈에 예쁜 꽃 더 추가해주세요.",
        "사이즈보다 퀄리티가 중요해요.",
        "너무 작지 않았으면 좋겠어요.",
      ],
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
      title: "TOP5) 조금 더 풍성하게",
      points: [
        "풍성한 느낌으로 하고 싶어요.",
        "받았을 때 기분좋은 느낌을 주고 싶어요.",
        "저번보다 더 신경쓰고 싶어요.",
      ],
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
      title: "[기념일] 예쁘고 풍성하게",
      points: [
        "예쁜 꽃으로 풍성하게 하고 싶어요.",
        "메인 꽃을 더 추가하고 싶어요.",
        "꽃을 한아름 안겨주고 싶어요.",
      ],
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
      title: "TOP2) 중요한 날이에요",
      points: [
        "기념일에 감동 주고 싶어요.",
        "프로포즈에 쓰려고해요.",
        "사이즈보다 퀄리티에 신경써주세요.",
      ],
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
      title: "TOP4) 대형꽃다발",
      points: [
        "감탄사가 나오는 사이즈였으면 좋겠어요.",
        "예쁜 꽃을 쓰되 풍성한 느낌이 더 있었으면 좋겠어요.",
        "한번쯤 해보고 싶어요.",
      ],
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
      title: "[이벤트용] 초대형꽃다발",
      points: ["무조건 크게 해주세요.", "초대형 꽃다발 하고 싶어요."],
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
      title: "[프리미엄] 한아름 스페셜 꽃다발",
      points: [
        "꽃 중의 최고라고 하는 웨딩 꽃들로 만드는 스페셜 꽃다발! (계절 꽃을 활용합니다)",
        "당일 상황에 따라 제작이 어려울 수 있으니, 미리 예약하시는 것을 추천합니다.",
        "무조건 크게, 스페셜한 꽃다발 하고 싶어요.",
        "프로포즈 하려고 해요.",
      ],
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
    name: "꽃바구니",
    tagline: "놓아두고 오래 보는 선물",
    thumbnail: "/flowers/basket-150000-02.jpg",
    popularNote: "인기 금액: 10만원 · 8만원 · 15만원 · 7만원 순",
    colorChoice: true,
  },
  [
    {
      price: 70000,
      title: "[일상선물] 베이직 꽃바구니",
      points: ["부담 없이 예쁘게 선물하기 좋은 사이즈", "집들이, 작은 선물, 축하에 잘 어울려요"],
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
      title: "TOP2) 베이직 꽃바구니를 풍성하게",
      points: ["베이직 꽃바구니를 풍성하게 또는 특별한 색감으로"],
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
      title: "BEST) 이벤트형 꽃바구니",
      points: [
        "기념일 선물, 행사용으로 인기 있는 사이즈",
        "생일·연인·부모님 선물로 가장 인기 있는 사이즈",
        "받는 사람이 사진 찍기 좋은 비율",
      ],
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
      title: "TOP3) 이벤트형 꽃바구니를 풍성하게",
      points: ["이벤트 꽃바구니를 풍성하게 또는 특별한 색감으로", "행사·전시·축하에 가장 적합한 풍성도"],
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
      title: "[행사용] 대형 꽃바구니",
      points: ["행사장·전시회·오픈식에서 존재감 있는 크기", "멀리서도 시선 확 끌리는 스타일"],
      cover: 0,
      images: photos(range("basket-200000", 6)),
    },
    {
      price: 300000,
      title: "[프리미엄] 대형 꽃바구니를 풍성하게",
      points: [
        "바구니 자체가 큰 대형 바구니를 풍성하게",
        "대형보다 꽃양이 확연히 많습니다",
        "사진·행사용으로 압도적 사이즈",
      ],
      cover: 0,
      images: photos(range("basket-300000", 4)),
    },
  ],
);

const orchid = defineCategory(
  {
    id: "orchid",
    name: "호접난",
    tagline: "상견례 첫인사 보자기 선물",
    thumbnail: "/flowers/orchid-120000-01.jpg",
    popularNote: "2개 1세트 · 양가에 하나씩 준비해 드려요",
    colorChoice: false,
    notice: [
      "!품종 지정이 불가능한 점 양해 부탁드립니다!",
      "호접난은 매 시즌마다 들어오는 품종이 다르고, 같은 색상이라도 잎의 배치, 꽃망울의 개수, 톤이 조금씩 다릅니다.",
      "그래서 저희는 공산품처럼 똑같은 꽃이 아닌 우리 커플만의 고유한 호접난으로 보내드리는 걸 추구해요.",
      "다만! 색상은 흰색으로 고정 가능합니다.",
    ],
  },
  [
    {
      price: 120000,
      title: "상견례 보자기 호접난 (2개 1세트)",
      points: [
        "단정한 화이트 호접난 + 신랑·신부를 상징하는 핑크·블루 등의 보자기 색상을 디자이너가 선정",
        "양가에 하나씩 드릴 수 있게 2개 1세트로 준비해요",
        "호남각·궁·고궁담 등 전주 상견례 식당 무료배송",
        "선물 후에도 포장을 유지하며 관리 가능한 이중 포장",
      ],
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

/** "꽃다발·꽃바구니·호접난" — 안내 문구용 */
export const categoryNames = productCategories.map((category) => category.name).join("·");

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
