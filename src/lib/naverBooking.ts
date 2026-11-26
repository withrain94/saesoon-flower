import { shoppingBag } from "@/data/chocolates";
import { getEventOn } from "@/data/events";
import { allProducts, getCategory, type Product, type ProductId } from "@/data/products";
import { ko } from "@/i18n/ko";
import { formatAdminItemName } from "@/lib/adminFormat";
import type {
  ProductCategoryId,
  ReceiveMethod,
  ReservationDelivery,
  ReservationItem,
  ReservationRequest,
} from "@/types/reservation";

/**
 * 네이버 예약 옮겨 넣기 (2026-11-26 사용자 요청) — 관리자가 네이버 예약 상세 화면 글을 통째로 붙여넣으면
 * parseNaverBooking이 칸을 채우고(틀린 곳은 관리자가 고침), 저장할 때 buildNaverReservationRequest가 다시 검사해
 * 사이트 예약과 같은 모양(ReservationRequest)으로 만든다.
 * 사용자 결정: 결제는 네이버에서 끝났으니 "입금·결제 확인"으로 저장, 자동 문자는 보내지 않음, "네이버" 표시.
 */

export type NaverDraftItem = {
  /** 맞는 사이트 상품 id — 못 찾았으면 "" (관리자가 골라야 저장됨) */
  productId: string;
  quantity: number;
  /** 네이버 화면의 옵션 이름 그대로 */
  label: string;
};

/** 관리자 화면에서 고치는 칸 */
export type NaverDraft = {
  bookingNumber: string;
  ordererName: string;
  ordererPhone: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:00" */
  time: string;
  items: NaverDraftItem[];
  shoppingBags: number;
  receiveMethod: ReceiveMethod;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  /** 보내는 분 이름 또는 팀 — 특별한 날 토퍼 */
  sender: string;
  /** 수료 과정 — 장기과정 수료식 날만 */
  course: string;
  /** 특별한 날 행사용 꽃인지 (토퍼 넣기) */
  forEvent: boolean;
  /** 원하는 색상 답 */
  colorNote: string;
  requestNote: string;
  paidAmount: number;
  paymentLabel: string;
};

export const NAVER_MAX_QUANTITY = 20;
const TEXT_MAX = 300;
const NOTE_MAX = 1500;

/** 고를 수 있는 사이트 상품 — 관리자 화면 선택 칸 */
export const naverProductChoices = allProducts.map((product) => ({
  id: product.id,
  label: formatAdminItemName({ productId: product.id, category: product.category, price: product.price }),
}));

const PHONE_PATTERN = /(?:\+?82[-\s.]?)?0?1[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g;

function digits(text: string) {
  return text.replace(/\D/g, "");
}

function compact(text: string) {
  return text.replace(/\s+/g, "");
}

function categoryHint(productLine: string): ProductCategoryId | null {
  if (productLine.includes("꽃바구니") || /바스켓/.test(productLine)) return "basket";
  if (productLine.includes("호접난")) return "orchid";
  if (productLine.includes("트리") || productLine.includes("포인세티아")) return "xmastree";
  if (productLine.includes("꽃다발")) return "bouquet";
  return null;
}

/** 네이버 옵션 이름 → 사이트 상품 (제목이 네이버와 같음). 제목이 조금 달라도 머리표(BEST)·TOP2))와 종류로 찾음 */
export function matchNaverProduct(label: string, hint: ProductCategoryId | null): Product | null {
  const key = compact(label);
  const titled = allProducts.filter((product) => compact(ko.products[product.id as ProductId].title) === key);
  const exact = titled.find((product) => product.category === hint) ?? (titled.length === 1 ? titled[0] : undefined);
  if (exact) return exact;
  if (!hint) return null;
  const rankMatch = /^(BEST|TOP\s*(\d))\)/i.exec(label.trim());
  if (!rankMatch) return null;
  const rank = rankMatch[2] ? Number(rankMatch[2]) : 1;
  return getCategory(hint).products.find((product) => product.rank === rank) ?? null;
}

