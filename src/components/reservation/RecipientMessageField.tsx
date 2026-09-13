import { MESSAGE_GUIDE } from "@/data/reservationOptions";
import type { ResolvedUnit } from "@/lib/units";
import UnitDetailCard from "./UnitDetailCard";
import type { UnitActions } from "./useReservation";

/** 담은 상품 1개마다 받는 분·메시지를 정하는 영역 */
export default function RecipientMessageField({
  units,
  actions,
}: {
  units: ResolvedUnit[];
  actions: UnitActions;
}) {
  const multiple = units.length > 1;

  return (
    <div>
      <p className="text-[15px] font-bold text-ink">
        받는 분·메시지 <span className="text-[13px] font-normal text-sub">선택</span>
      </p>
      <p className="mt-0.5 text-[13px] text-sub">{MESSAGE_GUIDE}</p>

      {units.length === 0 ? (
        <p className="mt-2 rounded-lg bg-soft px-4 py-3 text-sm text-sub">
          상품을 담으면 받는 분과 메시지를 적을 수 있어요.
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
  const state = getBulkState(units);
  const options: { same: boolean; label: string; description: string; active: boolean }[] = [
    { same: true, label: "모두 같음", description: "받는 분·메시지 한 번만 입력", active: state === "same" },
    { same: false, label: "모두 따로", description: "상품마다 각각 입력", active: state === "separate" },
  ];

  return (
    <div className="mt-3">
      <div role="group" aria-label="받는 분·메시지 한 번에 바꾸기" className="grid grid-cols-2 gap-2">
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
          일부만 따로 입력 중이에요. 버튼을 누르면 모든 상품에 한 번에 적용돼요.
        </p>
      )}
    </div>
  );
}
