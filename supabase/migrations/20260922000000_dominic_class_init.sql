-- ============================================================================
-- Dominic Class — 외국어 강의 쇼핑몰 전체 스키마
--
-- 이 프로젝트는 다른 앱(고구마마켓, 가계부)과 Supabase 프로젝트를 공유하므로
-- 모든 객체에 dc_ 접두사를 붙여 충돌을 피한다.
-- 기존 public.profiles / listings / transactions 등은 절대 건드리지 않는다.
--
-- 적용된 마이그레이션(Supabase 기록):
--   dc_init_catalog / dc_init_commerce_learning / dc_functions_and_rls
--   dc_seed_catalog_v2 / dc_seed_lessons
-- 이 파일은 위 5건을 하나로 합친 재현용 스크립트다.
-- ============================================================================

-- ─────────────────────────── 1. ENUM ───────────────────────────
create type public.dc_user_role         as enum ('student','instructor','admin');
create type public.dc_track_type        as enum ('MWF','SAT');
create type public.dc_order_status      as enum ('pending','paid','failed','canceled','refunded');
create type public.dc_payment_status    as enum ('ready','in_progress','done','canceled','aborted','expired');
create type public.dc_enrollment_status as enum ('active','completed','canceled');
create type public.dc_progress_status   as enum ('scheduled','completed','absent','postponed');

-- ─────────────────────────── 2. 카탈로그 ───────────────────────────

-- 언어 (국기 + 언어별 이국적 테마 토큰)
create table public.dc_languages (
  code            text primary key check (code in ('en','ja','es','zh')),
  name_ko         text not null,
  name_native     text not null,
  flag_emoji      text not null,
  flag_emoji_alt  text,
  country_code    text not null,
  country_name_ko text not null,
  theme_key       text not null,
  theme_mood_ko   text not null,
  hero_color      text not null,
  accent_color    text not null,
  ink_color       text not null,
  pattern_key     text not null,
  font_key        text not null,
  tagline_ko      text not null default '',
  sort_order      smallint not null default 0
);
comment on table public.dc_languages is 'Dominic Class 언어 마스터';

-- 레벨 (가격의 단일 진실 원천)
create table public.dc_levels (
  code               text primary key check (code in ('beginner','intermediate','advanced')),
  name_ko            text not null,
  price_krw          integer not null check (price_krw > 0),
  instructor_rule_ko text not null,
  summary_ko         text not null default '',
  badge_emoji        text not null default '📘',
  sort_order         smallint not null default 0
);
comment on table public.dc_levels is 'Dominic Class 수강 레벨 및 월 수강료';

-- 강의 유형 (문법 / 회화 / 시험=OPIc)
create table public.dc_class_types (
  code        text primary key check (code in ('grammar','conversation','exam')),
  name_ko     text not null,
  tagline_ko  text not null,
  summary_ko  text not null default '',
  icon_emoji  text not null default '📖',
  sort_order  smallint not null default 0
);
comment on table public.dc_class_types is 'Dominic Class 강의 유형 (시험은 OPIc 기준)';

-- 강사 36명 (언어 x 레벨 x 유형 1명). 한 사람이 문법·회화·시험을 겸하지 않는다.
-- 배정 규칙을 DB 제약으로 강제한다.
create table public.dc_instructors (
  id               uuid primary key default gen_random_uuid(),
  language_code    text not null references public.dc_languages(code),
  level_code       text not null references public.dc_levels(code),
  class_type_code  text not null references public.dc_class_types(code),
  name_ko          text not null,
  name_native      text,
  nationality      text not null check (nationality in ('KR','US','JP','ES','MX','CN')),
  nationality_ko   text not null,
  is_native        boolean not null,
  speaks_korean    boolean not null,
  avatar_url       text,
  avatar_emoji     text not null default '🧑‍🏫',
  headline_ko      text not null default '',
  bio_ko           text not null default '',
  years_experience smallint not null default 3,
  created_at       timestamptz not null default now(),
  unique (language_code, level_code, class_type_code),
  unique (id, language_code, level_code, class_type_code),
  -- 초급=한국인 / 중급=한국어·현지어 이중언어 / 고급=현지 원어민(영어 미국, 일본어 일본, 중국어 중국, 스페인어 스페인 또는 멕시코)
  constraint dc_instructors_rule_chk check (
       (level_code = 'beginner'     and nationality = 'KR' and speaks_korean and not is_native)
    or (level_code = 'intermediate' and nationality = 'KR' and speaks_korean and not is_native)
    or (level_code = 'advanced'     and is_native and (
            (language_code = 'en' and nationality = 'US')
         or (language_code = 'ja' and nationality = 'JP')
         or (language_code = 'zh' and nationality = 'CN')
         or (language_code = 'es' and nationality in ('ES','MX'))
       ))
  )
);
comment on table public.dc_instructors is '초급=한국인, 중급=한국어/외국어 이중언어, 고급=현지 원어민';

