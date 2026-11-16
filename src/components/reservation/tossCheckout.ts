"use client";

import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { tossFailPath, tossSuccessPath } from "@/data/shop";
import type { TossCheckout } from "@/lib/tossPayment";

/**
 * 토스페이먼츠 결제창 열기 (브라우저) — 휴대폰은 결제창 화면으로 이동했다가 성공·실패 화면으로 돌아옴.
 * 카드번호 등 결제 정보는 토스 결제창에만 입력되고 이 사이트로 오지 않는다.
 */

/** 결제창에서 돌아왔을 때 [다시 결제하기]에 쓸 예약 id·연락처 — 이 브라우저 탭에만 잠깐 보관 */
const PENDING_KEY = "saesoon.tossPending";

export type PendingPayment = { reservationId: string; phone: string };

export function rememberPendingPayment(pending: PendingPayment) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // 개인정보 보호 모드 등 — 실패해도 [예약 조회]에서 결제할 수 있음
  }
}

export function readPendingPayment(): PendingPayment | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? "null") as Partial<PendingPayment> | null;
    return value && typeof value.reservationId === "string" && typeof value.phone === "string"
      ? { reservationId: value.reservationId, phone: value.phone }
      : null;
  } catch {
    return null;
  }
}

export function forgetPendingPayment() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // 무시
  }
}

/** 결제창 열기 — 손님이 창을 닫으면 오류(USER_CANCEL 등)로 끝남 */
export async function openTossCheckout(checkout: TossCheckout) {
  const toss = await loadTossPayments(checkout.clientKey);
  const payment = toss.payment({ customerKey: ANONYMOUS });
  const common = {
    amount: { currency: "KRW", value: checkout.amount },
    taxFreeAmount: checkout.taxFreeAmount,
    orderId: checkout.orderId,
    orderName: checkout.orderName,
    customerName: checkout.customerName,
    customerMobilePhone: checkout.customerMobilePhone,
    successUrl: `${window.location.origin}${tossSuccessPath}`,
    failUrl: `${window.location.origin}${tossFailPath}`,
  };

  if (checkout.method === "CARD") {
    await payment.requestPayment({
      ...common,
      method: "CARD",
      card: { useEscrow: false, flowMode: "DEFAULT", useCardPoint: false, useAppCardOnly: false },
    });
  } else {
    await payment.requestPayment({
      ...common,
      method: "VIRTUAL_ACCOUNT",
      virtualAccount: { useEscrow: false, validHours: checkout.validHours },
    });
  }
}

/** 결제창을 손님이 닫은 경우 (오류 안내 대신 조용히) */
export function isUserCancel(error: unknown) {
  const code = typeof error === "object" && error !== null ? (error as { code?: unknown }).code : undefined;
  return code === "USER_CANCEL" || code === "PAY_PROCESS_CANCELED";
}
