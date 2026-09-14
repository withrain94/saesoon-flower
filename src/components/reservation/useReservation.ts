import { useState } from "react";
import { useLocale, useT } from "@/hooks/useLocale";
import { useNow } from "@/hooks/useNow";
import { buildReservationRequest } from "@/lib/reservationRequest";
import {
  emptySelection,
  getSelectionIssue,
  isScheduleBookable,
  summarizeSelection,
  withQuantity,
} from "@/lib/selection";
import { hasBookableSlot, toNowInTimeZone } from "@/lib/time";
import { submitReservation } from "@/server/actions/reservation";
import {
  defaultUnitDetail,
  getOrderUnits,
  isEmptyMessage,
  isEmptyRecipient,
  isEmptyTopper,
  resolveUnits,
  type ResolvedUnit,
} from "@/lib/units";
import type {
  Recipient,
  ReservationRequest,
  Selection,
  Topper,
  UnitDetail,
  UnitMessage,
} from "@/types/reservation";
import { issueSection, scrollToSection, SECTION } from "./sections";

/** 저장이 끝난 예약 — 접수 id + 서버에서 다시 검사·계산한 내용 */
export type SubmittedReservation = {
  id: string;
  request: ReservationRequest;
};

/** 상품 1개 칸에서 할 수 있는 동작 */
export type UnitActions = {
  setSameRecipient: (unit: ResolvedUnit, same: boolean) => void;
  setRecipient: (unit: ResolvedUnit, patch: Partial<Recipient>) => void;
  setTopper: (unit: ResolvedUnit, patch: Partial<Topper>) => void;
  setSameMessage: (unit: ResolvedUnit, same: boolean) => void;
  setMessage: (unit: ResolvedUnit, patch: Partial<UnitMessage>) => void;
  /** 모든 상품의 받는 분·메시지를 한 번에 "앞과 같음"(true) 또는 "따로 입력"(false)으로 */
  setAllSame: (same: boolean) => void;
};

/** 예약 페이지의 모든 상태와 동작을 한 곳에서 관리 */
export function useReservation() {
  const now = useNow();
  const locale = useLocale();
  const t = useT();
  const [selection, setSelection] = useState<Selection>(emptySelection);
  /** 상품 1개 단위(OrderUnit.key)별 받는 분·메시지 */
  const [unitDetails, setUnitDetails] = useState<Record<string, UnitDetail>>({});
  const [showErrors, setShowErrors] = useState(false);
  /** 저장 완료된 예약 한 건 (null = 아직 제출 전) */
  const [reservation, setReservation] = useState<SubmittedReservation | null>(null);
  /** 저장 중이면 true — 버튼을 막아 두 번 저장되지 않게 */
  const [submitting, setSubmitting] = useState(false);
  /** 저장 실패 안내 (고객 언어) */
  const [submitError, setSubmitError] = useState<string | null>(null);

  const units = resolveUnits(getOrderUnits(selection), unitDetails, selection.date);

  function setQuantity(productId: string, quantity: number) {
    setSelection((current) => ({
      ...current,
      quantities: withQuantity(current.quantities, productId, quantity),
    }));
  }

  function setSchedule(patch: Pick<Selection, "date" | "time">) {
    setSelection((current) => ({ ...current, ...patch }));
  }

  /** "같음"을 풀 때 쓸 값: 직접 적어둔 값이 있으면 그대로, 없으면 지금 보이던(앞 상품) 값 */
  function separateValues(target: ResolvedUnit, detail: UnitDetail): Pick<UnitDetail, "recipient" | "topper" | "message"> {
    return {
      recipient: isEmptyRecipient(detail.recipient) ? target.recipient : detail.recipient,
      topper: isEmptyTopper(detail.topper) ? target.topper : detail.topper,
      message: isEmptyMessage(detail.message, target.unit.product) ? target.message : detail.message,
    };
  }

  /** 최신 상태를 기준으로 한 칸의 입력값을 바꿈 (빠르게 입력해도 값이 섞이지 않게) */
  function updateUnit({ unit }: ResolvedUnit, change: (detail: UnitDetail) => Partial<UnitDetail>) {
    setUnitDetails((current) => {
      const detail = current[unit.key] ?? defaultUnitDetail(unit.product);
      return { ...current, [unit.key]: { ...detail, ...change(detail) } };
    });
  }

  const unitActions: UnitActions = {
    setSameRecipient: (target, same) =>
      updateUnit(target, (detail) => {
        if (same) return { sameRecipient: true };
        const { recipient, topper } = separateValues(target, detail);
        return { sameRecipient: false, recipient, topper };
      }),
    setRecipient: (target, patch) =>
      updateUnit(target, (detail) => ({ recipient: { ...detail.recipient, ...patch } })),
    setTopper: (target, patch) => updateUnit(target, (detail) => ({ topper: { ...detail.topper, ...patch } })),
    setSameMessage: (target, same) =>
      updateUnit(target, (detail) =>
        same
          ? { sameMessage: true }
          : { sameMessage: false, message: separateValues(target, detail).message },
      ),
    setMessage: (target, patch) =>
      updateUnit(target, (detail) => ({ message: { ...detail.message, ...patch } })),
    setAllSame: (same) =>
      setUnitDetails((current) => {
        const next = { ...current };
        for (const target of units) {
          const detail = next[target.unit.key] ?? defaultUnitDetail(target.unit.product);
          next[target.unit.key] = same
            ? { ...detail, sameRecipient: true, sameMessage: true }
            : { ...detail, sameRecipient: false, sameMessage: false, ...separateValues(target, detail) };
        }
        return next;
      }),
  };

  /** 신청서 기본 검증(필수 입력·형식) 통과 후 호출 → 서버에서 다시 검사하고 저장 */
  async function submit(formData: FormData) {
    if (submitting) return;
    setSubmitError(null);

    // 제출 순간의 시각으로 다시 확인 (페이지를 오래 열어둔 경우 대비)
    const submittedAt = new Date();
    const submitNow = toNowInTimeZone(submittedAt);
    const issue = getSelectionIssue(selection, submitNow);

    if (issue) {
      if (selection.date && !isScheduleBookable(selection, submitNow)) {
        const dateStillOpen = hasBookableSlot(selection.date, submitNow);
        setSchedule({ date: dateStillOpen ? selection.date : null, time: null });
      }
      setShowErrors(true);
      scrollToSection(issueSection[issue]);
      return;
    }

    const request = buildReservationRequest(selection, units, formData, submittedAt, locale);
    // TODO(이메일): request.documents가 있으면 서버에서 서류(lib/documents)를 PDF로 만들어 documentEmail로 발송
    setSubmitting(true);
    try {
      const result = await submitReservation(request);
      if (!result.ok) {
        setSubmitError(result.message);
        return;
      }
      setReservation({ id: result.id, request: result.request });
      scrollToSection(SECTION.reserve);
    } catch {
      // 인터넷 끊김 등 서버에 닿지 못한 경우
      setSubmitError(t.submit.failed);
    } finally {
      setSubmitting(false);
    }
  }

  const issue = getSelectionIssue(selection, now);

  return {
    now,
    selection,
    setQuantity,
    setSchedule,
    units,
    unitActions,
    /** 제출을 시도한 뒤에만 보여줄 미선택 항목 */
    visibleIssue: showErrors ? issue : null,
    summary: summarizeSelection(selection, t),
    reservation,
    submitting,
    submitError,
    submit,
  };
}
