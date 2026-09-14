import { allProducts } from "@/data/products";
import {
  BUSINESS_NUMBER_PATTERN,
  cardPayerTypes,
  cashReceiptOptions,
  colorOptionIds,
  COLOR_OTHER,
  documentOptions,
  MAX_QUANTITY,
  messageOptionsByCategory,
  orchidDeliveryMethods,
  paymentMethodOptions,
  PHONE_PATTERN,
} from "@/data/reservationOptions";
import { DEFAULT_LOCALE, isLocale, messages } from "@/i18n";
import { hasFreeTopper } from "@/lib/events";
import { getPaypalAmount } from "@/lib/payment";
import { isSlotBookable, type Now } from "@/lib/time";
import type {
  OrchidDelivery,
  ReservationDelivery,
  ReservationItem,
  ReservationRequest,
} from "@/types/reservation";

/**
 * 서버에서 받은 예약 한 건을 다시 검사·정리한다.
 * 브라우저에서 온 값은 믿지 않고 — 금액은 상품 데이터로 다시 계산, 날짜·시간은 매장 시각으로 다시 확인.
 * 오류 문구는 고객이 본 언어(locale)로 돌려준다.
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

const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
  options.find((option) => option === value) ?? fallback;

export function validateReservationRequest(input: unknown, now: Now, submittedAt: Date): ValidationResult {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const locale = isLocale(raw.locale) ? raw.locale : DEFAULT_LOCALE;
  const { validation } = messages[locale];
  const fail = (message: string): ValidationResult => ({ ok: false, message });

  if (typeof input !== "object" || input === null) return fail(validation.unreadable);
  if (raw.privacyAgreed !== true) return fail(validation.privacy);

  const ordererName = str(raw.ordererName, 50);
  const ordererPhone = str(raw.ordererPhone, 25);
  if (!ordererName) return fail(validation.ordererName);
  if (!PHONE.test(ordererPhone)) return fail(validation.ordererPhone);

  // 상품: 금액·종류는 상품 데이터 기준으로 다시 채움
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items: ReservationItem[] = [];
  for (const rawItem of rawItems) {
    const productId = str((rawItem as Record<string, unknown>)?.productId, 50);
    const quantity = Number((rawItem as Record<string, unknown>)?.quantity);
    const product = allProducts.find((candidate) => candidate.id === productId);
    if (!product) return fail(validation.unknownProduct);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return fail(validation.quantity);
    }
    if (items.some((item) => item.productId === productId)) return fail(validation.duplicateProduct);
    items.push({ productId, category: product.category, price: product.price, quantity });
  }
  if (items.length === 0) return fail(validation.noItems);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 날짜·시간: 매장(한국) 시각 기준으로 지금 예약 가능한지
  const date = str(raw.date, 10);
  const time = str(raw.time, 5);
  if (!DATE_KEY.test(date) || !SLOT.test(time)) return fail(validation.schedule);
  if (!isSlotBookable(time, date, now)) return fail(validation.scheduleClosed);

  // 상품 1개 단위 받는 분·토퍼·메시지: 담은 수량과 개수가 맞아야 함
  const rawDeliveries = Array.isArray(raw.deliveries) ? raw.deliveries : [];
  if (rawDeliveries.length !== totalQuantity) return fail(validation.deliveries);
  const deliveries: ReservationDelivery[] = [];
  for (const rawDelivery of rawDeliveries) {
    const d = (rawDelivery ?? {}) as Record<string, unknown>;
    const item = items.find((candidate) => candidate.productId === d.productId);
    if (!item) return fail(validation.deliveries);
    const recipientPhone = str(d.recipientPhone, 25);
    if (recipientPhone && !PHONE.test(recipientPhone)) return fail(validation.recipientPhone);
    const messageTypes = messageOptionsByCategory[item.category];
    const messageType = oneOf(d.messageType, messageTypes, messageTypes[0]);
    const topper = hasFreeTopper(date, item.category);
    deliveries.push({
      productId: item.productId,
      category: item.category,
      price: item.price,
      unitNo: Number.isInteger(d.unitNo) ? (d.unitNo as number) : 1,
      recipientName: str(d.recipientName, 50),
      recipientPhone,
      topperName: topper ? str(d.topperName, 30) : "",
      topperRank: topper ? str(d.topperRank, 30) : "",
      messageType,
      memo: messageType === "memo" ? str(d.memo) : "",
      ribbonLeft: messageType === "ribbon" ? str(d.ribbonLeft, 50) : "",
      ribbonRight: messageType === "ribbon" ? str(d.ribbonRight, 50) : "",
      blackboard: messageType === "blackboard" ? str(d.blackboard, 100) : "",
      blackboardPreset: messageType === "blackboard" ? str(d.blackboardPreset, 50) : "",
    });
  }

  // 원하는 색감 (코드) / 호접난 받는 방법
  const color = raw.color ? oneOf(raw.color, colorOptionIds, colorOptionIds[0]) : "";
  let orchidDelivery: OrchidDelivery | null = null;
  if (items.some((item) => item.category === "orchid")) {
    const rawOrchid = (raw.orchidDelivery ?? {}) as Record<string, unknown>;
    const method = oneOf(rawOrchid.method, orchidDeliveryMethods, "pickup");
    const restaurant = method === "restaurant" ? str(rawOrchid.restaurant, 50) : "";
    const reservationName = method === "restaurant" ? str(rawOrchid.reservationName, 50) : "";
    if (method === "restaurant" && !restaurant) return fail(validation.orchidRestaurant);
    if (method === "restaurant" && !reservationName) return fail(validation.orchidReservationName);
    orchidDelivery = { method, restaurant, reservationName };
  }

  // 결제
  const paymentMethods = paymentMethodOptions.map((option) => option.value);
  const paymentMethod = oneOf(raw.paymentMethod, paymentMethods, paymentMethods[0]);
  const cashReceiptTypes = cashReceiptOptions.map((option) => option.value);
  const cashReceiptType = paymentMethod === "bank" ? oneOf(raw.cashReceiptType, cashReceiptTypes, "none") : "none";
  const cashReceiptNumber = cashReceiptType === "none" ? "" : str(raw.cashReceiptNumber, 25);
  if (cashReceiptType === "income" && !PHONE.test(cashReceiptNumber)) return fail(validation.cashReceiptPhone);
  if (cashReceiptType === "expense" && !BUSINESS_NUMBER.test(cashReceiptNumber)) {
    return fail(validation.cashReceiptBusiness);
  }
  const cardPayer = paymentMethod === "card" ? oneOf(raw.cardPayer, cardPayerTypes, "same") : "same";
  const cardPayerContact = cardPayer === "other" ? str(raw.cardPayerContact, 100) : "";
  if (cardPayer === "other" && !cardPayerContact) return fail(validation.cardPayer);
  const paypalEmail = paymentMethod === "paypal" ? str(raw.paypalEmail, 100) : "";
  if (paymentMethod === "paypal" && !EMAIL.test(paypalEmail)) return fail(validation.paypalEmail);

  // 견적서·거래명세표
  const requested = Array.isArray(raw.documents) ? raw.documents : [];
  const documents = documentOptions.map((option) => option.value).filter((value) => requested.includes(value));
  const documentEmail = documents.length ? str(raw.documentEmail, 100) : "";
  const documentCompany = documents.length ? str(raw.documentCompany, 100) : "";
  const documentBusinessNumber = documents.length ? str(raw.documentBusinessNumber, 20) : "";
  if (documents.length && !EMAIL.test(documentEmail)) return fail(validation.documentEmail);
  if (documents.length && !documentCompany) return fail(validation.documentCompany);
  if (documentBusinessNumber && !BUSINESS_NUMBER.test(documentBusinessNumber)) {
    return fail(validation.documentBusinessNumber);
  }

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
      color,
      colorOther: color === COLOR_OTHER ? str(raw.colorOther, 100) : "",
      orchidDelivery,
      paymentMethod,
      paypalEmail,
      paypalAmount: paymentMethod === "paypal" ? getPaypalAmount(totalPrice) : 0,
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
      locale,
    },
  };
}
