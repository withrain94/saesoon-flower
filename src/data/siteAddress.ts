/**
 * 예약 사이트 주소 — 전용 도메인을 사면 BOOKING_SITE_URL 한 줄만 새 주소로 바꾼다.
 * (next.config.ts도 이 파일을 읽으므로 다른 파일을 import 하지 않는다)
 *
 * 바꾸면 자동으로 따라오는 것: 구글 검색 대표 주소·sitemap·robots, 손님 사진 문자 링크,
 * 그리고 예전 주소(VERCEL_SITE_URL)로 들어온 손님을 새 주소로 넘기기(next.config.ts redirects).
 * 넘기지 않는 길: /api(토스 입금 알림)·/cron(자동 실행) — 예전 주소로 등록돼 있어도 그대로 동작.
 */
export const VERCEL_SITE_URL: string = "https://saesoon-flower.vercel.app";
export const BOOKING_SITE_URL: string = VERCEL_SITE_URL;
