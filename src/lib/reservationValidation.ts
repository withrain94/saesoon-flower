import { allProducts } from "@/data/products";
import {
  BUSINESS_NUMBER_PATTERN,
  cardPayerOptions,
  cashReceiptOptions,
  documentOptions,
  MAX_QUANTITY,
  messageOptionsByCategory,
  paymentMethodOptions,
  PHONE_PATTERN,
} from "@/data/reservationOptions";
import { isSlotBookable, type Now } from "@/lib/time";
import type {
  ReservationDelivery,
  ReservationItem,
  ReservationRequest,
} from "@/types/reservation";

/**
 * 서버에서 받은 예약 한 건을 다시 검사·정리한다.
 * 브라우저에서 온 값은 믿지 않고 — 금액은 상품 데이터로 다시 계산, 날짜·시간은 매장 시각으로 다시 확인.
 */
export type ValidationResult =
  | { ok: true; request: ReservationRequest }
  | { ok: false; message: string };

const MAX_TEXT = 500;
const fullMatch = (pattern: string) => new RegExp(`^(?:${pattern})$`);
const PHONE = fullMatch(PHONE_PATTERN);
const BUSINESS_NUMBER = fullMatch(BUSINESS_NUMBER_PATTERN);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const SLOT = /^\d{2}:00$/;

const str = (value: unknown, max = MAX_TEXT) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const oneOf = <T extends string>(value: unknown, options: { value: T }[], fallback: T): T =>
  options.find((option) => option.value === value)?.value ?? fallback;

const fail = (message: string): ValidationResult => ({ ok: false, message });

