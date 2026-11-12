"use server";

import { refresh } from "next/cache";
import { tossBanks } from "@/data/tossBanks";
import { toTossPaymentRecord } from "@/lib/tossPayment";
import { isReservationId, requireAdmin } from "../auth";
import { syncReservationToNotionById } from "../notion";
import { getReservation, saveTossPayment, updateReservation } from "../reservations";
import { cancelTossPayment, getTossPaymentByOrderId, syncTossPayment } from "../toss";
import type { AdminFormState } from "./admin";

/**
 * 관리자 — 토스페이먼츠 결제 확인·취소(환불). 맨 앞에서 requireAdmin().
 * 카드번호 등은 매장 서버에 없음 — 토스에 결제 키로만 요청
 */

/** 토스에서 다시 확인 (입금 알림을 못 받았을 때 등) — 결제·입금 완료면 상태도 자동으로 바뀜 */
export async function refreshTossPayment(id: string): Promise<AdminFormState> {
  await requireAdmin();
  if (!isReservationId(id)) return { error: "잘못된 요청이에요." };
  const reservation = await getReservation(id).catch(() => null);
  if (!reservation?.payment) return { error: "이 예약에는 토스 결제 기록이 없어요." };

  const result = await getTossPaymentByOrderId(reservation.payment.orderId);
  if (!result.ok) {
    // 손님이 결제창만 열고 닫았으면 토스에 결제가 없음
    if (result.code === "NOT_FOUND_PAYMENT") return { error: null, savedAt: Date.now(), notice: "아직 결제(계좌 발급)를 하지 않았어요." };
    return { error: `토스에서 확인하지 못했어요. (${result.message})` };
  }
  await syncTossPayment(reservation, result.payment);
  refresh();
  return { error: null, savedAt: Date.now(), notice: "토스 결제 상태를 다시 확인했어요." };
}

const ACCOUNT_NUMBER = /^\d{6,20}$/;

/**
 * 토스 결제 전액 취소(환불) → 예약 상태도 '취소'.
 * 전용 계좌에 이미 입금된 결제는 환불받을 계좌(은행·계좌번호·예금주)가 필요 — 토스가 확인 후 2일쯤 뒤 보냄.
 * 입금 전 계좌는 취소하면 그 계좌로 입금이 막힘
 */
export async function cancelTossPaymentByAdmin(
  id: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  if (!isReservationId(id)) return { error: "잘못된 요청이에요." };
  const reservation = await getReservation(id).catch(() => null);
  const payment = reservation?.payment;
  if (!reservation || !payment?.paymentKey) return { error: "취소할 토스 결제가 없어요." };
  if (payment.status !== "DONE" && payment.status !== "WAITING_FOR_DEPOSIT") {
    return { error: "결제 완료·입금 대기 상태일 때만 취소할 수 있어요. [토스에서 다시 확인]을 먼저 눌러 보세요." };
  }

  const reason = String(formData.get("reason") ?? "").trim() || "매장 예약 취소";
  const depositedAccount = payment.status === "DONE" && payment.virtualAccount !== null;
  let refundAccount: { bank: string; accountNumber: string; holderName: string } | undefined;
  if (depositedAccount) {
    const bank = String(formData.get("refundBank") ?? "");
    const accountNumber = String(formData.get("refundAccount") ?? "").replace(/[\s-]/g, "");
    const holderName = String(formData.get("refundHolder") ?? "").trim().slice(0, 60);
    if (!tossBanks.some((item) => item.code === bank) || !ACCOUNT_NUMBER.test(accountNumber) || !holderName) {
      return { error: "환불받을 은행·계좌번호(숫자만)·예금주를 확인해 주세요." };
    }
    refundAccount = { bank, accountNumber, holderName };
  }

  const result = await cancelTossPayment(payment.paymentKey, reason, refundAccount);
  if (!result.ok) return { error: `토스에서 취소하지 못했어요. (${result.message})` };

  const record = toTossPaymentRecord(result.payment, new Date());
  try {
    if (record) await saveTossPayment(id, record);
    await updateReservation(id, { status: "canceled" });
  } catch {
    return { error: "토스 결제는 취소됐지만 예약 상태를 저장하지 못했어요. 상태를 '취소'로 직접 바꿔 주세요." };
  }
  await syncReservationToNotionById(id).catch(() => undefined);
  refresh();
  return {
    error: null,
    savedAt: Date.now(),
    notice: depositedAccount
      ? "취소했어요. 토스가 환불 계좌로 보내요(보통 2일 안쪽). 예약 상태도 '취소'로 바꿨어요."
      : "취소했어요. 예약 상태도 '취소'로 바꿨어요.",
  };
}
