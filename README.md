# Dominic Class

외국어 교육 수강 쇼핑몰. 영어 · 일본어 · 스페인어 · 중국어를 초급 / 중급 / 고급으로,
각 레벨마다 문법 · 회화 · 시험(OPIc) 클래스를 제공합니다.

- **타겟**: 20~40대 직장인 · 대학생
- **디자인**: 언어별 페이지가 해당 국가의 분위기로 바뀝니다 (미국 브루클린 / 일본 세이가이하 / 스페인 아줄레주 / 중국 상운문)
- **스택**: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase · TossPayments v2

---

## 서비스 구성

### 강의 36개 = 4개 언어 × 3개 레벨 × 3개 유형

| 언어 | 국기 | 초급 강사 | 중급 강사 | 고급 강사 |
|---|---|---|---|---|
| 영어 | 🇺🇸 | 김서연 (한국) | 박준호 (한국, 한·영 이중언어) | 마이클 카터 / Michael Carter (미국 원어민) |
| 일본어 | 🇯🇵 | 이지훈 (한국) | 최유리 (한국, 한·일 이중언어) | 사토 미나미 / 佐藤 みなみ (일본 원어민) |
| 스페인어 | 🇪🇸 🇲🇽 | 정민아 (한국) | 한도윤 (한국, 한·서 이중언어) | 카를로스 라미레스 / Carlos Ramírez (멕시코 원어민) |
| 중국어 | 🇨🇳 | 오세진 (한국) | 배하늘 (한국, 한·중 이중언어) | 왕메이 / 王梅 (중국 원어민) |

강사 배정 규칙(초급=한국인, 중급=이중언어, 고급=현지 원어민)은 **DB CHECK 제약과 복합 외래키로 강제**되어
잘못된 데이터가 들어갈 수 없습니다.

### 수강료 (월 단위)

| 레벨 | 월 수강료 |
|---|---|
| 초급 | 90,000원 |
| 중급 | 120,000원 |
| 고급 | 150,000원 |

### 수업 일정 — 강의마다 두 트랙 중 선택

| 트랙 | 요일 | 하루 수업 | 월 등원 | 월 차시 | 월 수업시간 |
|---|---|---|---|---|---|
| 평일반 | 월 · 수 · 금 (주 3회) | 1시간 (19:00~20:00) | 12일 | 12차시 | 12시간 |
| 주말 전일제 | 토요일 | 3시간 연속 3교시 (10:00~13:00) | 4일 | 12차시 | 12시간 |

두 트랙 모두 **같은 12차시 커리큘럼**을 소화하므로 진도율을 그대로 비교할 수 있습니다.

### 시험 클래스는 전 언어 OPIc 기준

배경설문 설계 → 자기소개 템플릿 → 묘사·설명 → 롤플레이 공략 → 돌발 질문 → 등급별 전략(IM / IH / AL)
순서로 12차시를 구성했습니다.

### 진도 체크 · 숙제 관리

- 결제가 승인되면 선택한 트랙에 맞춰 **진도표 12행이 자동 생성**됩니다 (실제 수업 날짜·교시 포함, `Asia/Seoul` 기준)
- `/my/courses/[enrollmentId]` — 차시별 진도 체크, 완료율 자동 계산
- `/my/homework` — 전체 수강 강의의 숙제를 한 화면에서. 미완료 우선 정렬, 필수 / 심화 구분, 예상 소요시간, 담당 강사 표시

---

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

### 환경변수

| 이름 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용.** 결제 승인 시 주문 확정·수강 생성에 사용. `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다 |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스페이먼츠 클라이언트 키 (테스트: `test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm`) |
| `TOSS_SECRET_KEY` | 토스페이먼츠 시크릿 키 (테스트: `test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6`) |
| `NEXT_PUBLIC_SITE_URL` | 결제 `successUrl` / `failUrl` 생성용 절대 URL |

---

## 데이터베이스

모든 테이블·함수에 **`dc_` 접두사**를 씁니다. 하나의 Supabase 프로젝트를 다른 앱과 공유해도
이름이 충돌하지 않게 하기 위한 것이며, 가입 트리거도 `dc_handle_new_user` / `dc_on_auth_user_created`로
분리해 다른 앱의 트리거를 덮어쓰지 않습니다.

```
supabase/migrations/20260922000000_dominic_class_init.sql   스키마 · 함수 · RLS
supabase/seed.sql                                            시드 데이터
```

| 테이블 | 행 수 | 역할 |
|---|---|---|
| `dc_languages` / `dc_levels` / `dc_class_types` | 4 / 3 / 3 | 언어(국기·테마) / 레벨(가격) / 유형 |
| `dc_instructors` | 12 | 언어×레벨 전담 강사 (배정 규칙 CHECK) |
| `dc_courses` | 36 | 강의 |
| `dc_schedule_tracks` | 72 | 강의당 평일반 / 토요일 전일제 |
| `dc_lessons` | 432 | 12차시 커리큘럼 템플릿 |
| `dc_lesson_homework` | 864 | 차시별 숙제(필수 + 심화) |
| `dc_profiles` | — | 수강생 프로필 (가입 트리거로 생성) |
| `dc_cart_items` / `dc_orders` / `dc_order_items` / `dc_payments` | — | 장바구니 · 주문 · 결제 |
| `dc_enrollments` / `dc_enrollment_progress` / `dc_homework_completions` | — | 수강 · 진도 · 숙제 완료 |

### 주요 함수

- `dc_session_slots(track, month_start, start_time)` — 해당 월의 수업 슬롯 생성.
  평일반은 월·수·금 12일, 주말반은 토요일 4일 × 3교시(연속)로 **둘 다 12차시**가 되도록 계산합니다.
- `dc_fulfill_order(order_code)` — 결제 승인 후 수강 + 진도 12행 생성, 장바구니 비우기. 멱등.
  일반 사용자가 호출해 무료 수강을 만들 수 없도록 `anon` / `authenticated`의 실행 권한을 회수했습니다.

### RLS

- **카탈로그**(언어·레벨·유형·강사·강의·트랙·차시·숙제): 누구나 읽기, 쓰기 정책 없음
- **장바구니 · 프로필**: 본인 행 전체 CRUD
- **주문 · 결제 · 수강**: 본인 행 **조회만**. 생성/변경은 service_role 라우트 핸들러만 가능
  → 사용자가 결제 완료 주문을 위조할 수 없습니다
- **진도**: 본인 조회 + 수정 (학생이 직접 체크)
- **숙제 완료**: 본인 전체 CRUD

---

## 결제 (TossPayments v2)

`@tosspayments/tosspayments-sdk` 결제위젯을 사용하며, 금액 위변조를 3중으로 막습니다.

1. `POST /api/checkout/prepare` — 로그인 확인 후 **장바구니와 `dc_courses.price_krw`만으로 금액을 서버에서 확정**하고
   `dc_orders`(`status='pending'`) + `dc_order_items`를 생성합니다. 클라이언트가 보낸 금액은 읽지 않습니다.
2. 클라이언트는 `setAmount` → `renderPaymentMethods` / `renderAgreement` → `requestPayment(orderId)` 순으로 호출합니다.
3. `/checkout/success` 에서 **가드 3종**을 통과해야 승인합니다.
   - 주문 소유자 == 로그인 사용자
   - `dc_orders.amount_krw` == URL의 `amount`
   - 주문 상태가 `pending` (이미 `paid`면 새로고침으로 보고 완료 화면만 표시)

   통과하면 `POST https://api.tosspayments.com/v1/payments/confirm` 을 호출하는데,
   **금액은 URL 값이 아니라 DB의 `amount_krw`** 를 보냅니다.
   인증 헤더는 `Basic base64(시크릿키 + ":")` — 토스는 시크릿 키를 ID로 쓰고 비밀번호가 없으므로 **트레일링 콜론이 필수**입니다.
