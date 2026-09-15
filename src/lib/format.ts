/** 예약 id(uuid) → 접수번호 "A1B2C3D4" (고객 완료 화면·관리자 화면 공용) */
export function formatReceiptNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
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
