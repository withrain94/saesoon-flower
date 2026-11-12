/**
 * 토스페이먼츠 은행 코드 (두 자리) — 가상계좌 은행 표시, 입금 후 환불 계좌 고르기에 씀.
 * 출처: docs.tosspayments.com/reference/codes (2026-11-13 확인). 카드사 코드와 다르니 섞지 않기
 */
export const tossBanks: { code: string; name: string }[] = [
  { code: "11", name: "NH농협은행" },
  { code: "06", name: "KB국민은행" },
  { code: "88", name: "신한은행" },
  { code: "20", name: "우리은행" },
  { code: "81", name: "하나은행" },
  { code: "03", name: "IBK기업은행" },
  { code: "37", name: "전북은행" },
  { code: "90", name: "카카오뱅크" },
  { code: "92", name: "토스뱅크" },
  { code: "89", name: "케이뱅크" },
  { code: "71", name: "우체국" },
  { code: "45", name: "새마을금고" },
  { code: "48", name: "신협" },
  { code: "07", name: "Sh수협은행" },
  { code: "23", name: "SC제일은행" },
  { code: "27", name: "씨티은행" },
  { code: "32", name: "부산은행" },
  { code: "31", name: "iM뱅크(대구)" },
  { code: "34", name: "광주은행" },
  { code: "39", name: "경남은행" },
  { code: "35", name: "제주은행" },
  { code: "02", name: "KDB산업은행" },
];

/** 코드 → 은행 이름 (모르는 코드면 코드 그대로) */
export function tossBankName(code: string) {
  return tossBanks.find((bank) => bank.code === code)?.name ?? code;
}

/**
 * 손님이 적은 은행 이름("농협", "국민은행", "KB") → 코드 추측 (못 찾으면 null).
 * 관리자 환불 칸을 미리 채우는 데만 쓰고, 매장이 확인 후 고른다
 */
export function guessTossBankCode(text: string) {
  const cleaned = text.replace(/\s/g, "").replace(/은행$/, "").toLowerCase();
  if (!cleaned) return null;
  const aliases: Record<string, string> = { kb: "06", 국민: "06", nh: "11", 농협: "11", 기업: "03", ibk: "03", 수협: "07", 대구: "31", im: "31", 우체국: "71", 새마을: "45", 산업: "02", sc: "23" };
  for (const [alias, code] of Object.entries(aliases)) if (cleaned.includes(alias)) return code;
  return tossBanks.find((bank) => bank.name.toLowerCase().replace(/은행$/, "").includes(cleaned))?.code ?? null;
}
