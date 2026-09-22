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

  const { course, lessons } = detail;
  const { courses } = await getCatalog();
  const months = startMonthOptions();

  const related = courses.filter(
    (c) => c.language_code === course.language_code && c.id !== course.id,
  );

  const totalHomework = lessons.reduce((s, l) => s + l.homework.length, 0);

  return (
    <div data-lang={course.language_code} data-level={course.level_code}>
      {/* 히어로 — 국가 모티프 + 현지어 워터마크 */}
      <section className="themed themed-hero">
        <span className="hero-watermark display" aria-hidden="true">
          {course.language.name_native}
        </span>

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

          <section className="card p-6">
            <h2 className="display text-xl font-bold">강의 소개</h2>
            <p className="prose-muted mt-3 text-sm">{course.description_ko}</p>
          </section>

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
                  <p className="display truncate text-sm opacity-75">
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
                      <div className="rounded-xl border border-[var(--border)] p-4 transition peer-checked:border-[var(--accent)] peer-checked:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]">
                        <p className="text-sm font-bold">{t.label_ko}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {t.days_label_ko} · {t.time_label_ko}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          월 {t.days_per_month}일 등원 · {t.lessons_per_month}차시
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
