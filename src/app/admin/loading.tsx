/**
 * 관리자 화면을 여는 동안 바로 보이는 안내 (2026-11-27 사용자 요청 — 페이지 넘길 때 멈춘 것처럼 느려 보여서).
 * 눌렀을 때 화면이 곧바로 바뀌고, 내용이 준비되면 진짜 화면으로 바뀜
 */
export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-4" aria-busy="true">
      <p className="mb-3 px-1 text-[14px] font-semibold text-sub">불러오는 중…</p>
      <div className="space-y-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-16 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    </main>
  );
}
