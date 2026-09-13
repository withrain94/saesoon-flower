import Checkbox from "@/components/ui/Checkbox";
import { inputClassName } from "@/components/ui/Field";
import { getCategory } from "@/data/products";
import { PHONE_PATTERN } from "@/data/reservationOptions";
import { describeMessage, describeRecipient, getUnitLabel, type ResolvedUnit } from "@/lib/units";
import MessageEditor from "./MessageEditor";
import type { UnitActions } from "./useReservation";

const PHONE_TITLE = "연락처를 다시 확인해 주세요. (예: 010-1234-5678)";

/** 상품 1개의 받는 분·메시지 카드 */
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
  const { unit, own, recipient, message, canCopyRecipient, canCopyMessage, recipientCopied, messageCopied } =
    target;
  const idPrefix = `unit-${unit.key.replace("#", "-")}`;
  const categoryName = getCategory(unit.product.category).name;

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      {showOrder && (
        <p className="mb-3 flex items-center gap-2 text-[15px] font-bold text-ink">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[12px] text-white">
            {order}
          </span>
          {getUnitLabel(unit)}
        </p>
      )}

      {/* 받는 분 */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] font-bold text-ink">받는 분</p>
          {canCopyRecipient && (
            <Checkbox checked={recipientCopied} onChange={(same) => actions.setSameRecipient(target, same)}>
              앞 상품과 같음
            </Checkbox>
          )}
        </div>
        {recipientCopied ? (
          <CopiedValue>{describeRecipient(recipient)}</CopiedValue>
        ) : (
          <div className="mt-2 grid gap-2">
            <input
              id={`${idPrefix}-recipient-name`}
              type="text"
              value={own.recipient.name}
              onChange={(event) => actions.setRecipient(target, { name: event.target.value })}
              aria-label="받는 분 성함"
              placeholder="받는 분 성함 (픽업자가 다르거나 배송일 때)"
              className={inputClassName}
            />
            <input
              id={`${idPrefix}-recipient-phone`}
              type="tel"
              inputMode="tel"
              pattern={PHONE_PATTERN}
              title={PHONE_TITLE}
              value={own.recipient.phone}
              onChange={(event) => actions.setRecipient(target, { phone: event.target.value })}
              aria-label="받는 분 연락처"
              placeholder="받는 분 연락처 010-0000-0000"
              className={inputClassName}
            />
          </div>
        )}
      </div>

      {/* 메시지 */}
      <div className="mt-4 border-t border-line pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] font-bold text-ink">메시지</p>
          {canCopyMessage && (
            <Checkbox checked={messageCopied} onChange={(same) => actions.setSameMessage(target, same)}>
              앞 {categoryName} 메시지와 같음
            </Checkbox>
          )}
        </div>
        {messageCopied ? (
          <CopiedValue>{describeMessage(message)}</CopiedValue>
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
