import type { Product } from "@/data/products";
import {
  BLACKBOARD_CUSTOM,
  blackboardPresetsByCategory,
  messageOptionsByCategory,
  type BlackboardPreset,
} from "@/data/reservationOptions";
import { ko, type Messages } from "@/i18n/ko";
import { hasFreeTopper } from "@/lib/events";
import { getItemName, getOrderItems } from "@/lib/selection";
import type { Recipient, Selection, Topper, UnitDetail, UnitMessage } from "@/types/reservation";

/** 담은 상품을 수량만큼 펼친 1개 단위 */
export type OrderUnit = {
  /** "bouquet-60000#2" — 수량을 줄였다 늘려도 같은 칸의 입력값이 유지됨 */
  key: string;
  product: Product;
  /** 같은 상품 안에서 몇 번째인지 (1부터) */
  unitNo: number;
  /** 같은 상품의 전체 수량 */
  quantity: number;
};

/** "같음"을 풀어서 실제로 쓰일 값까지 계산한 단위 */
export type ResolvedUnit = {
  unit: OrderUnit;
  /** 이 칸에 저장된 자기 입력값 */
  own: UnitDetail;
  /** 최종 받는 분 */
  recipient: Recipient;
  /** 최종 토퍼 (토퍼가 없는 날·상품이면 빈 값) */
  topper: Topper;
  /** 최종 메시지 */
  message: UnitMessage;
  /** 앞 상품이 있어 "받는 분 같음"을 고를 수 있는지 */
  canCopyRecipient: boolean;
  /** 같은 종류의 앞 상품이 있어 "메시지 같음"을 고를 수 있는지 */
  canCopyMessage: boolean;
  recipientCopied: boolean;
  messageCopied: boolean;
  /** 받는 날이 특별한 날이라 무료 토퍼 입력칸이 있는 상품인지 */
  topperAvailable: boolean;
  /** 토퍼를 앞 상품(토퍼가 있는 상품)에서 따라왔는지 — 받는 분 "같음"을 따름 */
  topperCopied: boolean;
};

export const emptyRecipient: Recipient = { name: "", phone: "" };
export const emptyTopper: Topper = { name: "", rank: "" };

export function emptyMessage(product: Product): UnitMessage {
  return {
    type: messageOptionsByCategory[product.category][0],
    memo: "",
    ribbonLeft: "",
    ribbonRight: "",
    blackboard: "",
    blackboardPreset: blackboardPresetsByCategory[product.category]?.[0].id ?? BLACKBOARD_CUSTOM,
  };
}

export function isEmptyRecipient(recipient: Recipient) {
  return !recipient.name.trim() && !recipient.phone.trim();
}

export function isEmptyTopper(topper: Topper) {
  return !topper.name.trim() && !topper.rank.trim();
}

/** 메시지를 아직 한 번도 고르거나 적지 않은 상태(= 상품 종류의 기본값 그대로)인지 */
export function isEmptyMessage(message: UnitMessage, product: Product) {
  const initial = emptyMessage(product);
  return (Object.keys(initial) as (keyof UnitMessage)[]).every((key) => message[key] === initial[key]);
}

/** 선택한 블랙보드 문구 선택지 (직접 입력이면 undefined) */
export function getBlackboardPreset(message: UnitMessage): BlackboardPreset | undefined {
  return Object.values(blackboardPresetsByCategory)
    .flat()
    .find((preset) => preset?.id === message.blackboardPreset);
}

/** 블랙보드에 실제로 쓸 문구 ("" = 매장에서 알아서 작성 또는 미입력) */
export function getBlackboardText(message: UnitMessage) {
  const preset = getBlackboardPreset(message);
  return preset ? preset.text : message.blackboard.trim();
}

/** 새 칸의 기본값 — 두 번째 상품부터는 "앞과 같음"이 체크된 상태 */
export function defaultUnitDetail(product: Product): UnitDetail {
  return {
    sameRecipient: true,
    recipient: emptyRecipient,
    topper: emptyTopper,
    sameMessage: true,
    message: emptyMessage(product),
  };
}

export function getOrderUnits(selection: Selection): OrderUnit[] {
  return getOrderItems(selection).flatMap(({ product, quantity }) =>
    Array.from({ length: quantity }, (_, i) => ({
      key: `${product.id}#${i + 1}`,
      product,
      unitNo: i + 1,
      quantity,
    })),
  );
}

/** "꽃다발 6만원 (1/2)" (언어별) */
export function getUnitLabel(unit: OrderUnit, t: Messages = ko) {
  const name = getItemName(unit.product, t);
  return unit.quantity > 1 ? t.format.unitName(name, unit.unitNo, unit.quantity) : name;
}

/**
 * 앞에서부터 순서대로 "같음"을 풀어 최종 값을 만든다.
 * - 받는 분: 바로 앞 상품의 최종 받는 분
 * - 토퍼: 받는 분 "같음"이면 토퍼가 있는 가장 가까운 앞 상품의 토퍼
 * - 메시지: 같은 종류 중 가장 가까운 앞 상품의 최종 메시지
 * dateKey: 받는 날짜 — 특별한 날이면 토퍼 입력칸이 생김
 */
export function resolveUnits(
  units: OrderUnit[],
  details: Record<string, UnitDetail>,
  dateKey: string | null,
): ResolvedUnit[] {
  const resolved: ResolvedUnit[] = [];

  for (const unit of units) {
    const own = details[unit.key] ?? defaultUnitDetail(unit.product);
    const previous = resolved.at(-1);
    const previousSameCategory = resolved.findLast(
      (candidate) => candidate.unit.product.category === unit.product.category,
    );
    const previousWithTopper = resolved.findLast((candidate) => candidate.topperAvailable);
    const topperAvailable = hasFreeTopper(dateKey, unit.product.category);

    const recipientCopied = previous !== undefined && own.sameRecipient;
    const messageCopied = previousSameCategory !== undefined && own.sameMessage;
    const topperCopied = topperAvailable && previousWithTopper !== undefined && own.sameRecipient;

    resolved.push({
      unit,
      own,
      recipient: recipientCopied && previous ? previous.recipient : own.recipient,
      topper: !topperAvailable
        ? emptyTopper
        : topperCopied && previousWithTopper
          ? previousWithTopper.topper
          : own.topper,
      message: messageCopied && previousSameCategory ? previousSameCategory.message : own.message,
      canCopyRecipient: previous !== undefined,
      canCopyMessage: previousSameCategory !== undefined,
      recipientCopied,
      messageCopied,
      topperAvailable,
      topperCopied,
    });
  }

  return resolved;
}

/** "홍길동 · 010-1234-5678" / 비었으면 안내 문구 */
export function describeRecipient(recipient: Recipient, t: Messages = ko) {
  const text = [recipient.name, recipient.phone].filter(Boolean).join(" · ");
  return text || t.recipient.describeEmpty;
}

/** "토퍼 · 홍길동 사무관" */
export function describeTopper(topper: Topper, t: Messages = ko) {
  return t.topper.describe(topper.name.trim(), topper.rank.trim());
}

/** "메모지 · 생일 축하해" (언어별) */
export function describeMessage(message: UnitMessage, t: Messages = ko) {
  switch (message.type) {
    case "none":
      return t.message.describeNone;
    case "memo":
      return t.message.describeMemo(message.memo);
    case "ribbon":
      return t.message.describeRibbon(message.ribbonLeft, message.ribbonRight);
    case "blackboard": {
      const preset = getBlackboardPreset(message);
      return t.message.describeBlackboard(preset ? t.blackboardPresets[preset.id] : getBlackboardText(message));
    }
  }
}
