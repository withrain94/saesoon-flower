"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import StoreDraftCard from "@/components/admin/StoreDraftCard";
import { emptyStoreDraft, parseStoreBookings, type StoreDraft } from "@/lib/storeBooking";
import { toNowInTimeZone } from "@/lib/time";
import { importStoreReservation } from "@/server/actions/store";

const inputClass =
  "w-full rounded-lg border border-field bg-white px-3 py-2 text-[14px] text-ink placeholder:text-faint focus:border-brand focus:outline-none";

type Entry = { key: number; draft: StoreDraft; error?: string; existingId?: string; duplicate?: boolean };
type Saved = { id: string; name: string; date: string; time: string; paid: boolean; sms: boolean };

let nextKey = 1;

/** 카톡·문자·노션 줄 붙여넣기(또는 빈 칸에 직접) → 예약마다 칸 → 확인·고친 뒤 모두 저장 */
export default function StoreImportForm() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [pending, startTransition] = useTransition();

  const read = () => {
    const drafts = parseStoreBookings(text, toNowInTimeZone(new Date()).dateKey);
    setEntries(drafts.map((draft) => ({ key: nextKey++, draft })));
    setSaved([]);
  };
  const addBlank = () => setEntries((current) => [...current, { key: nextKey++, draft: emptyStoreDraft() }]);

  const change = (key: number, patch: Partial<StoreDraft>) =>
    setEntries((current) =>
      current.map((entry) => (entry.key === key ? { ...entry, draft: { ...entry.draft, ...patch } } : entry)),
    );
  const remove = (key: number) => setEntries((current) => current.filter((entry) => entry.key !== key));

  // 한 건씩 차례로 저장 — 저장된 건은 목록에서 빠지고, 안 된 건은 칸에 빨간 안내가 남음
  const saveAll = () => {
    startTransition(async () => {
      const left: Entry[] = [];
      const done: Saved[] = [];
      for (const entry of entries) {
        const result = await importStoreReservation(entry.draft);
        if (result.ok) {
          done.push({
            id: result.id,
            name: entry.draft.ordererName,
            date: entry.draft.date,
            time: entry.draft.time,
            paid: result.paid,
            sms: result.sms,
          });
        } else {
          left.push({ ...entry, error: result.error, existingId: result.existingId, duplicate: result.duplicate });
        }
      }
      setSaved((current) => [...current, ...done]);
      setEntries(left);
      if (left.length === 0) setText("");
    });
  };

  return (
    <div className="mt-3 space-y-3">
      {saved.length > 0 && (
        <div className="rounded-xl bg-white px-3 py-2.5 text-[13.5px] text-ink">
          <p className="font-semibold">{saved.length}건 저장했어요 ✓ (노션 표에도 올렸어요)</p>
          <ul className="mt-1 space-y-0.5 text-[13px]">
            {saved.map((item) => (
              <li key={item.id}>
                {item.date} {item.time} {item.name} · {item.paid ? "입금·결제 확인" : "접수"}
                {item.sms ? " · 확인 문자 10분 안에 발송" : ""} ·{" "}
                <Link href={`/admin/${item.id}`} className="font-semibold text-brand-dark underline">
                  예약 보기
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl bg-white p-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={entries.length > 0 ? 3 : 8}
          placeholder={
            "카톡·문자로 받은 주문 글이나 노션 표 줄을 그대로 붙여넣으세요.\n예) 주문자: 홍길동 010-1234-5678 / 꽃다발 6만원 + 쇼핑백 / 받는분: 김철수 010-… / 12/4 오전 8시 / 메시지: 축하드립니다 / 입금 완료"
          }
          aria-label="주문 글"
          className={inputClass}
        />
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={addBlank}
            disabled={pending}
            className="rounded-lg border border-field px-4 py-2 text-[13px] font-semibold text-brand-dark hover:border-brand"
          >
            빈 칸에 직접 쓰기
          </button>
          <button
            type="button"
            onClick={read}
            disabled={!text.trim() || pending}
            className="rounded-lg bg-brand px-4 py-2 text-[13px] font-bold text-white transition hover:bg-brand-dark disabled:bg-disabled"
          >
            칸 채우기
          </button>
        </div>
      </div>

      {entries.length > 0 && (
        <>
          <p className="px-1 text-[12.5px] text-sub">
            {entries.length}건 — 자동으로 채운 칸이에요. 틀리거나 빈 칸(빨간 테두리)은 고친 뒤 저장해 주세요.
          </p>
          {entries.map((entry, index) => (
            <StoreDraftCard
              key={entry.key}
              draft={entry.draft}
              index={index}
              total={entries.length}
              onChange={(patch) => change(entry.key, patch)}
              onRemove={() => remove(entry.key)}
              error={entry.error}
              existingId={entry.existingId}
              duplicate={entry.duplicate}
            />
          ))}
          <div className="sticky bottom-3 flex items-center justify-end gap-3 rounded-xl bg-white/95 p-3 shadow">
            <button
              type="button"
              onClick={() => setEntries([])}
              disabled={pending}
              className="text-[13px] font-semibold text-sub hover:text-ink"
            >
              취소
            </button>
            <button
              type="button"
              onClick={saveAll}
              disabled={pending}
              className="rounded-lg bg-brand px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-brand-dark disabled:bg-disabled"
            >
              {pending ? "저장 중…" : `${entries.length}건 저장`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
