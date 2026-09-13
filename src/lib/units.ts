import type { Product } from "@/data/products";
import {
  BLACKBOARD_CUSTOM,
  blackboardPresetsByCategory,
  messageOptionsByCategory,
  type BlackboardPreset,
} from "@/data/reservationOptions";
import { getItemName, getOrderItems } from "@/lib/selection";
import type { Recipient, Selection, UnitDetail, UnitMessage } from "@/types/reservation";

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
  /** 최종 메시지 */
  message: UnitMessage;
  /** 앞 상품이 있어 "받는 분 같음"을 고를 수 있는지 */
  canCopyRecipient: boolean;
  /** 같은 종류의 앞 상품이 있어 "메시지 같음"을 고를 수 있는지 */
  canCopyMessage: boolean;
  recipientCopied: boolean;
  messageCopied: boolean;
};

export const emptyRecipient: Recipient = { name: "", phone: "" };

export function emptyMessage(product: Product): UnitMessage {
  return {
    type: messageOptionsByCategory[product.category][0].value,
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

/** "꽃다발 6만원 (1/2)" */
export function getUnitLabel(unit: OrderUnit) {
  const name = getItemName(unit.product);
  return unit.quantity > 1 ? `${name} (${unit.unitNo}/${unit.quantity})` : name;
}

/**
 * 앞에서부터 순서대로 "같음"을 풀어 최종 값을 만든다.
 * - 받는 분: 바로 앞 상품의 최종 받는 분
 * - 메시지: 같은 종류 중 가장 가까운 앞 상품의 최종 메시지
 */
export function resolveUnits(units: OrderUnit[], details: Record<string, UnitDetail>): ResolvedUnit[] {
  const resolved: ResolvedUnit[] = [];

  for (const unit of units) {
    const own = details[unit.key] ?? defaultUnitDetail(unit.product);
    const previous = resolved.at(-1);
    let previousSameCategory: ResolvedUnit | undefined;
    for (let i = resolved.length - 1; i >= 0; i--) {
      if (resolved[i].unit.product.category === unit.product.category) {
        previousSameCategory = resolved[i];
        break;
      }
    }

    const recipientCopied = previous !== undefined && own.sameRecipient;
    const messageCopied = previousSameCategory !== undefined && own.sameMessage;

    resolved.push({
      unit,
      own,
      recipient: recipientCopied && previous ? previous.recipient : own.recipient,
      message: messageCopied && previousSameCategory ? previousSameCategory.message : own.message,
      canCopyRecipient: previous !== undefined,
      canCopyMessage: previousSameCategory !== undefined,
      recipientCopied,
      messageCopied,
    });
  }

  return resolved;
}

/** "홍길동 · 010-1234-5678" / 비었으면 안내 문구 */
export function describeRecipient(recipient: Recipient) {
  const text = [recipient.name, recipient.phone].filter(Boolean).join(" · ");
  return text || "입력 안 함 (예약자가 픽업)";
}

/** "메모지 · 생일 축하해" */
export function describeMessage(message: UnitMessage) {
  switch (message.type) {
    case "none":
      return "없음";
    case "memo":
      return `메모지 · ${message.memo || "(문구 미입력)"}`;
    case "ribbon":
      return `리본 · ${message.ribbonLeft || "-"} / ${message.ribbonRight || "-"}`;
    case "blackboard": {
      const preset = getBlackboardPreset(message);
      return `블랙보드 · ${preset ? preset.label : getBlackboardText(message) || "(문구 미입력)"}`;
    }
  }
}
