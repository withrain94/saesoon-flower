/** 60000 → "60,000원" */
export function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

const KOREAN_DIGITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const KOREAN_SMALL_UNITS = ["", "십", "백", "천"];
const KOREAN_BIG_UNITS = ["", "만", "억", "조"];

/** 220000 → "일금 이십이만원정" (서류용 한글 금액) */
export function formatKoreanAmount(amount: number) {
  if (amount <= 0) return "일금 영원정";

  const groups: string[] = [];
  let rest = Math.floor(amount);
  for (let big = 0; rest > 0; big++) {
    const group = rest % 10000;
    rest = Math.floor(rest / 10000);
    if (group === 0) continue;

    const digits = String(group).padStart(4, "0").split("").map(Number);
    const text = digits
      .map((digit, i) => (digit ? `${KOREAN_DIGITS[digit]}${KOREAN_SMALL_UNITS[3 - i]}` : ""))
      .join("");
    groups.unshift(`${text}${KOREAN_BIG_UNITS[big]}`);
  }

  return `일금 ${groups.join("")}원정`;
}

/** "2026-09-14T03:00:00.000Z" → "2026. 9. 14." (브라우저 로컬 날짜) */
export function formatDocumentDate(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}
