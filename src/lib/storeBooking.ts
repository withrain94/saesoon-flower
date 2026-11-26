import { shoppingBag } from "@/data/chocolates";
import { getEventOn } from "@/data/events";
import { allProducts, type Product } from "@/data/products";
import { NAVER_MAX_QUANTITY, parseRecipients } from "@/lib/naverBooking";
import type {
  PaymentMethod,
  ProductCategoryId,
  ReceiveMethod,
  ReservationDelivery,
  ReservationItem,
  ReservationRequest,
} from "@/types/reservation";

/**
 * 매장 예약 넣기 (2026-11-26 사용자 요청) — 전화·문자·카톡으로 받은 예약을 관리자가 붙여넣으면
 * parseStoreBookings가 칸을 채우고(틀린 곳은 관리자가 고침), 저장할 때 buildStoreReservationRequest가 다시 검사해
 * 사이트 예약과 같은 모양(ReservationRequest)으로 만든다.
 * 사용자 결정: 붙여넣기 + 칸 / 노션 표에 자동으로 올림 / 입금 확인이면 입금 확인 자동 문자(고를 수 있음).
 * 붙여넣는 글은 두 모양: ① 카톡·문자 글(한 건) ② 노션 표 줄(탭으로 나뉜 줄 — 줄마다 꽃 1개, 같은 예약자·날짜는 한 예약으로)
 */

export type StoreDraftItem = { productId: string; quantity: number };

/** 받는 분 — 상품 1개마다 다른 분이면 여러 명 (상품 순서대로, 모자라면 마지막 분을 따라감) */
export type StoreRecipient = { name: string; phone: string; address: string; course: string };

export type StoreDraft = {
  ordererName: string;
  ordererPhone: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:00" */
  time: string;
  items: StoreDraftItem[];
  shoppingBags: number;
  receiveMethod: ReceiveMethod;
  recipients: StoreRecipient[];
  /** 토퍼 보내는 분 이름 또는 팀 (특별한 날 행사 꽃) */
  sender: string;
  forEvent: boolean;
  /** 메시지(메모) — 상품마다 메시지 칸에 들어감 */
  message: string;
  colorNote: string;
  paymentMethod: Extract<PaymentMethod, "bank" | "card">;
  /** 입금·결제 확인됐는지 — 예면 "입금·결제 확인", 아니면 "접수"로 저장 */
  paid: boolean;
  /** 입금 확인 자동 문자를 보낼지 (paid일 때만) */
  sendPaidSms: boolean;
  /** 같은 날 같은 연락처 예약이 있어도 저장 */
  allowDuplicate: boolean;
};

export const STORE_MAX_QUANTITY = NAVER_MAX_QUANTITY;
const TEXT_MAX = 300;
const NOTE_MAX = 1000;

const PHONE = /(?:\+?82[-\s.]?)?0?1[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g;
const digits = (text: string) => text.replace(/\D/g, "");
const pad = (value: number | string) => String(value).padStart(2, "0");

export function emptyStoreDraft(): StoreDraft {
  return {
    ordererName: "",
    ordererPhone: "",
    date: "",
    time: "",
    items: [{ productId: "", quantity: 1 }],
    shoppingBags: 0,
    receiveMethod: "pickup",
    recipients: [{ name: "", phone: "", address: "", course: "" }],
    sender: "",
    forEvent: false,
    message: "",
    colorNote: "",
    paymentMethod: "bank",
    paid: true,
    sendPaidSms: true,
    allowDuplicate: false,
  };
}

/** "2026. 11. 27." · "2026.11.27" · "11/27" · "11월 27일" → "2026-11-27" (연도가 없으면 오늘 기준 다가오는 날) */
export function parseStoreDate(text: string, todayKey: string): string {
  const full = /(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})/.exec(text);
  if (full) return `${full[1]}-${pad(full[2])}-${pad(full[3])}`;
  const short = /(?:^|[^\d])(\d{1,2})\s*(?:\/|월\s*)(\d{1,2})\s*일?/.exec(text);
  if (!short) return "";
  const [year] = todayKey.split("-").map(Number);
  const key = `${year}-${pad(short[1])}-${pad(short[2])}`;
  return key < todayKey ? `${year + 1}-${pad(short[1])}-${pad(short[2])}` : key;
}