export function validateReservationRequest(input: unknown, now: Now, submittedAt: Date): ValidationResult {
  if (typeof input !== "object" || input === null) return fail("예약 정보를 읽을 수 없어요.");
  const raw = input as Record<string, unknown>;

  if (raw.privacyAgreed !== true) return fail("개인정보 수집·이용에 동의해 주세요.");

  const ordererName = str(raw.ordererName, 50);
  const ordererPhone = str(raw.ordererPhone, 20);
  if (!ordererName) return fail("예약자 성함을 입력해 주세요.");
  if (!PHONE.test(ordererPhone)) return fail("예약자 연락처를 다시 확인해 주세요.");

  // 상품: 금액·종류는 상품 데이터 기준으로 다시 채움
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items: ReservationItem[] = [];
  for (const rawItem of rawItems) {
    const productId = str((rawItem as Record<string, unknown>)?.productId, 50);
    const quantity = Number((rawItem as Record<string, unknown>)?.quantity);
    const product = allProducts.find((candidate) => candidate.id === productId);
    if (!product) return fail("없는 상품이 포함되어 있어요. 페이지를 새로고침해 주세요.");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return fail("상품 수량을 다시 확인해 주세요.");
    }
    if (items.some((item) => item.productId === productId)) return fail("상품 정보가 중복되었어요.");
    items.push({ productId, category: product.category, price: product.price, quantity });
  }
  if (items.length === 0) return fail("상품을 1개 이상 담아주세요.");
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 날짜·시간: 매장(한국) 시각 기준으로 지금 예약 가능한지
  const date = str(raw.date, 10);
  const time = str(raw.time, 5);
  if (!DATE_KEY.test(date) || !SLOT.test(time)) return fail("날짜와 시간을 선택해 주세요.");
  if (!isSlotBookable(time, date, now)) {
    return fail("선택한 시간은 지금 예약할 수 없어요. 날짜·시간을 다시 골라주세요.");
  }

  // 상품 1개 단위 받는 분·메시지: 담은 수량과 개수가 맞아야 함
  const rawDeliveries = Array.isArray(raw.deliveries) ? raw.deliveries : [];
  if (rawDeliveries.length !== totalQuantity) return fail("받는 분·메시지 정보를 다시 확인해 주세요.");
  const deliveries: ReservationDelivery[] = [];
  for (const rawDelivery of rawDeliveries) {
    const d = (rawDelivery ?? {}) as Record<string, unknown>;
    const item = items.find((candidate) => candidate.productId === d.productId);
    if (!item) return fail("받는 분·메시지 정보를 다시 확인해 주세요.");
    const recipientPhone = str(d.recipientPhone, 20);
    if (recipientPhone && !PHONE.test(recipientPhone)) return fail("받는 분 연락처를 다시 확인해 주세요.");
    const messageType = oneOf(d.messageType, messageOptionsByCategory[item.category], messageOptionsByCategory[item.category][0].value);
    deliveries.push({
      productId: item.productId,
      category: item.category,
      price: item.price,
      unitNo: Number.isInteger(d.unitNo) ? (d.unitNo as number) : 1,
      recipientName: str(d.recipientName, 50),
      recipientPhone,
      messageType,
      memo: messageType === "memo" ? str(d.memo) : "",
      ribbonLeft: messageType === "ribbon" ? str(d.ribbonLeft, 50) : "",
      ribbonRight: messageType === "ribbon" ? str(d.ribbonRight, 50) : "",
      blackboard: messageType === "blackboard" ? str(d.blackboard, 100) : "",
      blackboardPreset: messageType === "blackboard" ? str(d.blackboardPreset, 50) : "",
    });
  }

  // 결제
  const paymentMethod = oneOf(raw.paymentMethod, paymentMethodOptions, paymentMethodOptions[0].value);
  const cashReceiptType = paymentMethod === "bank" ? oneOf(raw.cashReceiptType, cashReceiptOptions, "none") : "none";
  const cashReceiptNumber = cashReceiptType === "none" ? "" : str(raw.cashReceiptNumber, 20);
  if (cashReceiptType === "income" && !PHONE.test(cashReceiptNumber)) return fail("현금영수증 휴대폰 번호를 확인해 주세요.");
  if (cashReceiptType === "expense" && !BUSINESS_NUMBER.test(cashReceiptNumber)) return fail("현금영수증 사업자등록번호를 확인해 주세요.");
  const cardPayer = paymentMethod === "card" ? oneOf(raw.cardPayer, cardPayerOptions, "same") : "same";
  const cardPayerContact = cardPayer === "other" ? str(raw.cardPayerContact, 100) : "";
  if (cardPayer === "other" && !cardPayerContact) return fail("카드 결제하실 분 연락처를 적어주세요.");

  // 견적서·거래명세표
  const requested = Array.isArray(raw.documents) ? raw.documents : [];
  const documents = documentOptions.map((option) => option.value).filter((value) => requested.includes(value));
  const documentEmail = documents.length ? str(raw.documentEmail, 100) : "";
  const documentCompany = documents.length ? str(raw.documentCompany, 100) : "";
  const documentBusinessNumber = documents.length ? str(raw.documentBusinessNumber, 20) : "";
  if (documents.length && !EMAIL.test(documentEmail)) return fail("서류 받을 이메일을 확인해 주세요.");
  if (documents.length && !documentCompany) return fail("서류에 적을 상호·기관명을 입력해 주세요.");
  if (documentBusinessNumber && !BUSINESS_NUMBER.test(documentBusinessNumber)) return fail("서류용 사업자등록번호를 확인해 주세요.");

  return {
    ok: true,
    request: {
      items,
      deliveries,
      totalQuantity,
      totalPrice,
      date,
      time,
      ordererName,
      ordererPhone,
      color: str(raw.color, 50),
      colorOther: str(raw.colorOther, 100),
      paymentMethod,
      cashReceiptType,
      cashReceiptNumber,
      cardPayer,
      cardPayerContact,
      documents,
      documentEmail,
      documentCompany,
      documentBusinessNumber,
      submittedAt: submittedAt.toISOString(),
      privacyAgreed: true,
    },
  };
}