-- 강의 36개 = 4언어 x 3레벨 x 3유형
create table public.dc_courses (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  language_code   text not null references public.dc_languages(code),
  level_code      text not null references public.dc_levels(code),
  class_type_code text not null references public.dc_class_types(code),
  instructor_id   uuid not null,
  title_ko        text not null,
  subtitle_ko     text not null default '',
  description_ko  text not null default '',
  price_krw       integer not null check (price_krw > 0),
  total_lessons   smallint not null default 12 check (total_lessons = 12),
  highlights      text[] not null default '{}',
  is_active       boolean not null default true,
  sort_order      smallint not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (language_code, level_code, class_type_code),
  -- 배정된 강사가 반드시 해당 강의의 언어/레벨/유형과 일치하도록 복합 FK로 강제
  foreign key (instructor_id, language_code, level_code, class_type_code)
    references public.dc_instructors (id, language_code, level_code, class_type_code)
);

-- 수업 트랙 2종 (월수금 1시간 x 12일 / 토요일 전일제 3시간 x 4일) = 72행
create table public.dc_schedule_tracks (
  id                uuid primary key default gen_random_uuid(),
  course_id         uuid not null references public.dc_courses(id) on delete cascade,
  track_type        public.dc_track_type not null,
  label_ko          text not null,
  days_label_ko     text not null,
  time_label_ko     text not null,
  days_of_week      smallint[] not null,
  start_time        time not null,
  end_time          time not null,
  hours_per_day     numeric(3,1) not null,
  periods_per_day   smallint not null,
  days_per_month    smallint not null,
  lessons_per_month smallint generated always as (days_per_month * periods_per_day) stored,
  capacity          smallint not null default 12,
  is_active         boolean not null default true,
  unique (course_id, track_type),
  constraint dc_track_shape_chk check (
       (track_type = 'MWF' and days_of_week = '{1,3,5}'::smallint[] and periods_per_day = 1
          and days_per_month = 12 and hours_per_day = 1.0)
    or (track_type = 'SAT' and days_of_week = '{6}'::smallint[]     and periods_per_day = 3
          and days_per_month = 4  and hours_per_day = 3.0)
  )
);
comment on table public.dc_schedule_tracks is '두 트랙 모두 월 12차시(12시간)로 동일한 커리큘럼을 소화';

-- 차시 커리큘럼 템플릿 432행 = 36강의 x 12차시
create table public.dc_lessons (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.dc_courses(id) on delete cascade,
  lesson_no    smallint not null check (lesson_no between 1 and 12),
  title_ko     text not null,
  objective_ko text not null default '',
  content_ko   text not null default '',
  keywords     text[] not null default '{}',
  unique (course_id, lesson_no)
);

-- 차시별 숙제 템플릿 (강사가 내주는 숙제) 864행
create table public.dc_lesson_homework (
  id             uuid primary key default gen_random_uuid(),
  lesson_id      uuid not null references public.dc_lessons(id) on delete cascade,
  seq            smallint not null check (seq between 1 and 5),
  title_ko       text not null,
  description_ko text not null default '',
  est_minutes    smallint not null default 20,
  is_required    boolean not null default true,
  unique (lesson_id, seq)
);

create index dc_instructors_facet_idx on public.dc_instructors (language_code, level_code, class_type_code);
create index dc_courses_facet_idx   on public.dc_courses (language_code, level_code, class_type_code);
create index dc_courses_lang_idx    on public.dc_courses (language_code, sort_order);
create index dc_tracks_course_idx   on public.dc_schedule_tracks (course_id);
create index dc_lessons_course_idx  on public.dc_lessons (course_id, lesson_no);
create index dc_homework_lesson_idx on public.dc_lesson_homework (lesson_id, seq);

-- ─────────────────────────── 3. 회원 ───────────────────────────

create table public.dc_profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null default '',
  full_name        text,
  phone            text,
  role             public.dc_user_role not null default 'student',
  avatar_url       text,
  marketing_opt_in boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table public.dc_profiles is 'Dominic Class 수강생 프로필 (기존 public.profiles와 별개)';

-- 가입 시 dc_profiles 생성.
-- 기존 앱(고구마마켓)의 handle_new_user 트리거와 이름이 겹치지 않도록 분리하고,
-- 어떤 실패도 회원가입 자체를 막지 않도록 예외를 삼킨다.
create or replace function public.dc_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.dc_profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
exception when others then
  return new;
