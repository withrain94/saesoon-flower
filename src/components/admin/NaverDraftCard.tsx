"use client";

import Link from "next/link";
import ErrorText from "@/components/ui/ErrorText";
import { getEventOn } from "@/data/events";
import { NAVER_MAX_QUANTITY, naverProductChoices, type NaverDraft } from "@/lib/naverBooking";

const inputClass =
  "w-full rounded-lg border border-field bg-white px-3 py-2 text-[14px] text-ink placeholder:text-faint focus:border-brand focus:outline-none";

const hourOptions = Array.from({ length: 17 }, (_, index) => `${String(index + 6).padStart(2, "0")}:00`);

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[12.5px] font-semibold text-sub">{label}</span>
      {children}
    </label>
  );
}

/** 네이버 예약 1건 칸 — 자동으로 채운 값을 고침 */
export default function NaverDraftCard({
  draft,
  index,
  total,
  onChange,
  onRemove,
  error,
  existingId,
}: {
  draft: NaverDraft;
  index: number;
  total: number;
  onChange: (patch: Partial<NaverDraft>) => void;
  onRemove: () => void;
  error?: string;
  existingId?: string;
}) {
  const update = onChange;
  const updateItem = (at: number, patch: Partial<NaverDraft["items"][number]>) =>
    onChange({ items: draft.items.map((item, i) => (i === at ? { ...item, ...patch } : item)) });
  const event = draft.date ? getEventOn(draft.date) : undefined;
  const topperEvent = event && event.topperCategories.length > 0 ? event : undefined;

  return (
    <div className="rounded-xl bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-extrabold text-ink">
          {index + 1}/{total} · {draft.ordererName || "예약자 미입력"}
          <span className="ml-1.5 text-[12.5px] font-semibold text-sub">{draft.date} {draft.time}</span>
        </p>
        <button type="button" onClick={onRemove} className="shrink-0 text-[12.5px] font-semibold text-sub hover:text-danger">
          이 예약 빼기
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="네이버 예약번호">
          <input className={inputClass} value={draft.bookingNumber} onChange={(e) => update({ bookingNumber: e.target.value })} />
        </Field>
        <Field label="결제 (네이버)">
          <div className="flex gap-2">
            <input
              className={inputClass}
              inputMode="numeric"
              value={draft.paidAmount || ""}
              onChange={(e) => update({ paidAmount: Number(e.target.value.replace(/\D/g, "")) || 0 })}
              aria-label="실제 결제 금액"
              placeholder="실결제 금액"
            />
            <input
              className={inputClass}
              value={draft.paymentLabel}
              onChange={(e) => update({ paymentLabel: e.target.value })}
              aria-label="결제수단"
              placeholder="결제수단"
            />
          </div>
        </Field>
        <Field label="예약자">
          <input className={inputClass} value={draft.ordererName} onChange={(e) => update({ ordererName: e.target.value })} />
        </Field>
        <Field label="예약자 연락처">
          <input className={inputClass} value={draft.ordererPhone} onChange={(e) => update({ ordererPhone: e.target.value })} />
        </Field>
        <Field label="받는 날">
          <input
            type="date"
            className={inputClass}
            value={draft.date}
            onChange={(e) => update({ date: e.target.value, forEvent: !!getEventOn(e.target.value)?.topperCategories.length })}
          />
        </Field>
        <Field label="받는 시간">
          <select className={inputClass} value={draft.time} onChange={(e) => update({ time: e.target.value })}>
            <option value="">골라 주세요</option>
            {hourOptions.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="mt-4 text-[13px] font-bold text-ink">상품</p>
      <ul className="mt-1.5 space-y-2">
        {draft.items.map((item, index) => (
          <li key={index} className="rounded-lg bg-soft p-2">
            {item.label && <p className="mb-1 text-[12px] text-sub">네이버: {item.label}</p>}
            <div className="flex gap-2">
              <select
                className={`${inputClass} ${item.productId ? "" : "border-danger"}`}
                value={item.productId}
                onChange={(e) => updateItem(index, { productId: e.target.value })}
                aria-label="사이트 상품"
              >
                <option value="">맞는 상품을 골라 주세요</option>
                {naverProductChoices.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={NAVER_MAX_QUANTITY}
                className={`${inputClass} w-20`}
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                aria-label="수량"
              />
              <button
                type="button"
                onClick={() => update({ items: draft.items.filter((_, at) => at !== index) })}
                className="shrink-0 px-2 text-[13px] text-sub hover:text-danger"
                aria-label="이 상품 빼기"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => update({ items: [...draft.items, { productId: "", quantity: 1, label: "" }] })}
          className="rounded-lg border border-field px-3 py-1.5 text-[13px] font-semibold text-brand-dark hover:border-brand"
        >
          + 상품 추가
        </button>
        <label className="flex items-center gap-2 text-[13px] text-body">
          꽃다발 쇼핑백
          <input
            type="number"
            min={0}
            max={NAVER_MAX_QUANTITY}
            className={`${inputClass} w-20`}
            value={draft.shoppingBags}
            onChange={(e) => update({ shoppingBags: Number(e.target.value) || 0 })}
          />
          개
        </label>
      </div>

      <p className="mt-4 text-[13px] font-bold text-ink">받는 방법</p>
      <div className="mt-1.5 flex gap-4 text-[14px]">
        {(["pickup", "delivery"] as const).map((method) => (
          <label key={method} className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={draft.receiveMethod === method}
              onChange={() => update({ receiveMethod: method })}
            />
            {method === "pickup" ? "매장에서 픽업" : "배송"}
          </label>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="받는 분 성함">
          <input className={inputClass} value={draft.recipientName} onChange={(e) => update({ recipientName: e.target.value })} />
        </Field>
        <Field label="받는 분 연락처">
          <input className={inputClass} value={draft.recipientPhone} onChange={(e) => update({ recipientPhone: e.target.value })} />
        </Field>
        {draft.receiveMethod === "delivery" && (
          <Field label="배송지" wide>
            <input
              className={`${inputClass} ${draft.recipientAddress ? "" : "border-danger"}`}
              value={draft.recipientAddress}
              onChange={(e) => update({ recipientAddress: e.target.value })}
            />
          </Field>
        )}
      </div>

      {topperEvent && (
        <div className="mt-4 rounded-lg bg-brand-tint p-2.5">
          <label className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
            <input type="checkbox" checked={draft.forEvent} onChange={(e) => update({ forEvent: e.target.checked })} />
            {topperEvent.icon} 이 날 행사 꽃이에요 (무료 토퍼)
          </label>
          {draft.forEvent && (
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Field label="토퍼 · 보내는 분 이름 또는 팀">
                <input className={inputClass} value={draft.sender} onChange={(e) => update({ sender: e.target.value })} />
              </Field>
              {topperEvent.topperAsksCourse && (
                <Field label="토퍼 · 수료 과정">
                  <input className={inputClass} value={draft.course} onChange={(e) => update({ course: e.target.value })} />
                </Field>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3">
        {!topperEvent && (
          <Field label="보내는 분 (네이버 답)">
            <input className={inputClass} value={draft.sender} onChange={(e) => update({ sender: e.target.value })} />
          </Field>
        )}
        <Field label="원하는 색감">
          <input className={inputClass} value={draft.colorNote} onChange={(e) => update({ colorNote: e.target.value })} />
        </Field>
        <Field label="요청사항 (리본·메모 문구 등 — 상품마다 메시지 칸에 들어가요)">
          <textarea
            rows={4}
            className={inputClass}
            value={draft.requestNote}
            onChange={(e) => update({ requestNote: e.target.value })}
          />
        </Field>
      </div>

      {error && (
        <ErrorText>
          {error}{" "}
          {existingId && (
            <Link href={`/admin/${existingId}`} className="underline">
              넣은 예약 보기
            </Link>
          )}
        </ErrorText>
      )}
    </div>
  );
}
