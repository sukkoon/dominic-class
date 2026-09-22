# Dominic Class

외국어 교육 수강 쇼핑몰. 영어 · 일본어 · 스페인어 · 중국어를 초급 / 중급 / 고급으로,
각 레벨마다 문법 · 회화 · 시험(OPIc) 클래스를 제공합니다.

- **타겟**: 20~40대 직장인 · 대학생
- **서체**: 나눔고딕 (현지어 표기만 언어별 서체)
- **스택**: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase · TossPayments v2

### 디자인 — 세 축으로 구분

**① 언어**는 색 계열과 **랜드마크 실사 사진**으로 구분합니다. 언어 페이지 히어로와 홈 언어
카드 배경에 해당 나라의 랜드마크 사진을 깔고, 글자가 있는 쪽에 계열색 스크림을 얹어
가독성을 확보합니다.

| 언어 | 계열색 | 두 번째 색 | 랜드마크 사진 |
|---|---|---|---|
| 🇺🇸 영어 | `#1D56B8` | `#EF3B4E` | 뉴욕 자유의 여신상 |
| 🇯🇵 일본어 | `#C9456C` | `#3A5EA8` | 도쿄타워 야경 |
| 🇪🇸 스페인어 | `#B5620A` | `#E03131` | 가우디 사그라다 파밀리아 |
| 🇨🇳 중국어 | `#C81E2B` | `#F0B429` | 만리장성 |

