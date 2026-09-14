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
| 호접난 | 2개 1세트 120,000원, 색감 선택 칸 없음(흰색), 메시지는 **블랙보드만**: 알아서 써주세요(기본) / 키워주셔서 감사합니다… / 호접난의 꽃말처럼… / 직접 입력(40자). 화면은 **사진 먼저 크게 → 꼭 확인해 주세요 요약 3줄 + 전체 안내 펼치기**. 받는 방법: 매장 픽업 / 상견례 식당 배송(호남각·궁·고궁담·기타 + 식당 예약 이름) | `products.ts`(`featured`), 언어 파일 `categories.orchid.notice`, `blackboardPresetsByCategory`, `OrchidDeliveryField` |
| 인재개발원 승진식 | 제8기 2026-10-08, 제9기 2026-10-30(금, 2026-09-15 10/26에서 변경). 그날은 **오전 8시·9시만** 선택, 꽃바구니 추천(전국에서 모여 멀리서 오신 분 많음), **무료 승진 토퍼**: 그날 꽃다발·꽃바구니마다 이름·직급 칸(선택), 달력 "승진식" 표시 + 첫 화면 배너. 새 기수는 한 줄 추가 | `data/events.ts`(`topperCategories`), 문구는 언어 파일 `events` |
| 소개 사이트 연결 | 헤더 버튼 + 상품 탭별 "사진·설명 더 보기" + 사진 목록 끝 칸. 꽃다발 `#product-01`, 꽃바구니 `#product-02`, 호접난 `#meeting` | `siteUrl`, `siteLinksByCategory` |
| 결제 방법 | 신청서에서는 **계좌이체 / 카드 결제 / PayPal** 3개. PayPal = 상품 금액 + 수수료 10% 자동 계산 + 결제 요청 받을 이메일(외국어 화면은 결제 칸 위에 크게 안내). 카드 결제 = 매장 연락 후 전화로 카드번호 전달(신청서에 적지 말라고 안내) + "카드 결제하실 분 연락처: 1.예약자와 동일 / 2.다름(자유 입력)" | `paymentMethodOptions`, `PAYPAL_FEE_RATE`, `PaymentMethodField` |
| 현금영수증 | 계좌이체일 때만: 신청 안 함 / 소득공제(휴대폰) / 지출증빙(사업자번호) | `cashReceiptOptions` |
| 네이버 예약 | **첫 화면에서 먼저 나눈다** (신청서 작성 후 네이버로 가면 이중 작성이 되므로). 결제 방법에는 넣지 않고 작은 "네이버 예약 바로가기" 안내만 | `NaverBookingBanner`, 언어 파일 `naverBanner` |
| 화분 | 개업·승진·축하 화분은 **네이버 예약으로만** (첫 화면 버튼) | `naverOnlyBookings` |
| 받는 분·메시지 | 상품 1개마다 카드, 2번째부터 "앞과 같음" 기본 체크, "모두 같음/모두 따로" 버튼. 메시지 "같음"은 같은 종류끼리만 | `lib/units.ts` |
| 견적서·거래명세표 | 체크 시 이메일·상호(필수)·사업자번호(선택) → 완료 화면에서 자동 작성·인쇄/PDF. 공급자: 상호 **"새순"**, 대표 김래인, 102-16-53653, 기지로 77 대방디엠시티 1층 D108~109호, 010-5954-3963, 도매 및 소매업/화초 및 식물 소매업. **과세사업자지만 품목이 면세 → 합계만 표시**. 직인 `public/documents/seal-01.png`(대표자 "(인)" 위, 2026-09-14 받음). 이메일 자동 발송은 미구현 | `businessInfo`, `lib/documents.ts` |
| 개인정보 | 신청서에 **[필수] 개인정보 수집·이용 동의** + `/privacy` 처리방침 페이지 (진행 중) | `data/privacy.ts` |
| 다국어 | 🌐 한국어(기본)·English·日本語·中文(简体)·Tiếng Việt. **직접 쓴 번역**(자동번역 X), 고른 언어는 브라우저에 기억. 주문 데이터는 코드/한국어 + 고객이 본 언어(`locale`). 서류·관리자 화면은 한국어. 해외 전화번호(+국가번호) 허용 | `src/i18n/*.ts`, `useT()` |

## 5. 진행 상황 (2026-09-15 기준)

