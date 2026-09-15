"use client";

import type { ReactNode } from "react";
import BankAccountCard from "@/components/reservation/BankAccountCard";
import DocumentsPanel from "@/components/reservation/DocumentsPanel";
import { findBlackboardPreset } from "@/data/reservationOptions";
import { useLookupT } from "@/hooks/useLookupT";
import { useT } from "@/hooks/useLocale";
import { parseDateKey } from "@/lib/date";
import { getSlotHour } from "@/lib/time";
import type { CustomerReservationView, ReservationDelivery } from "@/types/reservation";

/** 손님 예약 조회 결과 — 신청한 내용을 손님 언어로 (매장 메모 등은 받지 않음) */
export default function LookupReservationDetails({ reservation }: { reservation: CustomerReservationView }) {
  const t = useT();
  const l = useLookupT();
  const { request, status, cancelRequestedAt } = reservation;
  const date = parseDateKey(request.date);
  const payment = t.payment.methods[request.paymentMethod];
  const quantities = Object.fromEntries(request.items.map((item) => [item.productId, item.quantity]));
  const itemName = (category: ReservationDelivery["category"], price: number) =>
    t.format.itemName(t.categories[category].name, t.format.priceShort(price));

  const describeMessage = (delivery: ReservationDelivery) => {
    switch (delivery.messageType) {
      case "none":
        return t.message.describeNone;
      case "memo":
        return t.message.describeMemo(delivery.memo);
      case "ribbon":
        return t.message.describeRibbon(delivery.ribbonLeft, delivery.ribbonRight);
      case "blackboard": {
        const preset = findBlackboardPreset(delivery.category, delivery.blackboardPreset);
        return t.message.describeBlackboard(preset && !preset.text ? t.blackboardPresets[preset.id] : delivery.blackboard);
      }
    }
  };

  const canceled = status === "canceled";
  const statusText = canceled ? l.status.canceled : cancelRequestedAt ? l.cancelRequested : l.status[status];

  return (
    <div className="space-y-3">
      <div
        className={`rounded-2xl px-4 py-4 ${canceled ? "bg-soft" : cancelRequestedAt ? "border border-danger/40 bg-white" : "bg-panel"}`}
      >
        <p className="text-[13px] text-sub">
          {l.receiptLabel} <span className="font-bold text-ink">{reservation.receiptNumber}</span>
        </p>
        <p className={`mt-1 text-[17px] font-extrabold ${canceled ? "text-sub" : cancelRequestedAt ? "text-danger" : "text-brand-dark"}`}>
          {statusText}
        </p>
      </div>

      <Card title={l.sections.schedule}>
        <p className="text-[18px] font-extrabold text-ink">
          {t.format.dateLong(date.getMonth() + 1, date.getDate(), date.getDay())} {t.format.time(getSlotHour(request.time))}
        </p>
        <p className="mt-1 text-[13px] text-sub">{t.complete.orderer(request.ordererName, request.ordererPhone)}</p>
      </Card>

      <Card title={l.sections.items}>
        <ul className="divide-y divide-line">
          {request.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3 py-2 text-[14px]">
              <span className="text-ink">
                {itemName(item.category, item.price)} × {item.quantity}
              </span>
              <span className="shrink-0 text-body">{t.format.price(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 flex justify-between border-t border-line pt-2 text-[15px] font-extrabold text-ink">
          <span>{l.sections.total(request.totalQuantity)}</span>
          <span>{t.format.price(request.totalPrice)}</span>
        </p>
        {request.orchidDelivery && (
          <p className="mt-2 text-[13px] text-body">
            {t.complete.orchidDelivery(
              request.orchidDelivery.method === "restaurant"
                ? t.orchidDelivery.describeRestaurant(
                    t.restaurants[request.orchidDelivery.restaurant as keyof typeof t.restaurants] ??
                      request.orchidDelivery.restaurant,
                    request.orchidDelivery.reservationName,
                  )
                : t.orchidDelivery.describePickup,
            )}
          </p>
        )}
      </Card>

      <Card title={l.sections.deliveries}>
        <ul className="space-y-2 text-[13px]">
          {request.deliveries.map((delivery) => {
            const name = itemName(delivery.category, delivery.price);
            const quantity = quantities[delivery.productId] ?? 1;
            const recipient = [delivery.recipientName, delivery.recipientPhone].filter(Boolean).join(" · ");
            return (
              <li key={`${delivery.productId}-${delivery.unitNo}`} className="rounded-xl bg-soft px-3 py-2.5">
                <p className="font-bold text-ink">
                  {quantity > 1 ? t.format.unitName(name, delivery.unitNo, quantity) : name}
                </p>
                <p className="mt-1 text-body">{t.complete.recipient(recipient || t.recipient.describeEmpty)}</p>
                {(delivery.topperName || delivery.topperRank) && (
                  <p className="text-body">{t.topper.describe(delivery.topperName, delivery.topperRank)}</p>
                )}
                <p className="text-body">{t.complete.message(describeMessage(delivery))}</p>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title={l.sections.payment}>
        <p className="text-[14px] font-bold text-ink">{payment.label}</p>
        {request.paymentMethod === "bank" && status === "received" && !cancelRequestedAt && (
          <div className="mt-2 rounded-xl bg-panel p-2">
            <p className="px-1 pb-2 text-[13px] text-body">{payment.complete}</p>
            <BankAccountCard />
          </div>
        )}
        {request.paymentMethod === "bank" && request.cashReceiptType !== "none" && (
          <p className="mt-1 text-[13px] text-body">
            {t.complete.cashReceipt(t.payment.cashReceiptOptions[request.cashReceiptType], request.cashReceiptNumber)}
          </p>
        )}
        {request.paymentMethod === "card" && (
          <p className="mt-1 text-[13px] text-body">
            {t.complete.cardPayer(request.cardPayer === "other" ? request.cardPayerContact : t.complete.cardPayerSame)}
          </p>
        )}
        {request.paymentMethod === "paypal" && (
          <p className="mt-1 text-[13px] text-body">
            {t.complete.paypal(t.format.price(request.paypalAmount), request.paypalEmail)}
          </p>
        )}
      </Card>

      {request.documents.length > 0 && !canceled && <DocumentsPanel id={reservation.id} reservation={request} />}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line px-4 py-3">
      <h2 className="mb-1.5 text-[13px] font-bold text-sub">{title}</h2>
      {children}
    </section>
  );
}
