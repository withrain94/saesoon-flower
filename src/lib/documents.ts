import type { ChocolateId } from "@/data/chocolates";
import { allProducts } from "@/data/products";
import { documentOptions, paymentMethodOptions } from "@/data/reservationOptions";
import { businessInfo } from "@/data/shop";
import { ko } from "@/i18n/ko";
import { formatDateLabel } from "@/lib/date";
import { formatKoreanAmount } from "@/lib/format";
import { taxFreeAmountOf } from "@/lib/tossPayment";
import { getItemName } from "@/lib/selection";
import { formatTimeLabel, toNowInTimeZone } from "@/lib/time";
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
  /**
   * 과세 부분이 있을 때만 — taxFree: 면세 금액(꽃), supplyAmount·vat: 과세 부분(부가세 포함 금액)을 나눈 값.
   * 2026-11-24 사용자 결정: 꽃은 면세, 초콜릿·인형(추가 칸·패키지 안)은 과세 — 토스 결제창과 같은 기준(lib/tossPayment)
   */
  tax: { taxFree: number; supplyAmount: number; vat: number } | null;
  notes: string[];
};

const orEmpty = (value: string) => value.trim() || MISSING_INFO;

/**
 * 서류 번호·작성일 — 한국 시각 기준 (서버(UTC)에서 만드는 이메일 PDF와 손님 화면이 같게)
 * "2026-09-14T06:30:00Z" → { number: "SS-20260914-1530", issuedDate: "2026. 9. 14." }
 */
function documentStamp(submittedAt: string) {
  const { dateKey, minutes } = toNowInTimeZone(new Date(submittedAt));
  const [year, month, day] = dateKey.split("-");
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    number: `SS-${year}${month}${day}-${pad(Math.floor(minutes / 60))}${pad(minutes % 60)}`,
    issuedDate: `${year}. ${Number(month)}. ${Number(day)}.`,
  };
}

export function buildBusinessDocument(
  type: BusinessDocumentType,
  reservation: ReservationRequest,
): BusinessDocument {
  const title = documentOptions.find((option) => option.value === type)?.label ?? "";
  const { number, issuedDate } = documentStamp(reservation.submittedAt);
  const schedule = `${formatDateLabel(reservation.date)} ${formatTimeLabel(reservation.time)}`;
  const payment = paymentMethodOptions.find((option) => option.value === reservation.paymentMethod);

  const won = (value: number) => value.toLocaleString("ko-KR");
  const rows = reservation.items.map((item) => {
    const product = allProducts.find((candidate) => candidate.id === item.productId);
    const name = product ? getItemName(product) : item.productId;
    const taxable = Math.min(product?.taxableAmount ?? 0, item.price);
    return {
      // 초콜릿·인형이 든 패키지는 과세 부분(초콜릿·인형 값)을 이름 옆에 (1개 기준)
      name: taxable > 0 ? `${name} (과세 ${won(taxable)}원 포함)` : name,
      quantity: item.quantity,
      unitPrice: item.price,
      amount: item.price * item.quantity,
    };
  });

  // 함께 담은 초콜릿도 한 줄씩 (합계가 결제 금액과 같아야 함)
  for (const chocolate of reservation.chocolates ?? []) {
    rows.push({
      name: `${ko.chocolate.items[chocolate.chocolateId as ChocolateId]?.name ?? chocolate.chocolateId} (과세)`,
      quantity: chocolate.quantity,
      unitPrice: chocolate.price,
      amount: chocolate.price * chocolate.quantity,
    });
  }
  const total = rows.reduce((sum, row) => sum + row.amount, 0);

  // 과세 부분은 가격을 부가세 포함으로 보고 공급가액·세액을 나눔
  // (매장 전체가 과세(taxType "taxable")면 전부 과세, 면세 매장이면 꽃은 면세·초콜릿·인형만 과세)
  const taxFree = businessInfo.taxType === "taxable" ? 0 : Math.min(taxFreeAmountOf(reservation), total);
  const taxableTotal = total - taxFree;
  const supplyAmount = Math.round(taxableTotal / 1.1);
  const tax =
    businessInfo.taxType === "taxable" || (businessInfo.taxType === "exempt" && taxableTotal > 0)
      ? { taxFree, supplyAmount, vat: taxableTotal - supplyAmount }
      : null;

  const taxNote =
    businessInfo.taxType === "taxable"
      ? "금액은 부가세 포함입니다."
      : businessInfo.taxType === "exempt"
        ? taxableTotal > 0
          ? "꽃은 부가세 면세, 초콜릿·인형은 과세 품목입니다(과세 금액은 부가세 포함)."
          : "부가세 면세 품목입니다."
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
    number,
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
    ],
    rows,
    total,
    totalText: formatKoreanAmount(total),
    tax,
    notes,
  };
}

/** PDF 파일 이름 — "새순_견적서_SS-20260914-1530.pdf" */
export function documentFileName(document: BusinessDocument) {
  return `${businessInfo.tradeName}_${document.title}_${document.number}.pdf`;
}