/** "오전 8시" · "오후 3시" · "15:00" · "8시" → "HH:00" (특별한 날 시간이 하나뿐이면 그 시간) */
export function parseStoreTime(text: string, date: string): string {
  const half = /(오전|오후|아침|저녁)\s*(\d{1,2})\s*(?::\s*\d{2}|시)/.exec(text);
  if (half) {
    let hour = Number(half[2]);
    if ((half[1] === "오후" || half[1] === "저녁") && hour < 12) hour += 12;
    return `${pad(hour)}:00`;
  }
  const clock = /(?:^|[^\d.])([01]?\d|2[0-3]):([0-5]\d)(?![\d])/.exec(text) ?? /(?:^|[^\d])([01]?\d|2[0-3])\s*시/.exec(text);
  if (clock) return `${pad(clock[1])}:00`;
  const event = date ? getEventOn(date) : undefined;
  return event?.slots.length === 1 ? event.slots[0] : "";
}

function categoryOf(text: string): ProductCategoryId | null {
  if (/꽃바구니|바구니|바스켓/.test(text)) return "basket";
  if (/호접난/.test(text)) return "orchid";
  if (/꽃다발/.test(text)) return "bouquet";
  return null;
}

/** "6만원" · "60,000원" · "60000" → 60000 */
function amountsIn(text: string): number[] {
  const found: number[] = [];
  for (const match of text.matchAll(/(\d+(?:\.\d)?)\s*만\s*원?|(\d{1,3}(?:,\d{3})+|\d{5,6})\s*원?/g)) {
    const value = match[1] ? Math.round(Number(match[1]) * 10000) : Number(digits(match[2]));
    if (value >= 10000) found.push(value);
  }
  return found;
}

function findProduct(category: ProductCategoryId | null, price: number): Product | undefined {
  const candidates = allProducts.filter((product) => product.price === price);
  return candidates.find((product) => product.category === (category ?? "bouquet")) ?? (category ? undefined : candidates[0]);
}

/** 한 줄(또는 한 칸)에서 상품 — 쇼핑백 줄은 빼고 */
function itemsIn(text: string, fallbackCategory: ProductCategoryId | null): StoreDraftItem[] {
  const items: StoreDraftItem[] = [];
  for (const line of text.split(/\n|\+|,(?!\d{3})/)) {
    if (/쇼핑백|총|합계|입금액|결제\s*금액/.test(line)) continue;
    const category = categoryOf(line) ?? fallbackCategory;
    for (const price of amountsIn(line)) {
      const product = findProduct(category, price);
      if (!product) continue;
      const quantity = Number(/(\d+)\s*(?:개|다발|바구니)|[x×]\s*(\d+)/i.exec(line)?.slice(1).find(Boolean) ?? 1);
      items.push({ productId: product.id, quantity: Math.min(Math.max(quantity, 1), STORE_MAX_QUANTITY) });
    }
  }
  return items;
}

function bagsIn(text: string) {
  if (!/쇼핑백/.test(text)) return 0;
  const count = /쇼핑백[^\n\d]*(\d+)\s*개/.exec(text);
  return count ? Number(count[1]) : 1;
}

/** "주문자: 원미옥" 같은 이름표 뒤 값 (연락처는 뺌) */
function labeled(text: string, labels: string): string {
  const match = new RegExp(`(?:${labels})\\s*(?:분|님)?\\s*(?:성함|이름|명)?\\s*[:：)\\]]?\\s*([^\\n]+)`).exec(text);
  return match ? match[1].replace(PHONE, "").replace(/[()/,，·]+\s*$/, "").trim() : "";
}

function courseIn(text: string): string {
  const match = /([가-힣A-Za-z0-9()]+\s?과정)/.exec(text.replace(/(수료|교육|해당|장기)\s?과정/g, ""));
  return match ? match[1].replace(/\s+/g, "") : "";
}

function senderIn(text: string): string {
  const label = labeled(text, "보내는\\s*분|보내는\\s*사람|토퍼|from");
  if (label) return label.slice(0, 40);
  const signed = /([^\n:：]{1,30}?\s*드림)/.exec(text);
  return signed ? signed[1].trim() : "";
}

function defaultAddress(date: string) {
  const event = date ? getEventOn(date) : undefined;
  if (!event || event.topperCategories.length === 0) return "";
  return event.kind === "instituteLongCourse" ? "지방자치인재개발원 장기과정 수료식" : "지방자치인재개발원 승진식";
}

