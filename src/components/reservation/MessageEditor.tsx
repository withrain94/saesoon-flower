import { inputClassName } from "@/components/ui/Field";
import { ChevronIcon } from "@/components/ui/icons";
import type { Product } from "@/data/products";
import {
  BLACKBOARD_CUSTOM,
  BLACKBOARD_MAX_LENGTH,
  blackboardPresetsByCategory,
  messageOptionsByCategory,
  type BlackboardPreset,
} from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import type { MessageType, UnitMessage } from "@/types/reservation";

/** 상품 종류에 맞는 메시지 방식 + 문구 입력 (값은 부모 상태) */
export default function MessageEditor({
  idPrefix,
  product,
  value,
  onChange,
}: {
  idPrefix: string;
  product: Product;
  value: UnitMessage;
  onChange: (patch: Partial<UnitMessage>) => void;
}) {
  const t = useT();
  const options = messageOptionsByCategory[product.category];
  const blackboardPresets = blackboardPresetsByCategory[product.category];

  return (
    <div>
      {options.length > 1 ? (
        <div className="relative">
          <select
            id={`${idPrefix}-message-type`}
            value={value.type}
            onChange={(event) => onChange({ type: event.target.value as MessageType })}
            aria-label={t.message.typeAria}
            className={`${inputClassName} appearance-none pr-10`}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {t.message.types[option]}
              </option>
            ))}
          </select>
          <ChevronIcon
            direction="down"
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sub"
          />
        </div>
      ) : (
        // 방식이 하나뿐이면 고르지 않고 안내만
        <p className="rounded-lg bg-soft px-4 py-2.5 text-[14px] font-semibold text-body">
          {t.message.types[options[0]]}
        </p>
      )}

      {value.type === "memo" && (
        <textarea
          rows={3}
          value={value.memo}
          onChange={(event) => onChange({ memo: event.target.value })}
          aria-label={t.message.memoAria}
          placeholder={t.message.memoPlaceholder}
          className={`${inputClassName} mt-2 h-auto resize-none py-3 leading-relaxed`}
        />
      )}

      {value.type === "ribbon" && (
        <div className="mt-2 grid gap-2">
          <input
            type="text"
            value={value.ribbonLeft}
            onChange={(event) => onChange({ ribbonLeft: event.target.value })}
            aria-label={t.message.ribbonLeftAria}
            placeholder={t.message.ribbonLeftPlaceholder}
            className={inputClassName}
          />
          <input
            type="text"
            value={value.ribbonRight}
            onChange={(event) => onChange({ ribbonRight: event.target.value })}
            aria-label={t.message.ribbonRightAria}
            placeholder={t.message.ribbonRightPlaceholder}
            className={inputClassName}
          />
        </div>
      )}

      {value.type === "blackboard" && blackboardPresets && (
        <BlackboardPresetPicker
          name={`${idPrefix}-blackboard-preset`}
          presets={blackboardPresets}
          selected={value.blackboardPreset}
          onSelect={(blackboardPreset) => onChange({ blackboardPreset })}
        />
      )}

      {value.type === "blackboard" && value.blackboardPreset === BLACKBOARD_CUSTOM && (
        <BlackboardTextarea
          value={value.blackboard}
          rows={blackboardPresets ? 4 : 2}
          onChange={(blackboard) => onChange({ blackboard })}
        />
      )}
    </div>
  );
}

/** 블랙보드 문구 선택지 + "직접 입력" */
function BlackboardPresetPicker({
  name,
  presets,
  selected,
  onSelect,
}: {
  /** 상품 1개마다 달라야 하는 라디오 그룹 이름 */
  name: string;
  presets: BlackboardPreset[];
  selected: string;
  onSelect: (presetId: string) => void;
}) {
  const t = useT();
  const choices: { id: string; label: string; text: string }[] = [
    ...presets.map((preset) => ({ id: preset.id, label: t.blackboardPresets[preset.id], text: preset.text })),
    { id: BLACKBOARD_CUSTOM, label: t.message.custom, text: "" },
  ];

  return (
    <div role="radiogroup" aria-label={t.message.presetsAria} className="mt-2 grid gap-2">
      {choices.map((choice) => {
        const checked = choice.id === selected;
        return (
          <label
            key={choice.id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-[14px] leading-snug transition ${
              checked ? "border-brand bg-brand-tint text-ink" : "border-field bg-white text-body hover:border-brand"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={choice.id}
              checked={checked}
              onChange={() => onSelect(choice.id)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
            />
            <span>
              <span className={checked ? "font-semibold" : ""}>{choice.label}</span>
              {/* 외국어 화면: 실제로 블랙보드에 적히는 한국어 문구도 함께 */}
              {t.message.writtenInKorean && choice.text && (
                <span lang="ko" className="mt-1 block text-[12.5px] text-sub">
                  {t.message.writtenInKorean} {choice.text}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** 블랙보드 직접 입력 (글자 수 제한 + 카운터) */
function BlackboardTextarea({
  value,
  rows,
  onChange,
}: {
  value: string;
  rows: number;
  onChange: (value: string) => void;
}) {
  const t = useT();

  return (
    <div className="mt-2">
      <textarea
        rows={rows}
        maxLength={BLACKBOARD_MAX_LENGTH}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={t.message.customAria}
        placeholder={t.message.customPlaceholder}
        className={`${inputClassName} h-auto resize-none py-3 leading-relaxed`}
      />
      <p className="mt-1 text-right text-xs text-sub">
        {value.length} / {BLACKBOARD_MAX_LENGTH}
      </p>
    </div>
  );
}
