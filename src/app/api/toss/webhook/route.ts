import { reservationIdFromOrderId } from "@/lib/tossPayment";
import { getTossEnv } from "@/server/env";
import { getReservation } from "@/server/reservations";
import { getTossPaymentByOrderId, syncTossPayment } from "@/server/toss";

/**
 * 토스페이먼츠 웹훅 — 전용 계좌에 입금되면(DEPOSIT_CALLBACK) / 결제 상태가 바뀌면(PAYMENT_STATUS_CHANGED) 토스가 부름.
 * 토스 개발자센터 > 웹훅에 https://saesoon-flower.vercel.app/api/toss/webhook 등록.
 *
 * 보낸 내용은 누구나 흉내 낼 수 있으므로 믿지 않고, 주문번호만 꺼내 토스 API(비밀 키)로 진짜 상태를 다시 물어 반영한다.
 * 토스는 10초 안에 200을 못 받으면 다시 보내므로(최대 7번), 처리할 게 없어도 200으로 답한다.
 */
export async function POST(request: Request) {
  if (!getTossEnv()) return Response.json({ ok: false }, { status: 200 });

  const body = (await request.json().catch(() => null)) as { orderId?: unknown; data?: { orderId?: unknown } } | null;
  const orderId = body?.orderId ?? body?.data?.orderId;
  const reservationId = reservationIdFromOrderId(orderId);
  if (!reservationId || typeof orderId !== "string") return Response.json({ ok: true, skipped: "unknown order" });

  try {
    const reservation = await getReservation(reservationId);
    if (!reservation) return Response.json({ ok: true, skipped: "no reservation" });

    const result = await getTossPaymentByOrderId(orderId);
    if (!result.ok) {
      console.error("[toss webhook] 결제 조회 실패", result.code);
      // 토스 쪽 일시 오류면 다시 보내도록 500
      return Response.json({ ok: false }, { status: result.code === "NETWORK" ? 500 : 200 });
    }
    await syncTossPayment(reservation, result.payment);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[toss webhook] 처리 실패", error instanceof Error ? error.message : "unknown");
    return Response.json({ ok: false }, { status: 500 });
  }
}
