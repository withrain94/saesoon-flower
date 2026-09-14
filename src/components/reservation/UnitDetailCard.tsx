import Checkbox from "@/components/ui/Checkbox";
import { inputClassName } from "@/components/ui/Field";
import { PHONE_PATTERN } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import {
  describeMessage,
  describeRecipient,
  describeTopper,
  getUnitLabel,
  type ResolvedUnit,
} from "@/lib/units";
import MessageEditor from "./MessageEditor";
import type { UnitActions } from "./useReservation";

/** 상품 1개의 받는 분(+ 특별한 날 토퍼)·메시지 카드 */
export default function UnitDetailCard({
  target,
  order,
  showOrder,
  actions,
}: {
  target: ResolvedUnit;
  /** 화면에 보이는 순번 (1부터) */
  order: number;
  /** 상품이 1개뿐이면 순번·체크박스 없이 간단히 */
  showOrder: boolean;
  actions: UnitActions;
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
    messageCopied,
    topperAvailable,
    topperCopied,
  } = target;
  const idPrefix = `unit-${unit.key.replace("#", "-")}`;
  const categoryName = t.categories[unit.product.category].name;

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
          {canCopyRecipient && (
            <Checkbox checked={recipientCopied} onChange={(same) => actions.setSameRecipient(target, same)}>
              {t.recipient.sameRecipient}
            </Checkbox>
          )}
        </div>
        {recipientCopied ? (
          <CopiedValue>{describeRecipient(recipient, t)}</CopiedValue>
        ) : (
          <div className="mt-2 grid gap-2">
            <input
              id={`${idPrefix}-recipient-name`}
              type="text"
              value={own.recipient.name}
              onChange={(event) => actions.setRecipient(target, { name: event.target.value })}
              aria-label={t.recipient.nameAria}
              placeholder={t.recipient.namePlaceholder}
              className={inputClassName}
            />
            <input
              id={`${idPrefix}-recipient-phone`}
              type="tel"
              inputMode="tel"
              pattern={PHONE_PATTERN}
              title={t.reserve.phoneTitle}
              value={own.recipient.phone}
              onChange={(event) => actions.setRecipient(target, { phone: event.target.value })}
              aria-label={t.recipient.phoneAria}
              placeholder={t.recipient.phonePlaceholder}
              className={inputClassName}
            />
          </div>
        )}

        {/* 특별한 날 무료 토퍼 — 받는 분이 "같음"이면 토퍼도 앞 상품을 따름 */}
        {topperAvailable &&
          (topperCopied ? (
            <CopiedValue>{describeTopper(topper, t)}</CopiedValue>
          ) : (
            <div className="mt-3 rounded-lg bg-brand-tint px-3 py-3">
              <p className="text-[14px] font-bold text-brand-dark">{t.topper.title}</p>
              <p className="mt-0.5 text-[12.5px] text-sub">{t.topper.description}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
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
