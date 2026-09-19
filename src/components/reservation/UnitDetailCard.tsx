import Checkbox from "@/components/ui/Checkbox";
import { inputClassName } from "@/components/ui/Field";
import { PHONE_PATTERN } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import { getEventCopy } from "@/lib/events";
import {
  describeMessage,
  describeRecipient,
  describeTopper,
  getUnitLabel,
  needsDeliveryAddress,
  type ResolvedUnit,
} from "@/lib/units";
import type { ReceiveMethod } from "@/types/reservation";
import MessageEditor from "./MessageEditor";
import type { UnitActions } from "./useReservation";

/** 상품 1개의 받는 분(+ 배송지, 특별한 날 토퍼)·메시지 카드 */
export default function UnitDetailCard({
  target,
  order,
  showOrder,
  actions,
  receiveMethod,
}: {
  target: ResolvedUnit;
  /** 화면에 보이는 순번 (1부터) */
  order: number;
  /** 상품이 1개뿐이면 순번·체크박스 없이 간단히 */
  showOrder: boolean;
  actions: UnitActions;
  receiveMethod: ReceiveMethod;
}) {
  const t = useT();
  const {
    unit,
    own,
    recipient,
    topper,
    message,
    canCopyRecipient,
    canCopyMessage,
    recipientCopied,
    recipientFromOrderer,
    messageCopied,
    topperEvent,
    topperCopied,
  } = target;
  const idPrefix = `unit-${unit.key.replace("#", "-")}`;
  const categoryName = t.categories[unit.product.category].name;
  /** 배송이면 꽃다발·꽃바구니는 받는 분 성함·연락처·배송지 필수 */
  const withAddress = needsDeliveryAddress(receiveMethod, unit.product.category);
  const ordererText = [recipient.name, recipient.phone].filter(Boolean).join(" · ");

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      {showOrder && (
        <p className="mb-3 flex items-center gap-2 text-[15px] font-bold text-ink">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] text-white">
            {order}
          </span>
          {getUnitLabel(unit, t)}
        </p>
      )}

      {/* 받는 분 */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] font-bold text-ink">{t.recipient.recipientTitle}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {canCopyRecipient && (
              <Checkbox checked={recipientCopied} onChange={(same) => actions.setSameRecipient(target, same)}>
                {t.recipient.sameRecipient}
              </Checkbox>
            )}
            {!recipientCopied && (
              <Checkbox checked={own.sameAsOrderer} onChange={(same) => actions.setSameAsOrderer(target, same)}>
                {t.recipient.sameAsOrderer}
              </Checkbox>
            )}
          </div>
        </div>
        {recipientCopied ? (
          <CopiedValue>{describeRecipient(recipient, t, withAddress)}</CopiedValue>
        ) : (
          <div className="mt-2 grid gap-2">
            {recipientFromOrderer ? (
              <p
                className={`rounded-lg bg-brand-tint px-3 py-2.5 text-[14px] ${ordererText ? "text-body" : "font-semibold text-brand-dark"}`}
              >
                {ordererText || t.recipient.ordererEmpty}
              </p>
            ) : (
              <>
                <input
                  id={`${idPrefix}-recipient-name`}
                  type="text"
                  required={withAddress}
                  maxLength={50}
                  value={own.recipient.name}
                  onChange={(event) => actions.setRecipient(target, { name: event.target.value })}
                  aria-label={t.recipient.nameAria}
                  placeholder={withAddress ? t.recipient.namePlaceholderDelivery : t.recipient.namePlaceholder}
                  className={inputClassName}
                />
                <input
                  id={`${idPrefix}-recipient-phone`}
                  type="tel"
                  inputMode="tel"
                  required={withAddress}
                  pattern={PHONE_PATTERN}
                  title={t.reserve.phoneTitle}
                  value={own.recipient.phone}
                  onChange={(event) => actions.setRecipient(target, { phone: event.target.value })}
                  aria-label={t.recipient.phoneAria}
                  placeholder={t.recipient.phonePlaceholder}
                  className={inputClassName}
                />
              </>
            )}
            {withAddress && (
              <input
                id={`${idPrefix}-recipient-address`}
                type="text"
                required
                maxLength={200}
                value={own.recipient.address}
                onChange={(event) => actions.setRecipient(target, { address: event.target.value })}
                aria-label={t.recipient.addressAria}
                placeholder={t.recipient.addressPlaceholder}
                className={inputClassName}
              />
            )}
          </div>
        )}

        {/* 특별한 날 무료 토퍼 — 받는 분이 "같음"이면 토퍼도 앞 상품을 따름 */}
        {topperEvent &&
          (topperCopied ? (
            <CopiedValue>{describeTopper(topper, t)}</CopiedValue>
          ) : (
            <div className="mt-3 rounded-lg bg-brand-tint px-3 py-3">
              <p className="text-[14px] font-bold text-brand-dark">{getEventCopy(topperEvent, t).topperTitle}</p>
              <p className="mt-0.5 text-[12.5px] text-sub">{getEventCopy(topperEvent, t).topperDescription}</p>
              {/* 승진식: 이름·직급 한 줄 / 수료식: 과정 이름이 길 수 있어 이름·수료 과정을 두 줄로 */}
              <div className={`mt-2 grid gap-2 ${topperEvent.topperDetail === "rank" ? "grid-cols-2" : ""}`}>
                <input
                  id={`${idPrefix}-topper-name`}
                  type="text"
                  maxLength={30}
                  value={own.topper.name}
                  onChange={(event) => actions.setTopper(target, { name: event.target.value })}
                  aria-label={t.topper.nameAria}
                  placeholder={t.topper.namePlaceholder}
                  className={inputClassName}
                />
                {topperEvent.topperDetail === "rank" ? (
                  <input
                    id={`${idPrefix}-topper-rank`}
                    type="text"
                    maxLength={30}
                    value={own.topper.rank}
                    onChange={(event) => actions.setTopper(target, { rank: event.target.value })}
                    aria-label={t.topper.rankAria}
                    placeholder={t.topper.rankPlaceholder}
                    className={inputClassName}
                  />
                ) : (
                  <input
                    id={`${idPrefix}-topper-course`}
                    type="text"
                    maxLength={50}
                    value={own.topper.course}
                    onChange={(event) => actions.setTopper(target, { course: event.target.value })}
                    aria-label={t.topper.courseAria}
                    placeholder={t.topper.coursePlaceholder}
                    className={inputClassName}
                  />
                )}
              </div>
            </div>
          ))}
      </div>

      {/* 메시지 */}
      <div className="mt-4 border-t border-line pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] font-bold text-ink">{t.recipient.messageTitle}</p>
          {canCopyMessage && (
            <Checkbox checked={messageCopied} onChange={(same) => actions.setSameMessage(target, same)}>
              {t.recipient.sameMessage(categoryName)}
            </Checkbox>
          )}
        </div>
        {messageCopied ? (
          <CopiedValue>{describeMessage(message, t)}</CopiedValue>
        ) : (
          <div className="mt-2">
            <MessageEditor
              idPrefix={idPrefix}
              product={unit.product}
              value={own.message}
              onChange={(patch) => actions.setMessage(target, patch)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** "같음"으로 채워진 값 */
function CopiedValue({ children }: { children: string }) {
  return (
    <p className="mt-2 rounded-lg bg-brand-tint px-3 py-2.5 text-[14px] text-body">{children}</p>
  );
}
