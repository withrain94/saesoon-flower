import { allProducts } from "@/data/products";
import { documentOptions, paymentMethodOptions } from "@/data/reservationOptions";
import { businessInfo } from "@/data/shop";
import { formatDateLabel } from "@/lib/date";
import { formatDocumentDate, formatKoreanAmount } from "@/lib/format";
import { getItemName } from "@/lib/selection";
import { formatTimeLabel } from "@/lib/time";
import type { BusinessDocumentType, ReservationRequest } from "@/types/reservation";

/** 서류 원래 너비(px) — A4 폭에 맞춘 레이아웃 기준 */
export const DOCUMENT_WIDTH = 640;

/** 비어 있는 공급자 정보 표시 */
export const MISSING_INFO = "(확인 필요)";

/** seal: 값 옆에 찍을 직인 이미지 경로 (공급자 대표자 칸) */
export type DocumentParty = { label: string; value: string; seal?: string }[];

export type DocumentRow = {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

/** 화면·PDF·이메일 어디서 그려도 같은 내용이 나오도록 서류 한 장을 데이터로 만든 것 */
export type BusinessDocument = {
  type: BusinessDocumentType;
  title: string;
  /** 서류 번호 (예: SS-20260914-1530) */
  number: string;
  issuedDate: string;
  supplier: DocumentParty;
  recipient: DocumentParty;
  rows: DocumentRow[];
  total: number;
  /** "일금 이십이만원정" */
  totalText: string;
  /** 과세일 때만 */
  tax: { supplyAmount: number; vat: number } | null;
  notes: string[];
};

const orEmpty = (value: string) => value.trim() || MISSING_INFO;

function documentNumber(submittedAt: string) {
  const date = new Date(submittedAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `SS-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

export function buildBusinessDocument(
  type: BusinessDocumentType,
  reservation: ReservationRequest,
): BusinessDocument {
  const title = documentOptions.find((option) => option.value === type)?.label ?? "";
  const issuedDate = formatDocumentDate(reservation.submittedAt);
  const schedule = `${formatDateLabel(reservation.date)} ${formatTimeLabel(reservation.time)}`;
  const payment = paymentMethodOptions.find((option) => option.value === reservation.paymentMethod);

  const rows = reservation.items.map((item) => {
    const product = allProducts.find((candidate) => candidate.id === item.productId);
    return {
      name: product ? getItemName(product) : item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
      amount: item.price * item.quantity,
    };
  });
  const total = rows.reduce((sum, row) => sum + row.amount, 0);

  // 과세면 가격을 부가세 포함으로 보고 공급가액·세액을 나눔
  const supplyAmount = Math.round(total / 1.1);
  const tax =
    businessInfo.taxType === "taxable" ? { supplyAmount, vat: total - supplyAmount } : null;

  const taxNote =
    businessInfo.taxType === "exempt"
      ? "부가세 면세 품목입니다."
      : businessInfo.taxType === "taxable"
        ? "금액은 부가세 포함입니다."
        : `부가세 구분: ${MISSING_INFO}`;

  const notes =
    type === "quote"
      ? [
          `예약 일시: ${schedule}`,
          `견적 유효기간: 작성일로부터 ${businessInfo.quoteValidDays}일`,
          taxNote,
        ]
      : [`거래(예약) 일시: ${schedule}`, `결제 방법: ${payment?.label ?? ""}`, taxNote];

  return {
    type,
    title,
    number: documentNumber(reservation.submittedAt),
    issuedDate,
    supplier: [
      { label: "상호", value: orEmpty(businessInfo.tradeName) },
      {
        label: "대표자",
        value: orEmpty(businessInfo.representative),
        seal: businessInfo.sealImage ?? undefined,
      },
      { label: "사업자등록번호", value: orEmpty(businessInfo.businessNumber) },
      { label: "주소", value: orEmpty(businessInfo.address) },
      { label: "업태 / 종목", value: `${orEmpty(businessInfo.businessType)} / ${orEmpty(businessInfo.businessItem)}` },
      { label: "연락처", value: orEmpty(businessInfo.phone) },
    ],
    recipient: [
      { label: "상호·기관명", value: reservation.documentCompany },
      { label: "사업자등록번호", value: reservation.documentBusinessNumber || "-" },
      { label: "담당자", value: reservation.ordererName },
      { label: "연락처", value: reservation.ordererPhone },
      { label: "이메일", value: reservation.documentEmail },
    ],
    rows,
    total,
    totalText: formatKoreanAmount(total),
    tax,
    notes,
  };
}