/** "2026. 11. 27.(금) 오전 7:00" → ["2026-11-27", "07:00"] */
function parseDateTime(text: string): [string, string] {
  const match = /(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?[^오]*?(오전|오후)?\s*(\d{1,2}):(\d{2})/.exec(text);
  if (!match) return ["", ""];
  const [, year, month, day, half, hourText] = match;
  let hour = Number(hourText);
  if (half === "오후" && hour < 12) hour += 12;
  if (half === "오전" && hour === 12) hour = 0;
  const pad = (value: string | number) => String(value).padStart(2, "0");
  return [`${year}-${pad(month)}-${pad(day)}`, `${pad(hour)}:00`];
}

function amountOf(text: string | undefined) {
  return text ? Number(digits(text)) || 0 : 0;
}

/** "BEST)이벤트형 꽃바구니 1" → ["BEST)이벤트형 꽃바구니", 1] */
function splitOption(line: string): [string, number] {
  const match = /^(.*?)\s+(\d+)\s*(?:개)?$/.exec(line);
  return match ? [match[1].trim(), Number(match[2])] : [line.trim(), 1];
}

const SECTION_END = /^(요청사항|쿠폰|유입경로|예약자입력정보|결제정보)/;
const QUESTION = /^(보내는\s*분|원하는\s*색|배송\s*정보|받는\s*분\s*정보)|[?？]/;

/** 붙여넣은 글에서 "key<탭 또는 공백>value" 한 줄 값 */
function valueOf(lines: string[], key: string) {
  for (const line of lines) {
    if (line === key) continue;
    if (line.startsWith(key)) {
      const rest = line.slice(key.length);
      if (/^[\t ]/.test(rest)) return rest.trim();
    }
  }
  return "";
}

function findPhone(text: string, exclude: string) {
  for (const match of text.matchAll(PHONE_PATTERN)) {
    const phone = match[0].trim();
    if (digits(phone) !== digits(exclude)) return phone;
  }
  return "";
}

/** "고급(4급) 과정" · "여성리더 과정" — 못 찾으면 "" */
function findCourse(...texts: string[]) {
  for (const text of texts) {
    const match = /([가-힣A-Za-z0-9]+(?:\([^)]*\))?)\s?과정/.exec(text);
    if (match) return `${match[1]} 과정`;
  }
  return "";
}

