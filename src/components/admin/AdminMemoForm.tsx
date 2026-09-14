"use client";

import { useActionState } from "react";
import ErrorText from "@/components/ui/ErrorText";
import { saveAdminMemo, type AdminFormState } from "@/server/actions/admin";

const initialState: AdminFormState = { error: null };

/** 매장만 보는 메모 (고객에게 보이지 않음) */
export default function AdminMemoForm({ id, memo }: { id: string; memo: string }) {
  const [state, action, pending] = useActionState(saveAdminMemo.bind(null, id), initialState);

  return (
    <form action={action}>
      <textarea
        name="adminMemo"
        defaultValue={memo}
        rows={4}
        maxLength={2000}
        placeholder="예: 9/15 입금 확인, 리본 문구 전화로 재확인함"
        aria-label="관리자 메모"
        className="w-full rounded-lg border border-field bg-white px-3 py-2.5 text-[14px] text-ink placeholder:text-faint focus:border-brand focus:outline-none"
      />
      <div className="mt-1.5 flex items-center justify-end gap-3">
        {!pending && !state.error && state.savedAt && (
          <span aria-live="polite" className="text-[12px] text-sub">
            저장됐어요 ✓
          </span>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-[13px] font-bold text-white transition hover:bg-brand-dark disabled:bg-disabled"
        >
          {pending ? "저장 중…" : "메모 저장"}
        </button>
      </div>
      {!pending && state.notice && (
        <p className="mt-1 text-right text-[12px] text-brand-dark">{state.notice}</p>
      )}
      {state.error && <ErrorText>{state.error}</ErrorText>}
    </form>
  );
}
