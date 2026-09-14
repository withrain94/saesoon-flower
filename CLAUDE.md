@AGENTS.md
@README.md

# 새순 예약 페이지 — Claude 작업 지침

> 이 파일은 Claude Code가 이 폴더에서 열릴 때 가장 먼저 읽는다.
> **대화를 시작하면 먼저 아래 "진행 상황 → 남은 일·확인 대기"를 읽고, 이어서 할 일이 있으면 사용자에게 짧게 알린다.**
> 코드 구조·코드 규칙은 위에서 불러온 `README.md`가 기준이다. (여기엔 중복해서 적지 않는다)
> 이 파일 아래쪽 `<!-- BEGIN:nextjs-agent-rules -->` 블록은 `next dev`가 관리하므로 건드리지 않는다. (현재는 AGENTS.md에만 있음)

## 1. 사용자와 일하는 방식

- 사용자: 새순 전주혁신도시점(24시 무인꽃집) 운영자. 개발자가 아니므로 **한국어로, 쉬운 말로** 설명한다. 코드 용어는 풀어서 말한다.
- **요청한 것만 처리한다.** 더 좋아 보이는 기능은 먼저 제안만 하고, 사용자가 고르면 만든다.
- **DB(Supabase)·이메일 발송·결제 연동은 사용자가 직접 요청할 때만** 연결한다. → **Supabase + 관리자 페이지 + 개인정보 동의는 2026-09-14에 요청받아 진행 중** (아래 "진행 상황" 참고). 이메일 발송은 아직 요청 전.
- **"배포해줘"** = 검사(`npx tsc --noEmit`, `npm run lint`, `npm run build`) 통과 확인 → `git add` → 커밋 → `git push` (GitHub `main`에 올리면 Vercel이 1~2분 뒤 자동 배포) → 배포 주소에서 확인.
  - 커밋 작성자는 이 저장소에 `withrain94` / GitHub noreply 이메일로 설정돼 있다(실제 이메일 노출 방지). 바꾸지 않는다.
  - 저장소는 **공개(public)** 라서 비밀 키·고객 개인정보를 커밋하지 않는다.
- **비밀 키(Supabase 비밀 키 등)는 채팅에 붙여넣게 하지 않는다.** 사용자가 `.env.local`과 Vercel 환경변수에 직접 넣도록 안내한다.
- **카드번호·유효기간은 절대 신청서로 받지 않는다.** 카드 결제는 "매장이 연락 → 고객이 전화로 알려줌" 방식.
- 이 PC에서는 Git Bash의 PATH에 Node가 없다 → 명령 앞에 `export PATH="/c/Program Files/nodejs:$PATH"`.
- 뜻이 두 가지 이상으로 읽히면(예: "오후 5시에 마감", "8번 사진을 2번으로") **바꾸기 전에 짧게 확인**한다. 선택지 질문을 쓸 때는 예시(몇 시에 보면 어떻게 되는지)를 같이 보여준다.
- 사용자가 **"중지"** 라고 하면 즉시 멈추고, 이미 반영된 것과 안 된 것을 알려준다. 멈춘 작업은 사용자가 다시 말할 때까지 재개하지 않는다.
- **"로컬로 열어"** = `http://localhost:3000` 이 응답하는지 확인한 뒤 기본 브라우저로 연다 (PowerShell `Start-Process "http://localhost:3000"`).
  - 3000번은 이 프로젝트의 `npm run dev`. 서버가 꺼져 있으면 `npm run dev`로 켠다.
  - 다른 프로그램이 쓰는 포트·프로세스는 절대 끄지 않는다.
- 작업이 끝나면 **무엇이 바뀌었는지 + 고객 화면에서 어떻게 보이는지 + 확인이 필요한 점**을 표나 목록으로 짧게 정리한다. 브라우저에서 직접 눌러보지 못했으면 그렇다고 말한다.

## 2. 이 폴더에서 특히 조심할 것

- **git 저장소다 (2026-09-14 첫 커밋 `3a51e90`).** GitHub: https://github.com/withrain94/saesoon-flower (공개) · 배포: **https://saesoon-flower.vercel.app** (main에 push하면 자동 배포). 큰 작업 전에는 `git status`로 커밋 안 된 변경을 확인한다.
- **휴대폰(같은 와이파이)에서 개발 서버를 열 때**: `next.config.ts`의 `allowedDevOrigins`에 PC IP(현재 `192.168.45.245`)가 있어야 화면 스크립트가 동작한다. IP가 바뀌면 값을 바꾸고 dev 서버를 재시작한다. (없으면 달력·승진식 안내·버튼이 전부 안 보임)
- **다른 Claude 세션이 같은 프로젝트를 동시에 고치는 경우가 있다.** 고치기 전에 최근 10~15분 사이 바뀐 파일을 확인하고(`find src -newermt "-15 minutes"`), 파일 전체를 덮어쓰지 말고 필요한 부분만 고친다. 같은 파일을 누가 고치는 중이면 사용자에게 먼저 알린다.
- 검증은 `npx tsc --noEmit` + `npm run lint`. dev 서버가 켜져 있을 때는 `next build`를 돌리지 않는다.
- 로직 확인이 필요하면 `@/` 경로를 풀어주는 Node 임포트 훅으로 `lib` 함수를 직접 실행해 여러 시각·날짜 경우를 표로 검사한다.