end;
$$;

create trigger dc_on_auth_user_created
  after insert on auth.users
  for each row execute function public.dc_handle_new_user();

-- ─────────────────────────── 4. 커머스 ───────────────────────────

-- 장바구니 (헤더 테이블 없음, 수량은 항상 1)
create table public.dc_cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_id   uuid not null references public.dc_courses(id) on delete cascade,
  track_id    uuid not null references public.dc_schedule_tracks(id) on delete cascade,
  start_month date not null check (extract(day from start_month) = 1),
  created_at  timestamptz not null default now(),
  unique (user_id, course_id, start_month)
);

create table public.dc_orders (
  id           uuid primary key default gen_random_uuid(),
  order_code   text not null unique check (char_length(order_code) between 6 and 64),
  user_id      uuid not null references auth.users(id) on delete cascade,
  status       public.dc_order_status not null default 'pending',
  amount_krw   integer not null check (amount_krw > 0),
  order_name   text not null,
  buyer_name   text not null default '',
  buyer_email  text not null default '',
  buyer_phone  text not null default '',
  created_at   timestamptz not null default now(),
  paid_at      timestamptz,
  failed_at    timestamptz,
  fail_code    text,
  fail_message text
);
comment on column public.dc_orders.amount_krw is '서버가 DB 단가로 확정한 결제 금액. 결제 승인 시 위변조 판단 기준';

create table public.dc_order_items (
  id                       uuid primary key default gen_random_uuid(),
  order_id                 uuid not null references public.dc_orders(id) on delete cascade,
  course_id                uuid not null references public.dc_courses(id),
  track_id                 uuid not null references public.dc_schedule_tracks(id),
  course_title_snapshot    text not null,
  track_label_snapshot     text not null,
  instructor_name_snapshot text not null default '',
  language_code            text not null,
  level_code               text not null,
  unit_price_krw           integer not null check (unit_price_krw > 0),
  quantity                 smallint not null default 1 check (quantity = 1),
  line_amount_krw          integer generated always as (unit_price_krw * quantity) stored,
  start_month              date not null
);

create table public.dc_payments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null unique references public.dc_orders(id) on delete cascade,
  provider     text not null default 'toss',
  payment_key  text not null unique,
  method       text not null default '',
  status       public.dc_payment_status not null default 'done',
  amount_krw   integer not null,
  approved_at  timestamptz,
  receipt_url  text,
  raw_response jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
comment on column public.dc_payments.payment_key is '토스페이먼츠 paymentKey. 중복 승인 방지용 멱등 키';

-- ─────────────────────────── 5. 수강 · 진도 · 숙제 ───────────────────────────

create table public.dc_enrollments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  course_id         uuid not null references public.dc_courses(id),
  track_id          uuid not null references public.dc_schedule_tracks(id),
  order_item_id     uuid not null unique references public.dc_order_items(id) on delete cascade,
  status            public.dc_enrollment_status not null default 'active',
  start_month       date not null,
  total_lessons     smallint not null default 12,
  completed_lessons smallint not null default 0,
  created_at        timestamptz not null default now(),
  completed_at      timestamptz,
  unique (user_id, course_id, start_month)
);

create table public.dc_enrollment_progress (
  id              uuid primary key default gen_random_uuid(),
  enrollment_id   uuid not null references public.dc_enrollments(id) on delete cascade,
  lesson_id       uuid not null references public.dc_lessons(id),
  lesson_no       smallint not null check (lesson_no between 1 and 12),
  session_no      smallint not null,
  period_no       smallint not null,
  scheduled_at    timestamptz not null,
  status          public.dc_progress_status not null default 'scheduled',
  completed_at    timestamptz,
  instructor_note text,
  student_note    text,
  updated_at      timestamptz not null default now(),
  unique (enrollment_id, lesson_no)
);
comment on table public.dc_enrollment_progress is '수강 1건당 12행. MWF는 1일 1차시, SAT는 1일 3차시(3시간 연속)';

create table public.dc_homework_completions (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.dc_enrollments(id) on delete cascade,
  homework_id   uuid not null references public.dc_lesson_homework(id) on delete cascade,
  lesson_id     uuid not null references public.dc_lessons(id),
  is_done       boolean not null default true,
  completed_at  timestamptz not null default now(),
  student_note  text,
  unique (enrollment_id, homework_id)
);

