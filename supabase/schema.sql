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
