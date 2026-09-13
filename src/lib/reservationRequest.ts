import {
  cardPayerOptions,
  cashReceiptOptions,
  COLOR_OTHER,
  documentOptions,
  paymentMethodOptions,
} from "@/data/reservationOptions";
import { getOrderItems } from "@/lib/selection";
import { getBlackboardText, type ResolvedUnit } from "@/lib/units";
import type {
  BusinessDocumentType,
  CardPayerType,
  CashReceiptType,
  PaymentMethod,
  ReservationDelivery,
  ReservationFormField,
  ReservationRequest,
  Selection,
} from "@/types/reservation";

function text(data: FormData, field: ReservationFormField) {
  const value = data.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function toPaymentMethod(value: string): PaymentMethod {
  const option = paymentMethodOptions.find((item) => item.value === value);
  return (option ?? paymentMethodOptions[0]).value;
}

function toCashReceiptType(value: string): CashReceiptType {
  return cashReceiptOptions.find((item) => item.value === value)?.value ?? "none";
}

function toCardPayerType(value: string): CardPayerType {
  return cardPayerOptions.find((item) => item.value === value)?.value ?? "same";
}

/** 체크된 서류만, documentOptions 순서대로 */
function toDocuments(data: FormData): BusinessDocumentType[] {
  const checked = data.getAll("documents" satisfies ReservationFormField);
  return documentOptions.map((option) => option.value).filter((value) => checked.includes(value));
}

/** 선택한 메시지 방식에 해당하는 문구만 남김 */
function toDelivery({ unit, recipient, message }: ResolvedUnit): ReservationDelivery {
  return {
    productId: unit.product.id,
    category: unit.product.category,
    price: unit.product.price,
    unitNo: unit.unitNo,
    recipientName: recipient.name.trim(),
    recipientPhone: recipient.phone.trim(),
    messageType: message.type,
    memo: message.type === "memo" ? message.memo.trim() : "",
    ribbonLeft: message.type === "ribbon" ? message.ribbonLeft.trim() : "",
    ribbonRight: message.type === "ribbon" ? message.ribbonRight.trim() : "",
    blackboard: message.type === "blackboard" ? getBlackboardText(message) : "",
    blackboardPreset: message.type === "blackboard" ? message.blackboardPreset : "",
  };
}

/**
 * 화면 선택(상품·날짜·시간) + 상품별 받는 분·메시지 + 신청서 입력값 → 예약 한 건.
 * 신청서 input name을 읽는 유일한 곳.
 * date/time은 호출 전에 getSelectionIssue로 검사된 상태여야 한다.
 */
export function buildReservationRequest(
  selection: Selection,
  units: ResolvedUnit[],
  data: FormData,
  submittedAt: Date,
): ReservationRequest {
  const items = getOrderItems(selection);
  const color = text(data, "color");
  const paymentMethod = toPaymentMethod(text(data, "paymentMethod"));
  // 현금영수증은 계좌이체일 때만
  const cashReceiptType =
    paymentMethod === "bank" ? toCashReceiptType(text(data, "cashReceiptType")) : "none";
  // 결제하실 분 연락처는 카드 결제일 때만
  const cardPayer = paymentMethod === "card" ? toCardPayerType(text(data, "cardPayer")) : "same";
  const documents = toDocuments(data);
  const wantsDocuments = documents.length > 0;

  return {
    items: items.map(({ product, quantity }) => ({
      productId: product.id,
      category: product.category,
      price: product.price,
      quantity,
    })),
    deliveries: units.map(toDelivery),
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    date: selection.date ?? "",
    time: selection.time ?? "",
    ordererName: text(data, "ordererName"),
    ordererPhone: text(data, "ordererPhone"),
    color,
    colorOther: color === COLOR_OTHER ? text(data, "colorOther") : "",
    paymentMethod,
    cashReceiptType,
    cashReceiptNumber: cashReceiptType === "none" ? "" : text(data, "cashReceiptNumber"),
    cardPayer,
    cardPayerContact: cardPayer === "other" ? text(data, "cardPayerContact") : "",
    documents,
    documentEmail: wantsDocuments ? text(data, "documentEmail") : "",
    documentCompany: wantsDocuments ? text(data, "documentCompany") : "",
    documentBusinessNumber: wantsDocuments ? text(data, "documentBusinessNumber") : "",
    submittedAt: submittedAt.toISOString(),
  };
}