## 3. 사진 다루기

- 사진은 `public/flowers/{종류}-{금액}-{번호}.jpg` (bouquet / basket / orchid). 목록은 `src/data/products.ts`의 `images`.
- 새 사진은 **긴 변 1200px JPG(quality 82)로 줄여서** 넣는다 (프로젝트에 설치된 `sharp` 사용). 원본 PNG·수 MB 사진을 그대로 넣지 않는다.
- 사진을 **교체할 때는 새 번호의 파일명**으로 저장한다 (같은 이름으로 덮으면 브라우저·이미지 캐시에 옛 사진이 남음). 안 쓰게 된 파일은 참조가 없는지 확인 후 삭제.
- "n번 사진" = 사진 넘겨보기 화면에 보이는 `n / 전체` 순번(1부터) = `images` 배열 순서.
- **꽃다발 사진은 사람이 들고 있는 사진을 우선**한다. 상품당 **최대 8장**. 들고 있는 사진이 모자란 금액(5·6·9·15·20·30만원)만 다른 사진을 섞었다(사용자 결정).
- 사용자가 **지우라고 한 사진은 다시 넣지 않는다**: 꽃다발 9만원 `bouquet-90000-06`, 꽃바구니 15만원 `basket-150000-06`. (꽃바구니 10만원 `basket-100000-02`는 15만원으로 옮김)
- 첫 화면 입구 카드 사진은 `products.ts`의 `thumbnail` (꽃다발 = 10만원 6번, 꽃바구니 = 15만원 2번).
- 사진 출처: 새순 소개 사이트(https://saesoon-jeonju.withrain94.chatgpt.site, 이미지 경로 예: `/orchid-case-11.jpg`), 사용자 카톡 받은 파일 폴더(`C:\Users\plant\Documents\카카오톡 받은 파일`).

## 4. 지금까지 정해진 운영 규칙 (바꾸려면 사용자 확인)

| 항목 | 규칙 | 코드 위치 |
|---|---|---|
| 톤 | 인디핑크(그린 쓰지 않음) | `globals.css` 토큰 |
| 당일 예약 | 받는 시간 2시간 전까지 | `SAME_DAY_LEAD_HOURS` |
| 예약 마감 | 오후 5시가 되면 **다음날 오전 9시까지(9시 포함)** 시간대는 고를 수 없음 → 다음날 10시부터 | `ORDER_CLOSE_HOUR` / `ORDER_OPEN_HOUR`, `lib/time.ts` |
| 호접난 | 2개 1세트 120,000원, 색감 선택 칸 없음(흰색), 메시지는 **블랙보드만**: 알아서 써주세요(기본) / 키워주셔서 감사합니다… / 호접난의 꽃말처럼… / 직접 입력(40자) | `products.ts`, `blackboardPresetsByCategory` |
| 인재개발원 승진식 | 제8기 2026-10-08, 제9기 2026-10-26. 그날은 **오전 8시·9시만** 선택, 꽃바구니 추천(전국에서 모여 멀리서 오신 분 많음), **무료 승진 토퍼** 안내, 달력 "승진식" 표시 + 첫 화면 배너. 새 기수는 한 줄 추가 | `data/events.ts` |
| 소개 사이트 연결 | 헤더 버튼 + 상품 탭별 "사진·설명 더 보기" + 사진 목록 끝 칸. 꽃다발 `#product-01`, 꽃바구니 `#product-02`, 호접난 `#meeting` | `siteUrl`, `siteLinksByCategory` |
| 결제 방법 | 신청서에서는 **계좌이체 / 카드 결제** 2개만. 카드 결제 = 매장 연락 후 전화로 카드번호 전달(신청서에 적지 말라고 안내) + "카드 결제하실 분 연락처: 1.예약자와 동일 / 2.다름(자유 입력)" | `paymentMethodOptions`, `PaymentMethodField` |
| 현금영수증 | 계좌이체일 때만: 신청 안 함 / 소득공제(휴대폰) / 지출증빙(사업자번호) | `cashReceiptOptions` |
| 네이버 예약 | **첫 화면에서 먼저 나눈다** (신청서 작성 후 네이버로 가면 이중 작성이 되므로). 결제 방법에는 넣지 않고 작은 "네이버 예약 바로가기" 안내만 | `NaverBookingBanner`, `NAVER_BOOKING_GUIDE` |
| 화분 | 개업·승진·축하 화분은 **네이버 예약으로만** (첫 화면 버튼) | `naverOnlyBookings` |
| 받는 분·메시지 | 상품 1개마다 카드, 2번째부터 "앞과 같음" 기본 체크, "모두 같음/모두 따로" 버튼. 메시지 "같음"은 같은 종류끼리만 | `lib/units.ts` |
| 견적서·거래명세표 | 체크 시 이메일·상호(필수)·사업자번호(선택) → 완료 화면에서 자동 작성·인쇄/PDF. 공급자: 상호 **"새순"**, 대표 김래인, 102-16-53653, 기지로 77 대방디엠시티 1층 D108~109호, 010-5954-3963, 도매 및 소매업/화초 및 식물 소매업. **과세사업자지만 품목이 면세 → 합계만 표시**. 직인은 나중에 받기. 이메일 자동 발송은 미구현 | `businessInfo`, `lib/documents.ts` |
| 개인정보 | 신청서에 **[필수] 개인정보 수집·이용 동의** + `/privacy` 처리방침 페이지 (진행 중) | `data/privacy.ts` |

## 5. 진행 상황 (2026-09-14 18:15 기준)

### 🚧 지금 진행 중: Supabase 저장 + 관리자 페이지 + 개인정보 동의 (사용자 요청)
사용자가 "고객 신청서를 어떻게 받나"에 대해 **Supabase + 관리자 페이지**를 골랐고, **개인정보 수집·이용 동의**도 같이 하기로 함.

설계 (확정):
- 고객 제출 → **서버 함수**가 다시 검사(`lib/reservationValidation.ts`: 금액은 상품 데이터로 재계산, 날짜·시간은 **한국 시각** `toNowInTimeZone`으로 재확인, 동의 필수) → Supabase `reservations` 테이블에 저장.
- DB 접근은 서버에서 **비밀 키**(`SUPABASE_SECRET_KEY`)로만. 테이블은 RLS 켜고 정책 없음(브라우저에서 직접 못 읽음).
- 관리자: Supabase Auth 이메일·비밀번호 로그인 + `ADMIN_EMAILS` 허용 목록. `getClaims()`로 검증. 모든 관리자 페이지·서버 함수 맨 앞에 `requireAdmin()`.
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `ADMIN_EMAILS`. 없으면 제출 시 "지금은 온라인 신청을 받을 수 없어요. 전화(010-5954-3963)나 네이버 예약을 이용해 주세요" 안내(가짜 완료 화면 금지).
- 테이블 컬럼: id(uuid), created_at, updated_at, status(기본 received), reservation_date, reservation_time, orderer_name, orderer_phone, payment_method, total_price, total_quantity, privacy_agreed_at, admin_memo, request(jsonb = ReservationRequest 전체).
- 상태: 접수 → 입금·결제 확인 → 제작 완료 → 전달 완료 / 취소 (`data/reservationStatus.ts`).

이미 만든 것 (커밋 안 됨):
- 패키지 설치: `@supabase/supabase-js`, `@supabase/ssr`, `server-only`
- `types/reservation.ts` (privacyAgreed, ReservationStatus, StoredReservation, 폼 필드 privacyConsent)
- `data/privacy.ts` (동의 문구 + 처리방침 본문), `data/reservationStatus.ts`
- `lib/time.ts` `toNowInTimeZone`, `lib/reservationRequest.ts` privacyAgreed, `lib/reservationValidation.ts`
- `src/server/`: `env.ts`, `supabase.ts`(DB 클라이언트·로그인 클라이언트), `auth.ts`(getAdminEmail/requireAdmin), `reservations.ts`(insert/list/get/update)

남은 순서:
1. `src/server/actions/reservation.ts` ("use server") — submitReservation: 검사 → 저장 → id 반환 / 오류 문구
2. 신청서: 동의 체크박스(`name="privacyConsent" value="agree" required`, 내용 펼쳐보기, `/privacy` 링크) + `useReservation.submit` 비동기(저장 중 버튼 비활성·오류 표시) + 완료 화면에 접수번호
3. `/privacy` 처리방침 페이지 (+ 푸터 링크)
4. 관리자: `src/server/actions/admin.ts`(로그인·로그아웃·상태·메모, 모두 requireAdmin) / `src/proxy.ts`(/admin 세션 갱신 — Next 16은 middleware가 proxy로 이름 바뀜) / `/admin/login` / `/admin` 목록(상태 필터) / `/admin/[id]` 상세(상품·받는 분·메시지·결제·서류 인쇄는 `DocumentsPanel` 재사용, 상태·메모 변경)
5. `supabase/schema.sql`, `.env.example`(+ `.gitignore`에 `!.env.example`), README에 `server/` 계층 추가
6. 검사: tsc·lint·build, 환경변수 없을 때 제출 안내 문구, `/admin` → 로그인 화면 이동
7. 사용자 안내(직접 할 일): Supabase 가입 → 프로젝트 생성(지역 **Seoul**) → SQL Editor에 schema.sql 실행 → Authentication에서 관리자 계정 만들고 **회원가입 막기** → 키를 `.env.local`·Vercel 환경변수에 직접 입력 → 재배포
8. 처리방침은 일반 양식이므로 사용자에게 내용 확인 권유(보관 기간 1년 등)

### 완료
- 꽃다발·꽃바구니·**호접난** 3종을 한 번에 담아 예약 (호접난 탭·안내 "꼭 확인해 주세요"·사진 9장)
- 호접난 블랙보드 문구 선택지, 오후 5시 예약 마감, 인재개발원 승진식 특별한 날, 소개 사이트 링크
- 결제 방법(계좌이체/카드 + 카드 결제자 연락처), 현금영수증, 견적서·거래명세표 자동 작성(공급자 정보 완성), 네이버 예약 첫 화면 분리, 화분 네이버 전용 버튼
- 상품 1개별 받는 분·메시지(앞과 같음/모두 같음·따로), 첫 화면 입구 카드, 사진 8장 통일
- git 저장소 + GitHub 공개 저장소 + **Vercel 배포 완료** (https://saesoon-flower.vercel.app) — 배포는 첫 커밋 기준, 신청서는 아직 저장 안 됨(미리보기용)
- 호접난 사진 현재 순서: 01, **11(쇼핑백 핑크·블루)**, 02, 08, 04, 05, 09, 10(흰 벽), 12(한옥 식당 전달)

### 남은 일·확인 대기 (사용자 답을 기다리는 중)
1. **다국어 기능 — 아직 시작 안 함.** 사용자가 "중지"한 뒤 재개 여부 확인 대기.
   - 정해진 내용: 🌐 언어 탭 / 한국어(기본)·English·日本語·中文(简体)·Tiếng Việt / **직접 쓴 번역 문구**(외부 자동번역 X) / 언어별 파일(예: `src/i18n/en.ts`), 빠진 번역은 타입 오류로 잡기 / 선택 언어 기억 / 주문 데이터는 한국어·옵션 코드 그대로 + 고객이 본 언어만 기록
   - **해외 결제는 PayPal 가능, 상품·배송 금액에 수수료 10% 추가** 안내를 모든 언어의 결제 영역에 표시 (외국어일 때 더 눈에 띄게)
2. **호접난 사진 2번 자리** — 사용자가 "8번을 2번으로"를 한 번 더 요청해 확인 질문 중. (지금 8번 = 흰 벽 사진 `orchid-120000-10`, 2번 = 쇼핑백 사진 `orchid-120000-11`)
3. 호접난 탭 개선 제안(미결정): 식당·배송 입력칸, 사진 먼저 크게, 안내 요약, "1세트(2개)" 표기, 보자기 색 선택, 메시지 예시, 후기·FAQ. 추천은 1·2·3번.
4. 승진식 확인 필요: 행사일엔 **모든 고객**이 8·9시만 선택됨 / 전날 오후 5시 마감 적용 / 승진 토퍼 문구(이름·직급) 입력칸 없음
5. 오후 5시 **전**에 예약하면 다음날 6~8시 선택 가능 — 매일 막을지 미정
6. 호접난 안내문 뒷부분이 스크린샷에서 잘림("흰색 호접난을 요청하시면 그에 맞는 최상의 품질의 난으로…") — 사용자에게 나머지 문구 받기
7. 예약 확인 방법 → **Supabase + 관리자 페이지로 결정, 위 "지금 진행 중" 참고.** 새 예약 알림(이메일/텔레그램)은 나중에 제안
8. `C:\Users\plant\Desktop\래인\flower-reservation` 은 예전 복사본(호접난 없음) — 유지할지 정리할지 미정
9. (완료) git init·GitHub·Vercel 배포

> 작업을 마치거나 결정이 나면 이 "진행 상황"을 갱신한다. 끝난 항목은 "완료"로 옮기고, 날짜·시각을 바꾼다.
