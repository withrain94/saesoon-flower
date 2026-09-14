import { PAYPAL_FEE_RATE } from "@/data/reservationOptions";

/** PayPal 수수료 (원, 반올림) */
export function getPaypalFee(totalPrice: number) {
  return Math.round(totalPrice * PAYPAL_FEE_RATE);
}

/** PayPal 결제 금액 = 상품 금액 + 수수료 */
export function getPaypalAmount(totalPrice: number) {
  return totalPrice + getPaypalFee(totalPrice);
}

/** 화면 표시용 수수료 퍼센트 (0.1 → 10) */
export const PAYPAL_FEE_PERCENT = Math.round(PAYPAL_FEE_RATE * 100);