/** 받는 분 칸 — "받는분: 홍길동(010-…) 주소: …" / "받는분: 홍길동 연락처: 010-… 주소: …" / 주소만 */
function parseRecipient(text: string, ordererPhone: string, requestNote: string) {
  const nameMatch = /받는\s*분\s*[:：]\s*([^(,，/\d\s]+(?:\s[^(,，/\d\s:：]+)?)/.exec(text);
  let name = nameMatch ? nameMatch[1].trim() : "";
  name = name.replace(/\s*(연락처|주소|전화).*$/, "");
  const phone = findPhone(text, ordererPhone) || findPhone(requestNote, ordererPhone);
  const addressMatch = /주소\s*[:：]\s*([\s\S]+)$/.exec(text);
  const address = addressMatch ? addressMatch[1].trim() : nameMatch ? "" : text.trim();
  return { name, phone, address };
}

/** 네이버 예약 상세 화면 글 → 고칠 수 있는 칸 (못 읽은 칸은 빈 값) */
export function parseNaverBooking(text: string): NaverDraft {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const ordererPhone = valueOf(lines, "전화번호");
  const productLine = valueOf(lines, "상품");
  const hint = categoryHint(productLine);
  const [date, time] = parseDateTime(valueOf(lines, "이용일시"));
  const requestNote = valueOf(lines, "요청사항");

  // 옵션: "옵션" 줄 다음부터 요청사항·쿠폰 줄 전까지 "이름 수량"
  const items: NaverDraftItem[] = [];
  let shoppingBags = 0;
  const optionStart = lines.findIndex((line) => line === "옵션" || line.startsWith("옵션\t"));
  if (optionStart >= 0) {
    const first = lines[optionStart].slice(2).trim();
    const optionLines = first ? [first] : [];
    for (const line of lines.slice(optionStart + 1)) {
      if (SECTION_END.test(line)) break;
      optionLines.push(line);
    }
    for (const line of optionLines) {
      const [label, quantity] = splitOption(line);
      if (label.includes("쇼핑백")) {
        shoppingBags += quantity;
        continue;
      }
      const product = matchNaverProduct(label, hint);
      items.push({ productId: product?.id ?? "", quantity, label });
    }
  }

  // 예약자입력정보: 질문 줄 다음 줄들이 답 (결제정보 전까지)
  const answers: { question: string; answer: string }[] = [];
  const infoStart = lines.indexOf("예약자입력정보");
  if (infoStart >= 0) {
    for (const line of lines.slice(infoStart + 1)) {
      if (line.startsWith("결제정보")) break;
      if (QUESTION.test(line)) answers.push({ question: line, answer: "" });
      else if (answers.length > 0) {
        const last = answers[answers.length - 1];
        last.answer = last.answer ? `${last.answer} ${line}` : line;
      }
    }
  }
  const answerOf = (pattern: RegExp) => answers.find((item) => pattern.test(item.question))?.answer ?? "";
  const sender = answerOf(/^보내는\s*분/);
  const colorNote = answerOf(/^원하는\s*색/);
  const deliveryText = answerOf(/^(배송\s*정보|받는\s*분\s*정보)/);
  const otherAnswers = answers
    .filter((item) => !/^(보내는\s*분|원하는\s*색|배송\s*정보|받는\s*분\s*정보)/.test(item.question) && item.answer)
    .map((item) => `${item.question.replace(/\(.*$/, "").trim()}: ${item.answer}`);

  const recipient = parseRecipient(deliveryText, ordererPhone, requestNote);
  const event = date ? getEventOn(date) : undefined;

  return {
    bookingNumber: digits(valueOf(lines, "예약번호")),
    ordererName: valueOf(lines, "예약자"),
    ordererPhone,
    date,
    time,
    items,
    shoppingBags,
    receiveMethod: deliveryText ? "delivery" : "pickup",
    recipientName: recipient.name,
    recipientPhone: recipient.phone,
    recipientAddress: recipient.address,
    sender,
    course: event?.topperAsksCourse ? findCourse(requestNote, deliveryText) : "",
    forEvent: !!event && event.topperCategories.length > 0,
    colorNote,
    requestNote: [requestNote, ...otherAnswers].filter(Boolean).join("\n"),
    paidAmount: amountOf(valueOf(lines, "실결제금액")) || amountOf(valueOf(lines, "결제금액")),
    paymentLabel: valueOf(lines, "결제수단"),
  };
}

export type NaverBuildResult = { ok: true; request: ReservationRequest } | { ok: false; error: string };

const clip = (text: unknown, max = TEXT_MAX) => String(text ?? "").trim().slice(0, max);

/** 관리자가 고친 칸 → 저장할 예약 (서버에서 다시 검사). 시간·마감 규칙은 보지 않음 — 이미 네이버에서 받은 예약 */
export function buildNaverReservationRequest(draft: NaverDraft, submittedAt: string): NaverBuildResult {
  const bookingNumber = digits(clip(draft.bookingNumber));
  if (!bookingNumber) return { ok: false, error: "네이버 예약번호를 적어 주세요." };
  const ordererName = clip(draft.ordererName, 40);
  if (!ordererName) return { ok: false, error: "예약자 이름을 적어 주세요." };
  const ordererPhone = clip(draft.ordererPhone, 30);
  if (digits(ordererPhone).length < 9) return { ok: false, error: "예약자 연락처를 확인해 주세요." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date ?? "") || Number.isNaN(Date.parse(draft.date))) {
    return { ok: false, error: "받는 날짜를 확인해 주세요." };
  }
  if (!/^([01]\d|2[0-3]):00$/.test(draft.time ?? "")) return { ok: false, error: "받는 시간을 골라 주세요." };

  const quantities = new Map<string, number>();
  for (const item of draft.items ?? []) {
    const product = allProducts.find((candidate) => candidate.id === item.productId);
    if (!product) return { ok: false, error: `"${item.label || "상품"}"에 맞는 상품을 골라 주세요.` };
    const quantity = Math.floor(Number(item.quantity));
    if (!(quantity >= 1 && quantity <= NAVER_MAX_QUANTITY)) return { ok: false, error: "상품 수량을 확인해 주세요." };
    quantities.set(product.id, (quantities.get(product.id) ?? 0) + quantity);
  }
  if (quantities.size === 0) return { ok: false, error: "상품을 하나 이상 넣어 주세요." };
  const bags = Math.floor(Number(draft.shoppingBags) || 0);
  if (bags < 0 || bags > NAVER_MAX_QUANTITY) return { ok: false, error: "쇼핑백 수량을 확인해 주세요." };

  const receiveMethod: ReceiveMethod = draft.receiveMethod === "delivery" ? "delivery" : "pickup";
  const address = receiveMethod === "delivery" ? clip(draft.recipientAddress) : "";
  if (receiveMethod === "delivery" && !address) return { ok: false, error: "배송이면 배송지를 적어 주세요." };
  const paidAmount = Math.floor(Number(draft.paidAmount) || 0);
  if (paidAmount < 0) return { ok: false, error: "결제 금액을 확인해 주세요." };

  const event = getEventOn(draft.date);
  const forEvent = !!event && event.topperCategories.length > 0 && !!draft.forEvent;
  const recipientName = clip(draft.recipientName, 40);
  const recipientPhone = clip(draft.recipientPhone, 30);
  const sender = clip(draft.sender, 40);
  // 토퍼가 없는 예약이면 보내는 분은 메시지 칸 앞에 적어 둠
  const requestNote = [!forEvent && sender ? `보내는 분: ${sender}` : "", clip(draft.requestNote, NOTE_MAX)]
    .filter(Boolean)
    .join("\n");
  const course = clip(draft.course, 40);

  const items: ReservationItem[] = [];
  const deliveries: ReservationDelivery[] = [];
  for (const [productId, quantity] of quantities) {
    const product = allProducts.find((candidate) => candidate.id === productId)!;
    items.push({ productId, category: product.category, price: product.price, quantity });
    const topper = forEvent && !!event && event.topperCategories.includes(product.category);
    for (let unitNo = 1; unitNo <= quantity; unitNo += 1) {
      deliveries.push({
        productId,
        category: product.category,
        price: product.price,
        unitNo,
        recipientName,
        recipientPhone,
        recipientAddress: product.category === "orchid" ? "" : address,
        topperSender: topper ? sender : "",
        topperCourse: topper && event?.topperAsksCourse ? course : "",
        messageType: requestNote ? "memo" : "none",
        memo: requestNote ? `[네이버 요청사항] ${requestNote}` : "",
        ribbonLeft: "",
        ribbonRight: "",
        blackboard: "",
        blackboardPreset: "",
      });
    }
  }

  const chocolates = bags > 0 ? [{ chocolateId: shoppingBag.id, price: shoppingBag.price, quantity: bags }] : [];
  const totalPrice =
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    chocolates.reduce((sum, chocolate) => sum + chocolate.price * chocolate.quantity, 0);
  const colorNote = clip(draft.colorNote);
  const hasOrchid = items.some((item) => item.category === "orchid");

  return {
    ok: true,
    request: {
      items,
      deliveries,
      chocolates,
      totalQuantity: deliveries.length,
      totalPrice,
      date: draft.date,
      time: draft.time,
      ordererName,
      ordererPhone,
      color: colorNote ? "other" : "",
      colorOther: colorNote,
      receiveMethod,
      forEvent,
      orchidDelivery: hasOrchid
        ? receiveMethod === "delivery"
          ? { method: "restaurant", restaurant: address, reservationName: recipientName }
          : { method: "pickup", restaurant: "", reservationName: "" }
        : null,
      // 결제는 네이버에서 끝남 — 표시는 naver 칸으로 (describePayment)
      paymentMethod: "card",
      paypalEmail: "",
      paypalAmount: 0,
      cashReceiptType: "none",
      cashReceiptNumber: "",
      cardKind: "keyin",
      tossPayment: false,
      cardPayer: "same",
      cardPayerContact: "",
      documents: [],
      documentCompany: "",
      documentBusinessNumber: "",
      submittedAt,
      privacyAgreed: true,
      locale: "ko",
      naver: { bookingNumber, paidAmount, paymentLabel: clip(draft.paymentLabel, 60), requestNote },
    },
  };
}
