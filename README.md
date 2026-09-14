# 새순꽃집 꽃다발·꽃바구니·호접난 예약 페이지

꽃다발·꽃바구니·상견례 호접난을 함께 담아 **한 번에 예약**하는 페이지.

Next.js (App Router) + Tailwind CSS. Vercel 배포 예정.

```bash
npm run dev    # http://localhost:3000
npm run build
npm run lint
```

## 폴더 구조

```
src/
├─ app/                      페이지 진입점 (page.tsx, layout.tsx, globals.css)
│  └─ admin/                 관리자 페이지 — login / 목록(page.tsx, ?status= 필터) / [id] 상세
├─ proxy.ts                  /admin 요청마다 로그인 세션 갱신 (Next 16: middleware → proxy)
├─ components/
│  ├─ admin/                 관리자 화면 — AdminHeader, LoginForm, StatusFilterTabs, ReservationListItem, ReservationDetail, StatusChanger, AdminMemoForm, AdminDocuments
│  ├─ layout/                StoreHeader, Hero — 매장 공통 화면
│  ├─ reservation/           예약 기능
│  │  ├─ ReservationPage.tsx   섹션 조립만 담당
│  │  ├─ useReservation.ts     상태·제출 로직 (Supabase 연결 지점: submit)
│  │  ├─ sections.ts           섹션 id, form id, 스크롤 함수
│  │  ├─ CategoryEntry / NaverBookingBanner   첫 화면 상품 종류 입구 카드 + 네이버 예약 바로가기 (신청서 쓰기 전에 나눔)
│  │  ├─ ProductSection / ProductOption / ProductPhotos / CategoryNotice   종류 탭 + 수량 + "꼭 확인해 주세요"
│  │  ├─ SpecialEventBanner / EventDayNotice   특별한 날(인재개발원 승진식 등) 첫 화면 안내 + 날짜 섹션 안내
│  │  ├─ DateTimeSection / Calendar / TimeSlotGroup
│  │  ├─ RecipientMessageField / UnitDetailCard / MessageEditor   상품 1개마다 받는 분·메시지 ("앞과 같음")
│  │  └─ ReserveSection / OrdererForm / PaymentMethodField / BankAccountCard / DocumentRequestField / DocumentsPanel / BusinessDocumentView / ColorField / OrderSummary / ReservationComplete / SubmitBar
│  └─ ui/                    Field, Checkbox, QuantityStepper, SectionHeading, ErrorText, icons … 재사용 부품
├─ server/                   서버 전용 (브라우저로 안 감) — env, supabase(DB·로그인 클라이언트), auth(requireAdmin), reservations(저장·목록·수정)
│  └─ actions/               "use server" 함수 — admin(로그인·로그아웃·상태·메모)
├─ hooks/                    useNow, useActiveSection, useElementWidth
├─ lib/                      순수 함수 (date, time, events, format, selection, units, payment, reservationRequest, reservationValidation, documents)
├─ i18n/                     화면 문구 — ko(기준)·en·ja·zh·vi. 모양이 ko와 다르면 타입 오류 / index.ts: 언어 목록·messages
├─ data/                     정적 데이터 (products, shop, reservationOptions, events) — 금액·사진·날짜·선택지 코드만, 문구는 i18n
└─ types/                    공용 타입 (ReservationRequest = 저장할 예약 한 건)
supabase/schema.sql          예약 표 만들기 (Supabase SQL Editor에서 한 번 실행)
.env.example                 환경변수 이름 (값은 .env.local · Vercel에 직접)
public/flowers/              상품 사진 ({종류}-{금액}-{번호}.jpg — bouquet, basket, orchid)
```

## 규칙 (코드가 꼬이지 않도록)

1. **의존 방향은 한쪽으로만**: `types → data → i18n → lib → server → hooks → components/ui → components/(layout|reservation|admin) → app`
   - `server/`는 서버에서만 실행. 관리자 페이지·관리자 서버 함수는 **맨 앞에서 `requireAdmin()`** 을 부른다. DB는 `server/reservations.ts`로만 접근한다.
   - 아래 계층이 위 계층을 import 하지 않는다. (예: `lib`에서 컴포넌트 import 금지)
   - 컴포넌트끼리 서로 import 하는 순환을 만들지 않는다.
2. **상태는 `useReservation` 한 곳에서만** 관리하고, 섹션 컴포넌트는 props로 받아 그리기만 한다.
3. **문자열 id는 `sections.ts` 상수**를 사용한다. (`"sizes"` 같은 값을 직접 쓰지 않기)
4. **색상은 `globals.css`의 토큰**(`text-ink`, `bg-brand` …)만 사용한다. hex 직접 쓰지 않기. 브랜드 색(인디핑크)을 바꿀 땐 `--color-brand*` 값만 수정.
5. 매장 정보(계좌·네이버 링크·소개 사이트 링크 `siteUrl`/`siteLinksByCategory`)는 `data/shop.ts`, 상품(꽃다발·꽃바구니·호접난)은 `data/products.ts`에서만 수정한다.
   **화면 문구는 컴포넌트에 직접 쓰지 않고** `useT()`(hooks/useLocale)로 언어 파일에서 꺼낸다. 문구를 바꾸면 5개 언어 파일을 함께 바꾼다. 서류·관리자 화면은 `ko`를 직접 쓴다.
   종류 이름을 화면 문구에 직접 나열하지 말고 `getCategoryNames(t)` / `productCategories`를 쓴다.
   새 상품 종류를 추가할 땐 아래 순서로 (타입 오류가 빠진 곳을 알려준다):
   `types`의 `ProductCategoryId` → `products.ts` (`colorChoice`, `featured`) → 각 언어 파일의 `categories`·`products` (안내는 `notice`) → `shop.ts`의 네이버 링크 → `reservationOptions.ts`의 `messageOptionsByCategory`.
   블랙보드 문구 선택지(예: 호접난 "알아서 써주세요" 등)는 `reservationOptions.ts`의 `blackboardPresetsByCategory`(실제 적힐 한국어)와 언어 파일 `blackboardPresets`(선택지 이름)에서 수정한다. ("직접 입력"은 자동으로 붙음)
   새 메시지 방식이 필요하면 `MessageType`·`UnitMessage` → `lib/units.ts`(빈 값·설명) → `lib/reservationRequest.ts` → `MessageEditor`.
6. 신청서 input의 `name`은 `ReservationFormField`와 같아야 하고, 입력값은 `lib/reservationRequest.ts`에서만 읽는다.
   받는 분·메시지는 상품 1개 단위 상태(`UnitDetail`)로 관리하고, "앞과 같음" 해석은 `lib/units.ts`의 `resolveUnits` 하나로만 한다.
7. DB 저장·이메일 발송은 `useReservation.ts`의 `submit` 안 TODO 한 곳에서만 연결한다.
8. 견적서·거래명세표 내용은 `lib/documents.ts`의 `buildBusinessDocument` 하나로만 만든다 (화면·인쇄·나중에 이메일 PDF 공용). 공급자 정보는 `data/shop.ts`의 `businessInfo`.
9. 특별한 날(인재개발원 승진식 등)은 `data/events.ts`의 `specialEvents`에 한 줄 추가한다. (예: `institutePromotion(10, "2026-11-20")`)
   달력 표시·그날 고를 수 있는 시간(`slots`)·첫 화면 배너·예약 마감 안내가 자동으로 따라온다. 예약 가능 여부는 `lib/time.ts`의 `isSlotBookable` 하나로만 판단한다.