/** 카톡·문자 글 한 건 → 칸 */
function parseMessage(text: string, todayKey: string): StoreDraft {
  const draft = emptyStoreDraft();
  const date = parseStoreDate(text, todayKey);
  const phones = [...text.matchAll(PHONE)].map((match) => match[0].trim());

  const ordererLine = text.split("\n").find((line) => /주문자|예약자|주문하신|보내시는/.test(line)) ?? "";
  draft.ordererPhone = ordererLine.match(PHONE)?.[0].trim() ?? phones[0] ?? "";
  draft.ordererName = labeled(text, "주문자|예약자|주문하신\\s*분|보내시는\\s*분").split(/\s{2,}|\t/)[0].slice(0, 40);
  // 이름표가 없으면 예약자 연락처 바로 앞 이름 (예: "김철수 010-…")
  if (!draft.ordererName && draft.ordererPhone) {
    const before = text.slice(0, text.indexOf(draft.ordererPhone));
    draft.ordererName = /([가-힣]{2,4})\s*(?:님)?\s*[(:：/,]?\s*$/.exec(before)?.[1] ?? "";
  }

  const recipientAt = text.search(/받는\s*분|받으시는|수령인|받는사람/);
  const recipientText = recipientAt >= 0 ? text.slice(recipientAt).split(/\n(?=\S*(?:보내는|메시지|메세지|문구|토퍼|날짜|일시|시간|결제|입금|상품))/)[0] : "";
  const others = phones.filter((phone) => digits(phone) !== digits(draft.ordererPhone));
  const parsed = recipientText ? parseRecipients(recipientText, draft.ordererPhone, "") : [];
  draft.recipients = (parsed.length ? parsed : [{ name: "", phone: others[0] ?? "", address: "" }]).map((recipient) => ({
    ...recipient,
    course: "",
  }));

  draft.date = date;
  draft.time = parseStoreTime(text, date);
  const items = itemsIn(text, categoryOf(text));
  draft.items = items.length ? items : [{ productId: "", quantity: 1 }];
  draft.shoppingBags = bagsIn(text);

  const event = date ? getEventOn(date) : undefined;
  draft.forEvent = !!event && event.topperCategories.length > 0 && !/행사\s*꽃\s*아니|토퍼\s*(없|빼)/.test(text);
  draft.receiveMethod = /픽업|찾으러|방문\s*수령|가지러/.test(text)
    ? "pickup"
    : /배송|배달|주소|보내\s*주|인재개발원/.test(text) || draft.forEvent
      ? "delivery"
      : "pickup";
  if (draft.receiveMethod === "delivery" && !draft.recipients[0].address) draft.recipients[0].address = defaultAddress(date);
  const course = event?.topperAsksCourse ? courseIn(text) : "";
  draft.recipients = draft.recipients.map((recipient) => ({ ...recipient, course }));
  draft.sender = senderIn(text);
  draft.message = labeled(text, "메시지|메세지|문구|카드\\s*내용|리본").slice(0, NOTE_MAX);
  draft.colorNote = labeled(text, "색감|색상|원하는\\s*색").slice(0, 100);
  draft.paymentMethod = /카드/.test(text) && !/계좌|입금/.test(text) ? "card" : "bank";
  draft.paid = /입금\s*(완료|했|확인|됨)|결제\s*(완료|했|됨)|완납/.test(text);
  draft.sendPaidSms = draft.paid;
  return draft;
}

/**
 * 노션 표 줄(탭으로 나뉨) — 칸 순서가 표마다 달라서 위치 대신 모양으로 읽음:
 * 연락처 칸 바로 앞 칸이 그 사람 이름 (첫 연락처 = 예약자, 다음 = 받는 분), 금액·상품 칸으로 상품, "과정"이 든 칸은 수료 과정.
 * 예: 폰 예약 | 50,000원 | 2026. 11. 27.(금) | 춘천 애인들 | 010… | 정해숙 | 010… | | 꽃다발 | | 지방자치인재개발원 고위정책과정
 */
function parseTableRow(line: string, todayKey: string) {
  const cells = line.split("\t").map((cell) => cell.trim());
  const phoneAt = cells.map((cell, index) => (new RegExp(`^${PHONE.source}$`).test(cell) ? index : -1)).filter((index) => index >= 0);
  const nameBefore = (index: number | undefined) => (index !== undefined && index > 0 ? cells[index - 1] : "");
  const date = parseStoreDate(line, todayKey);
  const items = itemsIn(cells.filter((cell) => !/과정/.test(cell)).join("\n"), categoryOf(line));
  const courseCell = cells.find((cell) => /과정/.test(cell)) ?? "";
  const noteCell = phoneAt[1] !== undefined ? cells[phoneAt[1] + 1] ?? "" : "";
  return {
    ordererName: nameBefore(phoneAt[0]),
    ordererPhone: phoneAt[0] !== undefined ? cells[phoneAt[0]] : "",
    recipient: {
      name: nameBefore(phoneAt[1]),
      phone: phoneAt[1] !== undefined ? cells[phoneAt[1]] : "",
      address: "",
      course: courseCell,
    },
    date,
    time: parseStoreTime(line.replace(/\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?/, ""), date),
    item: items[0] ?? { productId: "", quantity: 1 },
    bags: bagsIn(line),
    note: /^[\d,원\s]*$/.test(noteCell) || /꽃다발|꽃바구니|호접난/.test(noteCell) ? "" : noteCell,
    paid: /입금\s*(완료|확인)|\[입금 확인\]/.test(line),
  };
}

/** 붙여넣은 글 → 예약마다 칸. 탭 줄이 있으면 표 줄로(같은 예약자 연락처·날짜끼리 한 예약), 아니면 글 전체를 한 건으로 */
export function parseStoreBookings(text: string, todayKey: string): StoreDraft[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];
  const rows = lines.filter((line) => line.split("\t").length >= 4);
  if (rows.length === 0) return [parseMessage(text.replace(/\r/g, "").trim(), todayKey)];

  const groups = new Map<string, StoreDraft>();
  for (const line of rows) {
    const row = parseTableRow(line, todayKey);
    const key = `${digits(row.ordererPhone)}|${row.date}`;
    let draft = groups.get(key);
    if (!draft) {
      const event = row.date ? getEventOn(row.date) : undefined;
      draft = {
        ...emptyStoreDraft(),
        ordererName: row.ordererName,
        ordererPhone: row.ordererPhone,
        date: row.date,
        time: row.time,
        items: [],
        recipients: [],
        forEvent: !!event && event.topperCategories.length > 0,
        sender: event && event.topperCategories.length > 0 ? row.ordererName : "",
        message: row.note,
        paid: row.paid,
        sendPaidSms: row.paid,
      };
      groups.set(key, draft);
    }
    draft.items.push(row.item);
    draft.shoppingBags += row.bags;
    draft.recipients.push(row.recipient);
  }
  for (const draft of groups.values()) {
    if (draft.forEvent || draft.recipients.some((recipient) => recipient.phone)) {
      draft.receiveMethod = "delivery";
      const address = defaultAddress(draft.date);
      draft.recipients = draft.recipients.map((recipient) => ({ ...recipient, address: recipient.address || address }));
    }
    const event = getEventOn(draft.date);
    if (!event?.topperAsksCourse) draft.recipients = draft.recipients.map((recipient) => ({ ...recipient, course: "" }));
  }
  return [...groups.values()];
}