> 2026-09-15: 코드 점검(계층 방향·순환 import 없음, 중복 문구·안 쓰는 코드 정리, **해외 접속 시 예약 가능 시간을 한국 시각으로 계산하도록 수정**) 후 커밋 `05eb3ba`(push 안 함).

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
1. ✅ (2026-09-15) `server/actions/reservation.ts` submitReservation: 설정 없으면 안내 → 검사 → 저장 → id·서버 계산 내용 반환 / 고객 언어로 오류 문구
2. ✅ (2026-09-15) 신청서 맨 아래 `PrivacyConsentField`(필수 체크·내용 보기·처리방침 링크, 5개 언어) + submit 비동기(저장 중 버튼 막기·하단 바에 오류) + 완료 화면 접수번호(`formatReceiptNumber`, 관리자와 같은 8자리)
3. ✅ (2026-09-15) `/privacy` 처리방침 페이지(한국어, 토퍼·호접난 식당·PayPal 이메일·화면 언어 항목 + PayPal 위탁 추가) + `SiteFooter` 링크
4. ✅ (2026-09-14 19:10, 커밋 안 됨) 관리자 페이지 코드 완성: `server/actions/admin.ts`(signIn·signOut·changeReservationStatus·saveAdminMemo, 모두 requireAdmin) / `src/proxy.ts` / `app/admin/login` / `app/admin`(진행 중·상태별·전체 필터 + 개수, 받는 날짜별 묶음, 오늘·내일 표시) / `app/admin/[id]`(예약자·상품·받는 분·메시지·토퍼·결제·PayPal·서류 인쇄 `AdminDocuments`·매장 메모·상태 버튼). 한국어 표시는 `lib/adminFormat.ts`가 `i18n/ko.ts` 문구 사용. **브라우저 확인 못 함** — 다국어 작업 중이라 dev 서버 전체가 컴파일 오류(500)였음. 다국어 작업이 끝나면 `/admin` → 로그인 화면 이동부터 확인
5. ✅ `supabase/schema.sql`, `.env.example`(+ `.gitignore`에 `!.env.example`), README에 `server/`·`admin` 계층 추가
6. ✅ (2026-09-15) tsc·lint 통과 / 브라우저: 동의 안 하면 제출 막힘, 동의 후 제출 → 비밀 키 없어서 "온라인 신청을 받을 수 없어요" 안내(가짜 완료 없음) / `/admin` → 307 로그인 화면 / `/privacy` 200. **build는 dev 서버가 켜져 있어 안 돌림**. 실제 저장·관리자 로그인은 키 넣은 뒤 확인 필요
   - 현재 `.env.local`: URL·공개 키는 있음, **SUPABASE_SECRET_KEY·ADMIN_EMAILS 비어 있음**
   - ✅ (2026-09-15) 사용자가 SQL Editor에서 schema.sql 실행 성공. 공개 키로 읽기 → 401 "permission denied for table reservations" (표 있음 + 외부 차단 확인). ✅ 관리자 계정 만듦(사용자) + 회원가입 막힘 확인(auth settings disable_signup=true, 이메일 로그인 켜짐). ✅ 사용자가 .env.local에 비밀 키·ADMIN_EMAILS 입력(형식 OK, 관리자 이메일 = Supabase 계정·확인됨) → dev 서버 재시작 → 브라우저 테스트 예약 저장 성공(접수번호 5D7BBC7E, 10/15 14:00 꽃바구니 10만원) → DB 확인 후 **취소 상태 + 메모 "Claude 저장 확인용 테스트 예약"** 으로 바꿔 둠. `/admin` → 로그인 화면 표시 확인. 관리자 로그인은 사용자가 직접 확인해야 함. ✅ Vercel 환경변수 4개 입력(사용자, Production — SUPABASE_SECRET_KEY는 Secret, 나머지 Config. NEXT_PUBLIC_ 값은 Secret 타입으로 저장 불가) → 배포(b03ea03, 공개 키 빠진 채) → 공개 키 추가 후 재배포 → 0dea170(Supabase 주소 뒤 `/rest/v1/` 등 자동 정리) 배포 성공: 실제 사이트 `/admin`→로그인 화면, 설정 없음 안내 안 뜸, 제9기 10/30 반영 확인. ✅ (2026-09-15) 사용자가 실제 사이트 관리자 로그인 성공. ✅ (2026-09-15 02:40) 실제 사이트 손님 신청 저장 성공(테스트 28514316 "테스트(Claude 배포 확인용)") → 취소 상태 + 메모로 바꿔 둠. DB엔 테스트 2건(모두 취소)뿐. **Supabase 연결 완료**.
7. 사용자 안내(직접 할 일): Supabase 가입 → 프로젝트 생성(지역 **Seoul**) → SQL Editor에 schema.sql 실행 → Authentication에서 관리자 계정 만들고 **회원가입 막기** → 키를 `.env.local`·Vercel 환경변수에 직접 입력 → 재배포
8. 처리방침은 일반 양식이므로 사용자에게 내용 확인 권유(보관 기간 1년 등)

