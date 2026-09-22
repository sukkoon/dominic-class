import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog, getCourseDetail } from "@/lib/queries";
import { formatKrw, formatMonth } from "@/lib/format";
import { startMonthOptions } from "@/lib/site";
import { addToCart } from "@/app/actions/cart";
import InstructorAvatar from "@/components/instructor-avatar";
import CurriculumList from "@/components/curriculum-list";
import CourseCard from "@/components/course-card";
import LevelBadge from "@/components/level-badge";
import WeekSchedule from "@/components/week-schedule";
import LikeButton from "@/components/like-button";
import SamplePlayer from "@/components/sample-player";
import ReviewSection from "@/components/review-section";
import StarRating from "@/components/star-rating";
import { createClient } from "@/lib/supabase/server";
import { ratingAvg } from "@/lib/types";

export async function generateStaticParams() {
  const { courses } = await getCatalog();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getCourseDetail(slug);
  if (!detail) return { title: "강의를 찾을 수 없습니다" };
  return { title: detail.course.title_ko, description: detail.course.subtitle_ko };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const detail = await getCourseDetail(slug);
  if (!detail) notFound();

  const { course, lessons, sample, reviews } = detail;
  const { courses } = await getCatalog();
  const months = startMonthOptions();
  const avg = ratingAvg(course);

  // 로그인 사용자의 추천 여부는 쿠키 바인딩 클라이언트로 확인한다 (RLS 적용)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let liked = false;
  if (user) {
    const { data: likeRow } = await supabase
      .from("dc_course_likes")
      .select("id")
      .eq("course_id", course.id)
      .eq("user_id", user.id)
      .maybeSingle();
    liked = Boolean(likeRow);
  }

  const related = courses.filter(
    (c) => c.language_code === course.language_code && c.id !== course.id,
  );

  const totalHomework = lessons.reduce((s, l) => s + l.homework.length, 0);

  return (
    <div
      data-lang={course.language_code}
      data-level={course.level_code}
      data-type={course.class_type_code}
    >
      {/* 히어로 — 레벨 명도 계단을 그대로 쓴다 (사진은 언어 페이지에만) */}
      <section className="themed">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm opacity-80">
            <Link href="/courses">전체 강의</Link>
            <span>/</span>
            <Link href={"/languages/" + course.language_code}>
              {course.language.flag_emoji} {course.language.name_ko}
            </Link>
            <span>/</span>
            <span>{course.level.name_ko}</span>
          </nav>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <LevelBadge level={course.level} tone="onBrand" />
            <span className="chip chip-on-brand">
              {course.class_type.icon_emoji} {course.class_type.name_ko}
            </span>
          </div>

          <h1 className="display text-4xl font-bold sm:text-5xl">{course.title_ko}</h1>
          <p className="mt-3 max-w-2xl text-lg opacity-90">{course.subtitle_ko}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a href="#reviews" className="chip chip-on-brand !px-3 !py-1.5">
              <StarRating value={avg} />
              {avg > 0 ? avg.toFixed(1) : "-"} · 평가 {course.review_count}개
            </a>
            <LikeButton
              courseId={course.id}
              slug={course.slug}
              liked={liked}
              count={course.like_count}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {course.highlights.map((h) => (
              <span key={h} className="chip chip-on-brand !px-3.5 !py-1.5 !text-sm">
                {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_360px]">
        {/* 본문 */}
        <div className="min-w-0">
          {sp.error ? (
            <p className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {sp.error}
            </p>
          ) : null}

          {/* 강의 개요 — 목표 / 수료 후 성취 / 중점 내용 */}
          <section className="card overflow-hidden">
            <div className="themed px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">강의 목표</p>
              <p className="display mt-1.5 text-lg font-bold leading-relaxed sm:text-xl">
                {course.goal_ko}
              </p>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <p className="mb-2.5 text-sm font-bold">수료 후 이렇게 됩니다</p>
                <ul className="space-y-2">
                  {course.outcomes.map((o) => (
                    <li key={o} className="flex gap-2 text-sm leading-relaxed">
                      <span className="mt-0.5 shrink-0 font-bold text-[var(--accent)]">✓</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2.5 text-sm font-bold">중점적으로 다루는 내용</p>
                <ul className="space-y-2">
                  {course.focus_ko.map((f) => (
                    <li key={f} className="flex gap-2 text-sm leading-relaxed">
                      <span className="mt-0.5 shrink-0 text-[var(--muted)]">·</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  12차시 커리큘럼 중 대표 주제입니다. 전체는 아래에서 확인하세요.
                </p>
              </div>
            </div>

            <p className="prose-muted border-t border-[var(--border)] px-6 py-5 text-sm">
              {course.description_ko}
            </p>
          </section>

          {/* 15초 맛보기 */}
          {sample ? (
            <section className="card mt-6 p-6">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="display text-xl">15초 샘플 강의</h2>
                <p className="text-sm text-[var(--muted)]">
                  수업에서 실제로 다루는 문장입니다
                </p>
              </div>
              <SamplePlayer
                sample={sample}
                speechLang={course.language.speech_lang}
                languageName={course.language.name_ko}
              />
            </section>
          ) : null}

          <section className="card mt-6 overflow-hidden">
            <div className="themed flex items-center gap-4 px-6 py-5">
              <InstructorAvatar
                url={course.instructor.avatar_url}
                emoji={course.instructor.avatar_emoji}
                name={course.instructor.name_ko}
                size={64}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold opacity-80">
                  {course.level.name_ko} 전담 · {course.level.instructor_rule_ko}
                </p>
                <p className="display truncate text-xl font-bold">{course.instructor.name_ko}</p>
                {course.instructor.name_native ? (
                  <p className="display-native truncate text-sm opacity-75">
                    {course.instructor.name_native}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-1.5">
                <span className="chip">{course.instructor.nationality_ko}</span>
                <span className="chip">
                  {course.instructor.is_native ? "현지 원어민" : "한국인 강사"}
                </span>
                {course.instructor.speaks_korean ? (
                  <span className="chip">한국어 설명 가능</span>
                ) : (
                  <span className="chip chip-accent">수업 전체 {course.language.name_ko}</span>
                )}
                <span className="chip">경력 {course.instructor.years_experience}년</span>
              </div>
              <p className="mt-3 font-semibold">{course.instructor.headline_ko}</p>
              <p className="prose-muted mt-2 text-sm">{course.instructor.bio_ko}</p>

              <dl className="mt-5 space-y-3 border-t border-[var(--border)] pt-5 text-sm">
                <div>
                  <dt className="text-xs font-bold text-[var(--muted)]">학력</dt>
                  <dd className="mt-1">{course.instructor.education_ko}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-[var(--muted)]">강의 경력</dt>
                  <dd className="mt-1">
                    <ul className="space-y-1" data-role="career">
                      {course.instructor.career_ko.map((c) => (
                        <li key={c} className="flex gap-2">
                          <span className="shrink-0 text-[var(--muted)]">·</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>

              <Link
                href={"/instructors/" + course.instructor_id}
                className="btn btn-ghost mt-5 w-full !text-sm"
              >
                {course.instructor.name_ko} 강사 상세정보 · 평가 보기
              </Link>
            </div>
          </section>

          <section className="card mt-6 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="display text-xl font-bold">12차시 커리큘럼</h2>
              <p className="text-sm text-[var(--muted)]">
                차시별 숙제 {totalHomework}개 포함 · 차시를 눌러 펼쳐보세요
              </p>
            </div>
            <div className="mt-2">
              <CurriculumList lessons={lessons} />
            </div>
          </section>

          <ReviewSection
            courseId={course.id}
            slug={course.slug}
            reviews={reviews}
            currentUserId={user?.id ?? null}
            avg={avg}
          />
        </div>

        {/* 신청 사이드바 */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form action={addToCart} className="card overflow-hidden">
            <input type="hidden" name="course_id" value={course.id} />
            <input type="hidden" name="slug" value={course.slug} />

            <div className="themed px-6 py-5">
              <p className="text-xs font-semibold opacity-85">
                {course.language.flag_emoji} {course.language.name_ko} · {course.level.name_ko}
              </p>
              <p className="display mt-1 text-3xl font-bold">
                {formatKrw(course.price_krw)}
                <span className="ml-1 text-sm font-normal opacity-80">/ 월</span>
              </p>
              <p className="mt-0.5 text-xs opacity-80">월 12차시 · 총 12시간</p>
            </div>

            <div className="p-6">
              <fieldset>
                <legend className="mb-2 text-sm font-bold">수업 일정 선택</legend>
                <div className="space-y-2">
                  {course.tracks.map((t, i) => (
                    <label key={t.id} className="block cursor-pointer">
                      <input
                        type="radio"
                        name="track_id"
                        value={t.id}
                        defaultChecked={i === 0}
                        required
                        className="peer sr-only"
                      />
                      <div className="rounded-xl border border-[var(--border)] p-4 transition peer-checked:border-[var(--accent)] peer-checked:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold">{t.label_ko}</p>
                          <span className="chip shrink-0 !px-2 !py-0.5 !text-[11px]">
                            {t.time_label_ko.split(" (")[0]}
                          </span>
                        </div>

                        <div className="mt-3">
                          <WeekSchedule
                            daysOfWeek={t.days_of_week}
                            periodsPerDay={t.periods_per_day}
                          />
                        </div>

                        <p className="mt-3 text-xs text-[var(--muted)]">
                          월 {t.days_per_month}일 등원 · 하루 {t.hours_per_day}시간 ·{" "}
                          {t.lessons_per_month}차시
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5">
                <label htmlFor="start_month" className="mb-1.5 block text-sm font-bold">
                  수강 시작월
                </label>
                <select id="start_month" name="start_month" defaultValue={months[0]} required>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {formatMonth(m)}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary mt-6 w-full !py-3">
                장바구니에 담기
              </button>
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                결제 후 마이페이지에서 진도와 숙제를 관리할 수 있습니다.
              </p>
            </div>
          </form>

          <div className="card mt-5 p-6 text-sm">
            <p className="font-bold">이 강의를 들으면</p>
            <ul className="prose-muted mt-2 space-y-1.5">
              <li>· 매 차시 진도 체크로 어디까지 왔는지 확인</li>
              <li>· 강사가 내준 숙제를 한 화면에서 관리</li>
              <li>· 평일반 / 토요일 전일제 중 선택</li>
            </ul>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="display mb-5 text-2xl font-bold">
            {course.language.flag_emoji} {course.language.name_ko}의 다른 클래스
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((c) => (
              <CourseCard key={c.id} course={c} showLanguage={false} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