4. 승인 성공 후 `dc_payments` 기록 → `dc_orders.status='paid'` → `dc_fulfill_order()` 로 수강·진도 생성.

**멱등성**: `dc_payments.payment_key` unique + `dc_enrollments.order_item_id` unique +
`dc_fulfill_order`의 `on conflict do nothing` → 성공 페이지를 새로고침해도 중복 수강이 생기지 않습니다.

> 현재 테스트 키가 들어 있어 실제 금액이 청구되지 않습니다. 운영 전환 시
> [개발자센터](https://developers.tosspayments.com/my/api-keys)에서 발급한 라이브 키로 교체하세요.

---

## Vercel 배포

이 저장소는 Vercel에 연결하면 `main` 브랜치에 푸시할 때마다 자동 배포됩니다.

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → 이 저장소 선택
2. Framework Preset이 **Next.js**로 자동 인식되는지 확인 (Build Command / Output Directory 기본값 그대로)
3. **Environment Variables** 에 위 표의 6개 변수를 입력.
   `Production` · `Preview` · `Development` 세 환경 모두에 넣어야 프리뷰 배포에서도 동작합니다
4. **Deploy**
5. 배포 도메인이 나오면
   - `NEXT_PUBLIC_SITE_URL` 을 그 도메인으로 수정하고 재배포
   - Supabase 대시보드 → **Authentication → URL Configuration** 의 Redirect URLs에
     `https://<도메인>/auth/callback` 과 `https://*.vercel.app/auth/callback` 추가

`successUrl` / `failUrl` 은 런타임에 `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` → `localhost` 순으로 파생하므로
프리뷰 배포에서도 절대 URL이 깨지지 않습니다.

---

## 디렉터리

```
app/
  layout.tsx                              헤더 · 푸터 · 폰트
  globals.css                             전역 토큰 + 언어별 4개 테마([data-lang])
  page.tsx                                홈
  (catalog)/
    languages/[code]/                     언어별 이국적 랜딩 (테마 스위칭)
    courses/                              전체 강의 + 언어·레벨·유형 필터
    courses/[slug]/                       강의 상세 (커리큘럼 · 트랙 선택 · 담기)
    instructors/                          강사 12인
  (auth)/login · signup                   이메일 + 비밀번호
  auth/callback · auth/signout            이메일 확인 콜백 · 로그아웃
  cart/                                   장바구니 (일정 변경 · 삭제 · 합계)
  checkout/                               주문서 · 토스 위젯 · success · fail
  (dashboard)/my/                         내 강의실 · 진도 체크 · 숙제 · 주문내역
  api/checkout/prepare/                   주문 생성 (금액 서버 확정)
  actions/                                서버 액션 (auth · cart · progress · homework)
components/                               헤더 · 푸터 · 강의 카드 · 커리큘럼 · 강사 아바타
lib/
  supabase/client.ts                      브라우저 클라이언트
  supabase/server.ts                      쿠키 바인딩 서버 클라이언트 (RLS 적용)
  supabase/admin.ts                       service_role 클라이언트 (server-only)
  queries.ts                              카탈로그 조회
  toss.ts                                 결제 승인
  format.ts                               원화 · Asia/Seoul 날짜 포맷
middleware.ts                             Supabase 세션 쿠키 갱신
```

---

## 참고

- [토스페이먼츠 결제위젯 연동](https://docs.tosspayments.com/guides/v2/get-started)
- [Supabase Auth with Next.js Server-Side](https://supabase.com/docs/guides/auth/server-side/nextjs)
