"use client";

import { useState, useTransition } from "react";
import Checkbox from "@/components/ui/Checkbox";
import ErrorText from "@/components/ui/ErrorText";
import { formatAdminDateTime } from "@/lib/adminFormat";
import { setCashReceiptIssued } from "@/server/actions/admin";

/** 현금영수증 발급 완료 체크 — 매장 전용 (손님 화면에는 없음). 누르면 바로 저장 */
export default function CashReceiptIssuedCheckbox({ id, issuedAt }: { id: string; issuedAt: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (issued: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setCashReceiptIssued(id, issued);
      if (result.error) setError(result.error);
    });
  };

  return (
    <div>
      <Checkbox checked={issuedAt !== null} onChange={(checked) => !isPending && toggle(checked)}>
        {isPending ? "저장 중…" : issuedAt ? `발급 완료 · ${formatAdminDateTime(issuedAt)}` : "발급 완료"}
      </Checkbox>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