사진은 [Unsplash](https://unsplash.com/license)에서 가져왔습니다 — 상업적 사용 무료, 출처 표기
의무 없음. URL은 `dc_languages.hero_image_url`에 있고 `next/image`로 최적화해 내보냅니다.
스크림을 얹은 상태에서 랜드마크가 확실히 보이는 구도만 골랐습니다.

**② 레벨**은 같은 계열 안에서 명도 계단으로 구분합니다.

| 레벨 | 배경 | 글자 | 미터 |
|---|---|---|---|
| 초급 | 계열색 22% (옅음) | 짙은 계열색 | 1칸 |
| 중급 | 계열색 55% (중간) | 짙은 계열색 | 2칸 |
| 고급 | 계열색 100% (짙음) | 밝은 색 | 3칸 |

**③ 클래스 유형**은 언어 계열색 어느 것과도 겹치지 않는 세 색을 씁니다. 언어 페이지에서
같은 레벨 카드 세 장이 나란히 놓여도 서로 구분되고, 한 언어 색으로만 화면이 덮이지 않습니다.

| 유형 | 색 |
|---|---|
| 📐 문법 | 청록 `#0F766E` |
| 💬 회화 | 바이올렛 `#6D28D9` |
| 🎯 시험 | 슬레이트 `#334155` |

홈 히어로는 따뜻한 크림에서 연한 하늘빛으로 가는 밝은 바탕에 4개 언어 색 레일을 얹습니다.
수업 일정은 **주간 시간표 그리드**(칸 하나 = 1시간)로, 클래스 유형은 **번호 붙은 진행 순서**와
추천 대상으로 보여 줍니다.

---

## 서비스 구성

### 강의 36개 = 4개 언어(🇺🇸 🇯🇵 🇪🇸 🇨🇳) × 3개 레벨 × 3개 유형

### 강사 36명 — 클래스마다 전담

문법 · 회화 · 시험을 한 사람이 겸하지 않습니다. **언어 × 레벨 × 유형마다 전담 강사가 따로** 있어
강의 수와 같은 36명입니다.

| 레벨 | 강사 조건 | 예시 (영어) |
|---|---|---|
| 초급 | 한국인 선생님 | 김서연(문법) · 윤하늘(회화) · 장서우(시험) |
| 중급 | 한국어·현지어 모두 능통 | 박준호(문법) · 강예린(회화) · 조민혁(시험) |
| 고급 | 현지 원어민 전담 | 마이클 카터(문법) · 에밀리 브룩스(회화) · 다니엘 리브스(시험) — 모두 미국 |

고급 원어민의 국적은 언어별로 고정입니다 — 영어 🇺🇸 미국, 일본어 🇯🇵 일본, 중국어 🇨🇳 중국,
스페인어 🇪🇸 스페인 또는 🇲🇽 멕시코.

이 배정 규칙은 **DB CHECK 제약**으로, 강사–강의의 언어·레벨·유형 일치는
`dc_courses (instructor_id, language_code, level_code, class_type_code)` **복합 외래키**로 강제됩니다.
잘못된 조합은 아예 저장되지 않습니다.

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

### 강의마다 개요 — 목표 · 수료 후 성취 · 중점 내용

강의 상세 페이지 맨 위에 개요가 들어갑니다.

- **강의 목표** 한 줄 — 예: "OPIc IH 등급을 목표로 롤플레이와 돌발 질문을 유형별로 공략합니다."
- **수료 후 이렇게 됩니다** 3가지 — 예: "롤플레이 11~13번을 유형별로 대응한다"
- **중점적으로 다루는 내용** 4가지 — 12차시 커리큘럼에서 뽑은 대표 주제

목표와 성취는 (레벨 × 유형) 9조합 템플릿에서 언어명을 끼워 생성하고, 중점 내용은
`dc_lessons` 의 실제 차시 주제(2 · 5 · 8 · 11강)에서 뽑기 때문에 커리큘럼과 어긋나지 않습니다.

### 강사 이력 — 학력과 강의 경력

36명 전원에게 최종 학력과 강의 경력 3줄이 붙습니다.

- **학력**: 국내 강사는 국내 명문대 학사 + 해외 대학원 석·박사, 원어민 강사는 현지 명문대
  (예: 서울대 영어영문학 학사 · 컬럼비아대 TESOL 석사 / Harvard 비교문학 학사 · Boston University 수사학 석사 /
  도쿄대학 일본어학 학사 · 도쿄대학 일본어교육 박사 / 베이징대학 중국어언문학 학사 · 베이징대학 언어학 박사)
- **강의 경력**: 전 소속 기관 + 유형별 실적(문법 교재 집필 / 회화 코칭 200회+ / OPIc 집중반 20기+) +
  경력 연차와 누적 수강생

강사진 페이지와 강의 상세 페이지에 모두 표시됩니다.

### 시험 클래스는 전 언어 OPIc 기준

배경설문 설계 → 자기소개 템플릿 → 묘사·설명 → 롤플레이 공략 → 돌발 질문 → 등급별 전략(IM / IH / AL)
순서로 12차시를 구성했습니다.

### 추천 · 강의 평가 · 15초 샘플 강의

- **추천(좋아요)**: 강의 상세에서 하트를 누르면 `dc_course_likes`에 기록되고,
  `dc_courses.like_count`를 트리거가 갱신합니다. 한 사람이 한 강의에 한 번만 누를 수 있습니다.
- **강의 평가 게시판**: 별점(1~5) + 제목 + 후기. 강의당 한 사람이 하나만 쓰고 언제든 고치거나
  지울 수 있습니다. 평가는 세 곳에서 보입니다.
  - `/reviews` — 전체 평가 게시판 (언어 · 유형 필터, 전체 평균)
  - `/courses/[slug]#reviews` — 해당 강의 평가 + 별점 분포 + 작성 폼
  - `/instructors/[id]` — **담당 강사 페이지**에서 그 강사가 맡은 강의의 평가
- **15초 샘플 강의**: 강의마다 해당 언어 문장 3개를 브라우저 음성 합성(Web Speech API)으로
  읽어 줍니다. 자막과 한글 번역이 함께 표시되고, 재생 중인 문장이 강조됩니다.
  `dc_course_samples.media_url`에 실제 녹음·영상 파일을 넣으면 코드 수정 없이 그 파일을
  우선 재생합니다.

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
| `dc_instructors` | 36 | 언어×레벨×유형 전담 강사 (배정 규칙 CHECK) + `education_ko` · `career_ko` |
| `dc_courses` | 36 | 강의 + 개요 3종 (`goal_ko` · `outcomes` · `focus_ko`) |
| `dc_schedule_tracks` | 72 | 강의당 평일반 / 토요일 전일제 |
| `dc_lessons` | 432 | 12차시 커리큘럼 템플릿 |
| `dc_lesson_homework` | 864 | 차시별 숙제(필수 + 심화) |
| `dc_profiles` | — | 수강생 프로필 (가입 트리거로 생성) |
| `dc_cart_items` / `dc_orders` / `dc_order_items` / `dc_payments` | — | 장바구니 · 주문 · 결제 |
| `dc_enrollments` / `dc_enrollment_progress` / `dc_homework_completions` | — | 수강 · 진도 · 숙제 완료 |
| `dc_course_likes` | — | 강의 추천 (강의당 1인 1회) |
| `dc_course_reviews` | 108+ | 강의 평가 (별점 · 제목 · 후기) |
| `dc_course_samples` | 36 | 15초 샘플 강의 스크립트 |

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
