-- 새순 예약 저장 표 — Supabase 대시보드 > SQL Editor에 붙여넣고 Run (한 번만)
-- 브라우저(공개 키)에서는 읽기·쓰기 모두 막고, 서버(비밀 키)에서만 접근한다.

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'received'
    check (status in ('received', 'confirmed', 'made', 'delivered', 'canceled')),
  reservation_date date not null,
  reservation_time text not null,
  orderer_name text not null,
  orderer_phone text not null,
  payment_method text not null,
  total_price integer not null check (total_price >= 0),
  total_quantity integer not null check (total_quantity > 0),
  privacy_agreed_at timestamptz not null,
  admin_memo text,
  -- 신청서 전체 (src/types/reservation.ts 의 ReservationRequest)
  request jsonb not null
);

create index if not exists reservations_date_idx on public.reservations (reservation_date, reservation_time);
create index if not exists reservations_status_idx on public.reservations (status);

-- RLS 켜고 정책은 만들지 않음 → 공개 키로는 아무것도 못 읽음 (비밀 키는 RLS를 통과)
alter table public.reservations enable row level security;
revoke all on table public.reservations from anon, authenticated;
-- 서버(비밀 키)는 읽기·쓰기 가능 — 새 표를 자동 공개하지 않는 프로젝트 설정이어도 동작하도록 명시
grant select, insert, update on table public.reservations to service_role;

-- 사이트 연결 쪽(Data API)이 새 표를 바로 알아보도록 새로고침
notify pgrst, 'reload schema';

-- ── 2026-09-15 추가: 손님 예약 조회·취소 요청 ──────────────────────────────
-- 이미 표를 만든 경우 아래만 SQL Editor에서 한 번 더 실행해도 됨 (여러 번 실행해도 안전)
-- 접수번호 = id 앞 8자리 대문자 (예: 5D7BBC7E) — 손님 조회용
alter table public.reservations
  add column if not exists receipt_number text generated always as (upper(left(id::text, 8))) stored;
create index if not exists reservations_receipt_idx on public.reservations (receipt_number);
-- 손님 취소 요청 (요청 시각·환불 계좌) — 없으면 null
alter table public.reservations add column if not exists cancel_request jsonb;

notify pgrst, 'reload schema';

-- ── 2026-09-16 추가: 예약 전 안내 문자 보냄 표시 ─────────────────────────────
-- 관리자 상세 "안내 문자 보냈어요" 버튼이 누른 시각을 저장 (안 보냈으면 null). 여러 번 실행해도 안전
alter table public.reservations add column if not exists reminder_sent_at timestamptz;

notify pgrst, 'reload schema';

-- ── 2026-10-09 추가: 현금영수증 발급 완료 표시 ───────────────────────────────
-- 관리자 "현금영수증" 화면의 발급 완료 체크 시각 (안 했으면 null). 손님 화면에는 안 보임. 여러 번 실행해도 안전
alter table public.reservations add column if not exists cash_receipt_issued_at timestamptz;

notify pgrst, 'reload schema';

-- ── 2026-10-13 추가: 관리자 "사진 관리" ─────────────────────────────────────
-- 관리자가 바꾼 사진 자리만 한 줄씩 저장 (slot = 자리 이름, images = 사진 주소 목록, cover = 대표 사진 순번).
-- 줄이 없는 자리는 사이트에 들어 있는 기본 사진이 보임. 여러 번 실행해도 안전
create table if not exists public.site_photos (
  slot text primary key,
  images jsonb not null default '[]'::jsonb,
  cover integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.site_photos enable row level security;
revoke all on table public.site_photos from anon, authenticated;
grant select, insert, update, delete on table public.site_photos to service_role;

-- 올린 사진 파일을 넣는 보관함 — 누구나 볼 수 있고(손님 화면에 보여야 하므로), 올리기·지우기는 서버(비밀 키)만
insert into storage.buckets (id, name, public) values ('site-photos', 'site-photos', true)
on conflict (id) do update set public = true;

notify pgrst, 'reload schema';

-- ── 2026-11-13 추가: 토스페이먼츠 온라인 결제 ─────────────────────────────────
-- 예약마다 토스 결제 기록(주문번호·결제 상태·전용 입금 계좌·현금영수증·영수증 주소)을 저장 (온라인 결제가 아니면 null).
-- 카드번호 등 카드 정보는 저장하지 않음(토스 결제창에만 입력). 토스 키를 넣기 전에 꼭 실행. 여러 번 실행해도 안전
alter table public.reservations add column if not exists payment jsonb;
-- ── 2026-11-18 추가: 자동 문자 보낸 기록 ─────────────────────────────────
-- 같은 예약·같은 종류·같은 번호로는 한 번만 보내려고 적어 둠 (server/autoSms.ts). 여러 번 실행해도 안전
create table if not exists public.auto_sms_log (
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  kind text not null,
  phone text not null,
  state text not null check (state in ('sending', 'sent', 'failed', 'nophoto')),
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (reservation_id, kind, phone)
);
alter table public.auto_sms_log enable row level security;
revoke all on table public.auto_sms_log from anon, authenticated;
grant select, insert, update, delete on table public.auto_sms_log to service_role;

-- 10분마다 자동 문자 실행 (pg_cron + pg_net — Supabase 무료 기능).
-- 아래 <CRON_SECRET> 자리에는 Vercel·.env.local의 CRON_SECRET 값을 넣음 (Claude가 값을 채운 파일을 따로 만들어 줌 — 이 파일에는 적지 않음)
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
-- select cron.schedule('saesoon-auto-sms', '*/10 * * * *', $$
--   select net.http_get(
--     url := 'https://saesoon-flower.vercel.app/cron/auto-sms',
--     headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>'),
--     timeout_milliseconds := 60000
--   );
-- $$);

notify pgrst, 'reload schema';