create index dc_cart_user_idx        on public.dc_cart_items (user_id);
create index dc_orders_user_idx      on public.dc_orders (user_id, created_at desc);
create index dc_order_items_order_idx on public.dc_order_items (order_id);
create index dc_enroll_user_idx      on public.dc_enrollments (user_id, status);
create index dc_progress_enroll_idx  on public.dc_enrollment_progress (enrollment_id, lesson_no);
create index dc_progress_sched_idx   on public.dc_enrollment_progress (enrollment_id, scheduled_at);
create index dc_hwdone_enroll_idx    on public.dc_homework_completions (enrollment_id);

-- 진도 완료 개수 카운터 유지 (학생은 dc_enrollments에 UPDATE 권한이 없으므로 security definer)
create or replace function public.dc_sync_completed_lessons()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_enrollment uuid := coalesce(new.enrollment_id, old.enrollment_id);
  v_done       smallint;
begin
  select count(*) into v_done
    from public.dc_enrollment_progress
   where enrollment_id = v_enrollment and status = 'completed';

  update public.dc_enrollments
     set completed_lessons = v_done,
         status = case when v_done >= total_lessons and status = 'active'
                       then 'completed'::public.dc_enrollment_status
                       when v_done < total_lessons and status = 'completed'
                       then 'active'::public.dc_enrollment_status
                       else status end,
         completed_at = case when v_done >= total_lessons then now() else null end
   where id = v_enrollment;

  return null;
end;
$$;

create trigger dc_progress_counter
  after insert or update or delete on public.dc_enrollment_progress
  for each row execute function public.dc_sync_completed_lessons();

-- ─────────────────────────── 6. 수업 일정 생성 함수 ───────────────────────────

-- 해당 월의 수업 슬롯을 Asia/Seoul 기준으로 생성한다.
--   MWF : 월/수/금 12일 x 1교시   = 12차시
--   SAT : 토요일 4일 x 3교시(연속) = 12차시
create or replace function public.dc_session_slots(
  p_track       public.dc_track_type,
  p_month_start date,
  p_start_time  time
)
returns table (lesson_no smallint, session_no smallint, period_no smallint, scheduled_at timestamptz)
language sql
stable
set search_path = public, pg_temp
as $$
  with days as (
    select d::date as d, row_number() over (order by d) as n
      from generate_series(p_month_start::timestamp,
                           (p_month_start + 45)::timestamp,
                           interval '1 day') d
     where extract(isodow from d) = any (
             case p_track when 'MWF' then array[1,3,5] else array[6] end)
  ), kept as (
    select * from days
     where n <= case p_track when 'MWF' then 12 else 4 end
  )
  select (case p_track when 'MWF' then k.n else (k.n - 1) * 3 + p end)::smallint as lesson_no,
         k.n::smallint                                                           as session_no,
         (case p_track when 'MWF' then 1 else p end)::smallint                   as period_no,
         ((k.d + p_start_time) at time zone 'Asia/Seoul')
           + make_interval(hours => (case p_track when 'MWF' then 0 else p - 1 end)) as scheduled_at
    from kept k
    cross join lateral generate_series(1, case p_track when 'MWF' then 1 else 3 end) as p
   order by 1;
$$;

-- 결제 승인 후 호출. 주문 항목마다 수강 + 진도 12행을 만들고 장바구니를 비운다. 멱등.
-- 반환 타입이 table (enrollment_id uuid) 이면 OUT 컬럼명이 아래
-- insert ... on conflict (enrollment_id, lesson_no) 의 컬럼 참조와 충돌해
-- "column reference enrollment_id is ambiguous" 로 실패한다. setof uuid 로 둔다.
create or replace function public.dc_fulfill_order(p_order_code text)
returns setof uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.dc_orders;
  v_item  public.dc_order_items;
  v_track public.dc_schedule_tracks;
  v_enr   uuid;
begin
  select * into v_order from public.dc_orders where order_code = p_order_code for update;
  if not found then
    raise exception 'dc_fulfill_order: order % not found', p_order_code;
  end if;

  for v_item in select * from public.dc_order_items where order_id = v_order.id loop
    select * into v_track from public.dc_schedule_tracks where id = v_item.track_id;

    v_enr := null;
    insert into public.dc_enrollments
      (user_id, course_id, track_id, order_item_id, start_month, total_lessons)
    values (v_order.user_id, v_item.course_id, v_item.track_id, v_item.id, v_item.start_month, 12)
    on conflict (order_item_id) do nothing
    returning id into v_enr;

    if v_enr is null then
      continue;  -- 이미 처리된 주문 항목
    end if;

    insert into public.dc_enrollment_progress
      (enrollment_id, lesson_id, lesson_no, session_no, period_no, scheduled_at)
    select v_enr, l.id, s.lesson_no, s.session_no, s.period_no, s.scheduled_at
      from public.dc_session_slots(v_track.track_type, v_item.start_month, v_track.start_time) s
      join public.dc_lessons l
        on l.course_id = v_item.course_id and l.lesson_no = s.lesson_no
    on conflict (enrollment_id, lesson_no) do nothing;

    return next v_enr;
  end loop;

  delete from public.dc_cart_items c
   where c.user_id = v_order.user_id
     and exists (select 1 from public.dc_order_items oi
                  where oi.order_id = v_order.id
                    and oi.course_id = c.course_id
                    and oi.start_month = c.start_month);