### 완료
- 꽃다발·꽃바구니·**호접난** 3종을 한 번에 담아 예약 (호접난 탭·안내 "꼭 확인해 주세요"·사진 9장)
- 호접난 블랙보드 문구 선택지, 오후 5시 예약 마감, 인재개발원 승진식 특별한 날, 소개 사이트 링크
- 결제 방법(계좌이체/카드 + 카드 결제자 연락처), 현금영수증, 견적서·거래명세표 자동 작성(공급자 정보 완성), 네이버 예약 첫 화면 분리, 화분 네이버 전용 버튼
- 상품 1개별 받는 분·메시지(앞과 같음/모두 같음·따로), 첫 화면 입구 카드, 사진 8장 통일
- git 저장소 + GitHub 공개 저장소 + **Vercel 배포 완료** (https://saesoon-flower.vercel.app) — 배포는 첫 커밋 기준, 신청서는 아직 저장 안 됨(미리보기용)
- 호접난 사진 현재 순서: 01, **11(쇼핑백 핑크·블루)**, 02, 08, 04, 05, 09, 10(흰 벽), 12(한옥 식당 전달)
- (2026-09-14 19:40, 커밋 안 됨) **다국어**: 헤더 🌐 버튼(KO/EN/JA/中文/VI, 브라우저에 기억) · 화면 문구는 `src/i18n/{ko,en,ja,zh,vi}.ts`(ko가 기준, 빠지면 타입 오류) · 상품 제목·설명·종류 이름·특별한 날 문구도 언어 파일로 옮김(`products.ts`/`events.ts`엔 금액·사진·날짜만) · 주문엔 코드/한국어 + `locale` 저장 · 해외 전화번호(+국가번호) 허용 · 서류(견적서 등)는 한국어 그대로
- (같은 때) **PayPal**: 결제 방법 3개(계좌이체/카드/PayPal) · PayPal = 상품 금액 + 수수료 10%(`PAYPAL_FEE_RATE`) 자동 계산 + 결제 요청 받을 이메일 · 외국어 화면은 결제 칸 위에 "해외에서 결제하시나요?" 크게
- (같은 때) **호접난 탭**: 사진 먼저 크게(`featured`) → "꼭 확인해 주세요" 요약 3줄 + "전체 안내 보기"(사용자가 준 전체 문구, 줄바꿈 그대로) · 호접난 담으면 "받는 방법: 매장 픽업 / 상견례 식당 배송(호남각·궁·고궁담·기타 + 식당 예약 이름)" · 외국어 화면에서 블랙보드 선택지 아래 실제 적힐 한국어 문구 표시
- (같은 때) **승진 토퍼 칸**: 승진식 날 꽃다발·꽃바구니마다 이름·직급 칸(선택, 받는 분 "앞과 같음"이면 토퍼도 따라감). 8·9시만·전날 5시 마감은 그대로(사용자 결정)
- 브라우저 확인(19:40): 언어 전환·호접난 화면·식당 배송 칸·PayPal·토퍼 칸·8/9시만 선택 확인. 끝까지 제출은 안 눌러봄

### 남은 일·확인 대기 (사용자 답을 기다리는 중)
1. 오후 5시 **전**에 예약하면 다음날 6~8시 선택 가능 — **사용자 결정: 바꾸지 않음**
2. 예약 확인 방법 → **Supabase + 관리자 페이지로 결정, 위 "지금 진행 중" 참고.** 새 예약 알림(이메일/텔레그램)은 나중에 제안
3. `C:\Users\plant\Desktop\래인\flower-reservation` 예전 복사본 — **그대로 둠**(사용자가 판단 맡김, 지운 사진 원본 포함·되돌릴 수 없어서). 필요 없으면 사용자가 직접 삭제
4. 다국어 뒷정리(다른 세션의 직인 작업 끝난 뒤): `data/shop.ts`의 `shop.name/tagline`·`naverOnlyBookings` 제목과 `bankAccount.bank`는 이제 언어 파일이 씀 → shop.ts 쪽 중복 문구 정리 / 개인정보 동의 문구(`data/privacy.ts`)를 신청서에 붙일 때 5개 언어로 번역 필요
5. (완료) git init·GitHub·Vercel 배포 / 호접난 사진 "8번→2번"은 사용자가 무시하라고 함

> 작업을 마치거나 결정이 나면 이 "진행 상황"을 갱신한다. 끝난 항목은 "완료"로 옮기고, 날짜·시각을 바꾼다.
