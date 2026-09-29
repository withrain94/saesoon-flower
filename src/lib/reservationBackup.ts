import { documentOptions } from "@/data/reservationOptions";
import { getStatusOption } from "@/data/reservationStatus";
import {
  describeColor,
  describeDeliveryAddress,
  describeDeliveryMessage,
  describeDeliveryName,
  describeDeliveryRecipient,
  describeForEvent,
  describeOrchidDelivery,
  describePayment,
  describeReceiveMethod,
  formatAdminDateTime,
  localeNames,
  summarizeItems,
} from "@/lib/adminFormat";
import { formatReceiptNumber } from "@/lib/format";
import type { StoredReservation } from "@/types/reservation";

/**
 * 예약 전체 내려받기(백업) — 관리자 화면 버튼 → app/admin/export.
 * 엑셀에서 바로 열리는 CSV. 마지막 칸에 신청서 원본(JSON)을 넣어 두어, 필요하면 그대로 되살릴 수 있다.
 */

const HEADERS = [
  "접수번호",
  "접수 시각",
  "상태",
  "받는 날짜",
  "받는 시간",
  "예약자",
  "예약자 연락처",
  "상품",
  "수량",
  "금액",
  "결제",
  "받는 방법",
  "행사 꽃",
  "색감",
  "호접난 받는 방법",
  "받는 분·배송지·토퍼·메시지",
  "서류",
  "신청 언어",
  "손님 취소 요청",
  "안내 문자 보냄",
  "매장 메모",
  "신청서 원본(JSON)",
] as const;

/** 상품 1개씩 — "꽃다발 6만원 (1/2): 받는 분 … | 배송지 … | 토퍼 … | 메시지 …" */
function describeDeliveries({ request }: StoredReservation) {
  return request.deliveries
    .map((delivery) => {
      const address = describeDeliveryAddress(request, delivery);
      const topper = delivery.topperSender;
      const parts = [
        `받는 분 ${describeDeliveryRecipient(request, delivery)}`,
        address && `배송지 ${address}`,
        topper && `토퍼(보내는 분) ${topper}`,
        `메시지 ${describeDeliveryMessage(delivery)}`,
      ].filter(Boolean);
      return `${describeDeliveryName(request, delivery)}: ${parts.join(" | ")}`;
    })
    .join("\n");
}

function describeCancelRequest({ cancelRequest }: StoredReservation) {
  if (!cancelRequest) return "";
  const refund = [cancelRequest.refundBank, cancelRequest.refundAccount, cancelRequest.refundHolder]
    .filter(Boolean)
    .join(" ");
  const paid = cancelRequest.paid ? "입금함(환불 필요)" : "입금 전";
  return [`${formatAdminDateTime(cancelRequest.requestedAt)} ${paid}`, refund].filter(Boolean).join(" · ");
}

function toRow(reservation: StoredReservation): string[] {
  const { request } = reservation;
  const documents = documentOptions
    .filter((option) => request.documents.includes(option.value))
    .map((option) => option.label)
    .join("·");
  return [
    formatReceiptNumber(reservation.id),
    formatAdminDateTime(reservation.createdAt),
    getStatusOption(reservation.status).label,
    request.date,
    request.time,
    request.ordererName,
    request.ordererPhone,
    summarizeItems(request),
    String(request.totalQuantity),
    String(request.totalPrice),
    describePayment(request),
    describeReceiveMethod(request),
    describeForEvent(request) ?? "",
    describeColor(request) ?? "",
    describeOrchidDelivery(request) ?? "",
    describeDeliveries(reservation),
    documents ? `${documents} · ${request.documentCompany}` : "",
    request.locale === "ko" ? "" : localeNames[request.locale],
    describeCancelRequest(reservation),
    reservation.reminderSentAt ? formatAdminDateTime(reservation.reminderSentAt) : "",
    reservation.adminMemo,
    JSON.stringify(request),
  ];
}

/** 엑셀용 한 칸 — 따옴표·줄바꿈·쉼표가 있어도 깨지지 않게 감쌈 */
function cell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

/** 예약 목록 → CSV 글자 (맨 앞 BOM은 엑셀에서 한글이 깨지지 않도록) */
export function buildReservationCsv(reservations: StoredReservation[]) {
  const lines = [HEADERS.map(cell).join(","), ...reservations.map((reservation) => toRow(reservation).map(cell).join(","))];
  return `﻿${lines.join("\r\n")}\r\n`;
}

/** "saesoon-reservations-2026-09-23.csv" (한국 날짜) */
export function reservationCsvFileName(todayKey: string) {
  return `saesoon-reservations-${todayKey}.csv`;
}
