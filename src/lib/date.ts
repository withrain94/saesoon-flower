import { ko, type Messages } from "@/i18n/ko";

/** Date → "YYYY-MM-DD" (브라우저 로컬 시간 기준) */
export function toDateKey(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/** "YYYY-MM-DD" → Date (로컬 자정) */
export function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "2026-09-30" + 1 → "2026-10-01" */
export function addDaysToKey(key: string, days: number) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** "2026-09-16" → "9. 16(수)" (언어별) */
export function formatDateLabel(key: string, t: Messages = ko) {
  const date = parseDateKey(key);
  return t.format.dateShort(date.getMonth() + 1, date.getDate(), date.getDay());
}

/** "2026-10-08" → "10월 8일(목)" (언어별) */
export function formatDateLong(key: string, t: Messages = ko) {
  const date = parseDateKey(key);
  return t.format.dateLong(date.getMonth() + 1, date.getDate(), date.getDay());
}

/** 두 날짜의 달 차이 — "2026-09-14" → "2026-10-08" = 1 */
export function monthsBetween(fromKey: string, toKey: string) {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

export type MonthGrid = {
  year: number;
  /** 0 = 1월 */
  month: number;
  /** 일요일부터 시작하는 7의 배수 칸. 해당 월이 아닌 칸은 null */
  cells: (Date | null)[];
};

/** baseKey가 속한 달에서 monthOffset만큼 이동한 달력 */
export function getMonthGrid(baseKey: string, monthOffset: number): MonthGrid {
  const base = parseDateKey(baseKey);
  const first = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const year = first.getFullYear();
  const month = first.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = first.getDay();
  const total = Math.ceil((leading + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: total }, (_, i) => {
    const day = i - leading + 1;
    return day >= 1 && day <= daysInMonth ? new Date(year, month, day) : null;
  });

  return { year, month, cells };
}
