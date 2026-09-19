import { useT } from "@/hooks/useLocale";
import { needsDeliveryAddress, type ResolvedUnit } from "@/lib/units";
import type { ReceiveMethod } from "@/types/reservation";
import UnitDetailCard from "./UnitDetailCard";
import type { UnitActions } from "./useReservation";

/** 담은 상품 1개마다 받는 분(+배송지)·메시지를 정하는 영역 */
export default function RecipientMessageField({
  units,
  actions,
  receiveMethod,
}: {
  units: ResolvedUnit[];
  actions: UnitActions;
  receiveMethod: ReceiveMethod;
}) {
  const t = useT();
  const multiple = units.length > 1;
  /** 배송지까지 꼭 적어야 하는 상품이 있으면 "(선택)" 대신 필수 안내 */
  const required = units.some((target) => needsDeliveryAddress(receiveMethod, target.unit.product.category));

  return (
    <div>
      <p className="text-[15px] font-bold text-ink">
        {t.recipient.title}{" "}
        {required ? (
          <span className="text-brand">*</span>
        ) : (
          <span className="text-[13px] font-normal text-sub">{t.common.optional}</span>
        )}
      </p>
      {required && <p className="mt-0.5 text-[13px] font-semibold text-brand-dark">{t.recipient.deliveryRequired}</p>}
      <p className="mt-0.5 text-[13px] text-sub">{t.recipient.guide}</p>

      {units.length === 0 ? (
        <p className="mt-2 rounded-lg bg-soft px-4 py-3 text-sm text-sub">
          {t.recipient.empty}
        </p>
      ) : (
        <>
          {multiple && <BulkToggle units={units} onChange={actions.setAllSame} />}
          <div className="mt-3 space-y-3">
            {units.map((target, index) => (
              <UnitDetailCard
                key={target.unit.key}
                target={target}
                order={index + 1}
                showOrder={multiple}
                actions={actions}
                receiveMethod={receiveMethod}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type BulkState = "same" | "separate" | "mixed";

/** 두 번째 상품부터 받는 분·메시지 "같음" 체크가 모두 켜졌는지/꺼졌는지 */
function getBulkState(units: ResolvedUnit[]): BulkState {
  const flags = units.flatMap((target) => [
    ...(target.canCopyRecipient ? [target.recipientCopied] : []),
    ...(target.canCopyMessage ? [target.messageCopied] : []),
  ]);
  if (flags.every(Boolean)) return "same";
  if (flags.every((flag) => !flag)) return "separate";
  return "mixed";
}

function BulkToggle({
  units,
  onChange,
}: {
  units: ResolvedUnit[];
  onChange: (same: boolean) => void;
}) {
  const t = useT();
  const state = getBulkState(units);
  const options: { same: boolean; label: string; description: string; active: boolean }[] = [
    { same: true, label: t.recipient.allSame, description: t.recipient.allSameDescription, active: state === "same" },
    {
      same: false,
      label: t.recipient.allSeparate,
      description: t.recipient.allSeparateDescription,
      active: state === "separate",
    },
  ];

  return (
    <div className="mt-3">
      <div role="group" aria-label={t.recipient.bulkAria} className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={option.active}
            onClick={() => onChange(option.same)}
            className={`rounded-xl border px-3 py-2.5 text-left transition ${
              option.active
                ? "border-brand bg-brand text-white"
                : "border-field bg-white text-ink hover:border-brand"
            }`}
          >
            <span className="block text-[15px] font-bold">{option.label}</span>
            <span className={`block text-[12px] ${option.active ? "text-white/85" : "text-sub"}`}>
              {option.description}
            </span>
          </button>
        ))}
      </div>
      {state === "mixed" && (
        <p className="mt-1.5 text-[12px] text-sub">
          {t.recipient.mixed}
        </p>
      )}
    </div>
  );
}
