import { ko } from "@/i18n/ko";
import { formatAdminDateTime } from "@/lib/adminFormat";
import { paymentActionWord } from "@/lib/cancelNotice";
import type { StoredReservation } from "@/types/reservation";

/**
 * 손님이 예약 조회 화면에서 취소한 기록.
 * - 입금(결제) 안 했다고 답함 → 이미 취소됨: 실제로 입금이 없는지만 확인
 * - 입금(결제) 했다고 답함 → 취소 요청: 환불(계좌이체는 적어준 계좌로) 후 위 상태 버튼에서 "취소"로 마무리
 */
export default function CancelRequestCard({ reservation }: { reservation: StoredReservation }) {
  const { cancelRequest, status, request } = reservation;
  if (!cancelRequest) return null;

  const method = request.paymentMethod;
  const pending = cancelRequest.paid && status !== "canceled";
  const paidWord = paymentActionWord(method);
  const cashReceipt =
    method === "bank" && request.cashReceiptType !== "none"
      ? `${ko.payment.cashReceiptOptions[request.cashReceiptType]} · ${request.cashReceiptNumber}`
      : null;

  const title = !cancelRequest.paid
    ? `손님이 직접 취소함 · "${paidWord} 안 했어요"라고 답함`
    : pending
      ? `🔴 손님 취소 요청 · "${paidWord} 했어요" · 환불 필요`
      : `취소 요청 (처리됨) · "${paidWord} 했어요"라고 답함`;

  const rows: [string, string][] = [
    ["손님 답", cancelRequest.paid ? `이미 ${paidWord}했어요` : `아직 ${paidWord} 안 했어요`],
    ...(cancelRequest.paid && method === "bank"
      ? ([
          ["환불 은행", cancelRequest.refundBank],
          ["환불 계좌번호", cancelRequest.refundAccount],
          ["예금주", cancelRequest.refundHolder],
        ] as [string, string][])
      : []),
    ...(method === "card"
      ? ([["카드 결제하실 분", request.cardPayer === "other" ? request.cardPayerContact : "예약자와 동일"]] as [string, string][])
      : []),
    ...(method === "paypal" ? ([["PayPal 이메일", request.paypalEmail]] as [string, string][]) : []),
    ...(cashReceipt ? ([["현금영수증", cashReceipt]] as [string, string][]) : []),
  ];

  const guide = !cancelRequest.paid
    ? `${paidWord} 내역이 없는지 확인해 주세요. 들어온 돈이 있으면 손님께 연락해 환불 계좌를 받아 주세요.`
    : method === "bank"
      ? "실제 입금자 이름·계좌와 같은지 확인한 뒤 환불하고, 위 상태 버튼에서 '취소'를 눌러 마무리해 주세요."
      : `${paidWord}를 취소(환불)한 뒤, 위 상태 버튼에서 '취소'를 눌러 마무리해 주세요.`;

  return (
    <section className={`rounded-2xl bg-white p-4 print:hidden ${pending ? "border-2 border-danger" : "border border-line"}`}>
      <h2 className={`text-[15px] font-extrabold ${pending ? "text-danger" : "text-strong"}`}>{title}</h2>
      <p className="mt-1 text-[12px] text-sub">
        {cancelRequest.paid ? "요청" : "취소"} {formatAdminDateTime(cancelRequest.requestedAt)}
      </p>

      <dl className="mt-3 space-y-1 text-[14px]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[6.5rem_1fr] gap-2">
            <dt className="text-sub">{label}</dt>
            <dd className="min-w-0 break-all font-semibold text-ink">{value || "-"}</dd>
          </div>
        ))}
      </dl>

      {(pending || !cancelRequest.paid) && (
        <p className="mt-3 rounded-lg bg-soft px-3 py-2 text-[13px] text-body">{guide}</p>
      )}
      {cashReceipt && (pending || !cancelRequest.paid) && (
        <p className="mt-2 rounded-lg bg-soft px-3 py-2 text-[13px] text-body">
          현금영수증을 이미 발행했다면 홈택스 등에서 위 번호로 발행한 건을 <b>취소</b>해 주세요.
        </p>
      )}
    </section>
  );
}