end;
$$;

-- 일반 사용자가 직접 호출해 무료로 수강을 만들 수 없도록 실행 권한 회수 (service_role만 호출)
revoke execute on function public.dc_fulfill_order(text) from public, anon, authenticated;

-- ─────────────────────────── 7. RLS ───────────────────────────

alter table public.dc_languages            enable row level security;
alter table public.dc_levels               enable row level security;
alter table public.dc_class_types          enable row level security;
alter table public.dc_instructors          enable row level security;
alter table public.dc_courses              enable row level security;
alter table public.dc_schedule_tracks      enable row level security;
alter table public.dc_lessons              enable row level security;
alter table public.dc_lesson_homework      enable row level security;
alter table public.dc_profiles             enable row level security;
alter table public.dc_cart_items           enable row level security;
alter table public.dc_orders               enable row level security;
alter table public.dc_order_items          enable row level security;
alter table public.dc_payments             enable row level security;
alter table public.dc_enrollments          enable row level security;
alter table public.dc_enrollment_progress  enable row level security;
alter table public.dc_homework_completions enable row level security;

-- 카탈로그: 누구나 읽기. 쓰기 정책이 없으므로 service_role만 기록 가능
create policy dc_pub_read on public.dc_languages       for select to anon, authenticated using (true);
create policy dc_pub_read on public.dc_levels          for select to anon, authenticated using (true);
create policy dc_pub_read on public.dc_class_types     for select to anon, authenticated using (true);
create policy dc_pub_read on public.dc_instructors     for select to anon, authenticated using (true);
create policy dc_pub_read on public.dc_courses         for select to anon, authenticated using (is_active);
create policy dc_pub_read on public.dc_schedule_tracks for select to anon, authenticated using (is_active);
create policy dc_pub_read on public.dc_lessons         for select to anon, authenticated using (true);
create policy dc_pub_read on public.dc_lesson_homework for select to anon, authenticated using (true);

-- 프로필: 본인만
create policy dc_profile_self_sel on public.dc_profiles
  for select to authenticated using (id = (select auth.uid()));
create policy dc_profile_self_ins on public.dc_profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy dc_profile_self_upd on public.dc_profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- 장바구니: 본인 전체 CRUD
create policy dc_cart_owner on public.dc_cart_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 주문/결제: 본인 조회만. 생성·변경은 service_role 라우트 핸들러 전용
create policy dc_order_owner_sel on public.dc_orders
  for select to authenticated using (user_id = (select auth.uid()));
create policy dc_order_item_owner_sel on public.dc_order_items
  for select to authenticated using (exists (
    select 1 from public.dc_orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy dc_payment_owner_sel on public.dc_payments
  for select to authenticated using (exists (
    select 1 from public.dc_orders o where o.id = order_id and o.user_id = (select auth.uid())));

-- 수강: 본인 조회만 (생성은 dc_fulfill_order)
create policy dc_enroll_owner_sel on public.dc_enrollments
  for select to authenticated using (user_id = (select auth.uid()));

-- 진도: 본인 조회 + 수정 (학생이 진도 체크)
create policy dc_prog_owner_sel on public.dc_enrollment_progress
  for select to authenticated using (exists (
    select 1 from public.dc_enrollments e where e.id = enrollment_id and e.user_id = (select auth.uid())));
create policy dc_prog_owner_upd on public.dc_enrollment_progress
  for update to authenticated
  using (exists (
    select 1 from public.dc_enrollments e where e.id = enrollment_id and e.user_id = (select auth.uid())))
  with check (exists (
    select 1 from public.dc_enrollments e where e.id = enrollment_id and e.user_id = (select auth.uid())));

-- 숙제 완료: 본인 전체 CRUD (체크 시 upsert, 해제 시 delete)
create policy dc_hw_owner on public.dc_homework_completions
  for all to authenticated
  using (exists (
    select 1 from public.dc_enrollments e where e.id = enrollment_id and e.user_id = (select auth.uid())))
  with check (exists (
    select 1 from public.dc_enrollments e where e.id = enrollment_id and e.user_id = (select auth.uid())));
