/**
 * 화면 스크립트보다 먼저 실행되는 파일 (Next.js instrumentation-client).
 *
 * 옛 휴대폰(아이폰 iOS 14~15.3, 오래된 안드로이드 브라우저)에는 없는 기능을 채워 넣는다.
 * 문법은 package.json의 browserslist 설정으로 빌드할 때 옛 문법으로 바뀌지만,
 * 아래처럼 "나중에 생긴 함수"는 바뀌지 않아서 직접 채워야 화면이 하얗게 뜨지 않는다.
 * (2026-10-26 — 일부 손님이 "사이트가 안 열린다"고 한 원인)
 */

type Indexable<T> = { length: number; [index: number]: T };

/** 뒤에서부터 찾기 (Array.prototype.findLast) — iOS 15.4 미만에 없음 */
function findLastPolyfill<T>(this: T[], predicate: (value: T, index: number, array: T[]) => unknown): T | undefined {
  for (let index = this.length - 1; index >= 0; index -= 1) {
    if (predicate(this[index], index, this)) return this[index];
  }
  return undefined;
}

/** 음수 번호로도 꺼내기 (Array/String.prototype.at) — iOS 15.4 미만에 없음 */
function atPolyfill<T>(this: Indexable<T>, index: number): T | undefined {
  const position = Math.trunc(index) || 0;
  const target = position < 0 ? this.length + position : position;
  return target < 0 || target >= this.length ? undefined : this[target];
}

function define(target: object, name: string, value: unknown) {
  if (name in target) return;
  Object.defineProperty(target, name, { value, writable: true, configurable: true });
}

define(Array.prototype, "findLast", findLastPolyfill);
define(Array.prototype, "at", atPolyfill);
define(String.prototype, "at", atPolyfill);
define(Object, "hasOwn", (target: object, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(target, key),
);