export type StoreBuildResult = { ok: true; request: ReservationRequest } | { ok: false; error: string };

const clip = (text: unknown, max = TEXT_MAX) => String(text ?? "").trim().slice(0, max);

/** 관리자가 고친 칸 → 저장할 예약 (서버에서 다시 검사). 시간·마감 규칙은 보지 않음 — 매장이 이미 받은 예약 */
export function buildStoreReservationRequest(draft: StoreDraft, submittedAt: string): StoreBuildResult {
  const ordererName = clip(draft.ordererName, 40);
  if (!ordererName) return { ok: false, error: "예약자 이름을 적어 주세요." };
  const ordererPhone = clip(draft.ordererPhone, 30);
  if (digits(ordererPhone).length < 9) return { ok: false, error: "예약자 연락처를 확인해 주세요." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date ?? "") || Number.isNaN(Date.parse(draft.date))) {
    return { ok: false, error: "받는 날짜를 확인해 주세요." };
  }
  if (!/^([01]\d|2[0-3]):00$/.test(draft.time ?? "")) return { ok: false, error: "받는 시간을 골라 주세요." };

  // 상품 1개씩 순서대로 (받는 분이 상품 순서대로 들어가게)
  const units: Product[] = [];
  for (const item of draft.items ?? []) {
    const product = allProducts.find((candidate) => candidate.id === item.productId);
    if (!product) return { ok: false, error: "상품을 골라 주세요." };
    const quantity = Math.floor(Number(item.quantity));
    if (!(quantity >= 1 && quantity <= STORE_MAX_QUANTITY)) return { ok: false, error: "상품 수량을 확인해 주세요." };
    for (let count = 0; count < quantity; count += 1) units.push(product);
  }
  if (units.length === 0) return { ok: false, error: "상품을 하나 이상 넣어 주세요." };
  if (units.length > STORE_MAX_QUANTITY) return { ok: false, error: "상품이 너무 많아요. 나눠서 넣어 주세요." };
  const bags = Math.floor(Number(draft.shoppingBags) || 0);
  if (bags < 0 || bags > STORE_MAX_QUANTITY) return { ok: false, error: "쇼핑백 수량을 확인해 주세요." };

  const receiveMethod: ReceiveMethod = draft.receiveMethod === "delivery" ? "delivery" : "pickup";
  const recipients = (draft.recipients?.length ? draft.recipients : [{ name: "", phone: "", address: "", course: "" }]).map(
    (recipient) => ({
      name: clip(recipient.name, 40),
      phone: clip(recipient.phone, 30),
      address: receiveMethod === "delivery" ? clip(recipient.address) : "",
      course: clip(recipient.course, 40),
    }),
  );
  if (recipients.length > STORE_MAX_QUANTITY) return { ok: false, error: "받는 분이 너무 많아요." };
  for (let index = 1; index < recipients.length; index += 1) {
    if (!recipients[index].address) recipients[index].address = recipients[index - 1].address;
  }
  if (receiveMethod === "delivery" && !recipients[0].address) return { ok: false, error: "배송이면 배송지를 적어 주세요." };
  const recipientFor = (unitIndex: number) => recipients[Math.min(unitIndex, recipients.length - 1)];

  const event = getEventOn(draft.date);
  const forEvent = !!event && event.topperCategories.length > 0 && !!draft.forEvent;
  const sender = clip(draft.sender, 40);
  const message = [!forEvent && sender ? `보내는 분: ${sender}` : "", clip(draft.message, NOTE_MAX)].filter(Boolean).join("\n");

  const unitCount = new Map<string, number>();
  const deliveries: ReservationDelivery[] = units.map((product, index) => {
    const unitNo = (unitCount.get(product.id) ?? 0) + 1;
    unitCount.set(product.id, unitNo);
    const topper = forEvent && !!event && event.topperCategories.includes(product.category);
    const recipient = recipientFor(index);
    return {
      productId: product.id,
      category: product.category,
      price: product.price,
      unitNo,
      recipientName: recipient.name,
      recipientPhone: recipient.phone,
      recipientAddress: product.category === "orchid" ? "" : recipient.address,
      topperSender: topper ? sender : "",
      topperCourse: topper && event?.topperAsksCourse ? recipient.course : "",
      messageType: message ? "memo" : "none",
      memo: message,
      ribbonLeft: "",
      ribbonRight: "",
      blackboard: "",
      blackboardPreset: "",
    };
  });
  const items: ReservationItem[] = [...unitCount].map(([productId, quantity]) => {
    const product = allProducts.find((candidate) => candidate.id === productId)!;
    return { productId, category: product.category, price: product.price, quantity };
  });

  const chocolates = bags > 0 ? [{ chocolateId: shoppingBag.id, price: shoppingBag.price, quantity: bags }] : [];
  const totalPrice =
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    chocolates.reduce((sum, chocolate) => sum + chocolate.price * chocolate.quantity, 0);
  const colorNote = clip(draft.colorNote, 100);
  const hasOrchid = items.some((item) => item.category === "orchid");
  const paymentMethod: PaymentMethod = draft.paymentMethod === "card" ? "card" : "bank";

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
      color: colorNote ? "other" : "auto",
      colorOther: colorNote,
      receiveMethod,
      forEvent,
      orchidDelivery: hasOrchid
        ? receiveMethod === "delivery"
          ? { method: "restaurant", restaurant: recipients[0].address, reservationName: recipients[0].name }
          : { method: "pickup", restaurant: "", reservationName: "" }
        : null,
      paymentMethod,
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
    },
  };
}
