"use client";

import { useActionState } from "react";
import { inputClassName } from "@/components/ui/Field";
import ErrorText from "@/components/ui/ErrorText";
import { signIn, type AdminFormState } from "@/server/actions/admin";

const initialState: AdminFormState = { error: null };

export default function LoginForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="mt-6 space-y-3">
      <input
        name="email"
        type="email"
        autoComplete="username"
        required
        placeholder="관리자 이메일"
        aria-label="관리자 이메일"
        className={inputClassName}
      />
      <input
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="비밀번호"
        aria-label="비밀번호"
        className={inputClassName}
      />
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <button
        type="submit"
        disabled={disabled || pending}
        className="h-12 w-full rounded-lg bg-brand text-[15px] font-bold text-white transition hover:bg-brand-dark disabled:bg-disabled"
      >
        {pending ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
