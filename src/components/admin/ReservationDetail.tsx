import type { ReactNode } from "react";
import { ko } from "@/i18n/ko";
import {
  describeColor,
  describeDeliveryMessage,
  describeDeliveryRecipient,
  describeOrchidDelivery,
  formatAdminDate,
  formatAdminDateTime,
  formatAdminItemName,
  formatAdminTime,
  localeNames,
} from "@/lib/adminFormat";
import { formatReceiptNumber } from "@/lib/format";
import { notionPageTitle } from "@/lib/notionReservation";
import type { StoredReservation } from "@/types/reservation";
import AdminDocuments from "./AdminDocuments";
import CancelRequestCard from "./CancelRequestCard";
import DocumentEmailButton from "./DocumentEmailButton";
import AdminMemoForm from "./AdminMemoForm";
import NotionSyncButton from "./NotionSyncButton";
import StatusBadge from "./StatusBadge";
import StatusChanger from "./StatusChanger";

/** 관리자 예약 상세 — 신청서에 적힌 내용 전부 + 상태·메모 변경 */
export default function ReservationDetail({ reservation }: { reservation: StoredReservation }) {
  const { id, request, status, adminMemo, createdAt } = reservation;
  const payment = ko.payment;
  const color = describeColor(request);
  const orchidDelivery = describeOrchidDelivery(request);
  const quantities = Object.fromEntries(request.items.map((item) => [item.productId, item.quantity]));

  return (
    <div className="space-y-3">
      <section className="rounded-2xl bg-white p-4 print:hidden">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold text-brand-dark">받는 날짜·시간</p>
            <p className="mt-0.5 text-[22px] font-extrabold leading-tight text-ink">
              {formatAdminDate(request.date)} {formatAdminTime(request.time)}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
        <p className="mt-2 text-[12px] text-sub">
          접수번호 {formatReceiptNumber(id)} · 접수 {formatAdminDateTime(createdAt)}
        </p>
        <div className="mt-3 border-t border-line pt-3">
          <StatusChanger id={id} status={status} />
        </div>
      </section>

      <CancelRequestCard reservation={reservation} />

      <Card title="예약자">
        <Rows>
          <Row label="성함">{request.ordererName}</Row>
          <Row label="연락처">
            <a href={`tel:${request.ordererPhone}`} className="font-semibold text-brand-dark underline">
              {request.ordererPhone}
            </a>
          </Row>
          {request.locale && request.locale !== "ko" && (
            <Row label="신청 언어">
              <span className="font-semibold text-danger">{localeNames[request.locale]}</span> (외국어로 신청)
            </Row>
          )}
        </Rows>
      </Card>

      <Card title="상품">
        <ul className="divide-y divide-line">
          {request.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3 py-2 text-[14px]">
              <span className="text-ink">
                {formatAdminItemName(item.category, item.price)} × {item.quantity}
              </span>
              <span className="text-body">{ko.format.price(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 flex justify-between border-t-2 border-ink pt-2 text-[15px] font-extrabold text-ink">
          <span>합계 {request.totalQuantity}개</span>
          <span>{ko.format.price(request.totalPrice)}</span>
        </p>
        {(color || orchidDelivery) && (
          <Rows className="mt-3">
            {color && <Row label={ko.color.label}>{color}</Row>}
            {orchidDelivery && <Row label={ko.orchidDelivery.title}>{orchidDelivery}</Row>}
          </Rows>
        )}
      </Card>

      <Card title="받는 분·메시지">
        <ul className="space-y-2">
          {request.deliveries.map((delivery) => {
            const name = formatAdminItemName(delivery.category, delivery.price);
            const quantity = quantities[delivery.productId] ?? 1;
            const topper = [delivery.topperName, delivery.topperRank].filter(Boolean).join(" ");
            return (
              <li key={`${delivery.productId}-${delivery.unitNo}`} className="rounded-xl bg-soft px-3 py-2.5">
                <p className="text-[13px] font-bold text-strong">
                  {quantity > 1 ? ko.format.unitName(name, delivery.unitNo, quantity) : name}
                </p>
                <Rows className="mt-1">
                  <Row label="받는 분">{describeDeliveryRecipient(delivery)}</Row>
                  <Row label="메시지">{describeDeliveryMessage(delivery)}</Row>
                  {topper && <Row label="승진 토퍼">{topper}</Row>}
                </Rows>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="결제">
        <Rows>
          <Row label="결제 방법">
            <span className="font-semibold">{payment.methods[request.paymentMethod].label}</span>
          </Row>
          {request.paymentMethod === "bank" && (
            <Row label={payment.cashReceiptTitle}>
              {payment.cashReceiptOptions[request.cashReceiptType]}
              {request.cashReceiptNumber && ` · ${request.cashReceiptNumber}`}
            </Row>
          )}
          {request.paymentMethod === "card" && (
            <Row label="결제하실 분">
              {request.cardPayer === "other" ? request.cardPayerContact : ko.complete.cardPayerSame}
            </Row>
          )}
          {request.paymentMethod === "paypal" && (
            <>
              <Row label="PayPal 이메일">{request.paypalEmail}</Row>
              <Row label="PayPal 금액">{ko.format.price(request.paypalAmount)} (수수료 포함)</Row>
            </>
          )}
        </Rows>
      </Card>

      {request.documents.length > 0 && (
        <Card title="견적서·거래명세표 요청">
          <Rows className="mb-3 print:hidden">
            <Row label="상호·기관명">{request.documentCompany}</Row>
            <Row label="사업자등록번호">{request.documentBusinessNumber || "-"}</Row>
            <Row label="보낼 이메일">{request.documentEmail}</Row>
          </Rows>
          <DocumentEmailButton id={id} />
          <AdminDocuments request={request} />
        </Card>
      )}

      <Card title="매장 메모">
        <AdminMemoForm id={id} memo={adminMemo} />
      </Card>

      <Card title="노션 날짜별 표">
        <NotionSyncButton id={id} pageTitle={notionPageTitle(request.date)} />
      </Card>

      <p className="px-1 pb-6 text-[12px] text-sub print:hidden">
        개인정보 수집·이용 동의{" "}
        {request.privacyAgreed ? `· ${formatAdminDateTime(request.submittedAt)}` : "기록 없음"}
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4">
      <h2 className="mb-2 text-[15px] font-extrabold text-ink print:hidden">{title}</h2>
      {children}
    </section>
  );
}

function Rows({ className = "", children }: { className?: string; children: ReactNode }) {
  return <dl className={`space-y-1 text-[14px] ${className}`}>{children}</dl>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-2">
      <dt className="text-sub">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}
