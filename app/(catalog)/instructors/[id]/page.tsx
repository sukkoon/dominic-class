import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog, getCourseReviews } from "@/lib/queries";
import { formatDateTime, formatKrw } from "@/lib/format";
import { ratingAvg } from "@/lib/types";
import InstructorAvatar from "@/components/instructor-avatar";
import StarRating from "@/components/star-rating";
import LevelBadge from "@/components/level-badge";

export async function generateStaticParams() {
  // 환경변수가 없거나 DB에 닿지 못하면 미리 만들지 않고 요청 시 렌더한다.
  try {
    const { instructors } = await getCatalog();
    return instructors.map((i) => ({ id: i.id }));
  } catch (e) {
    console.warn("[generateStaticParams] /instructors/[id] 사전 생성 건너뜀:", e);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { instructors } = await getCatalog();
  const ins = instructors.find((i) => i.id === id);
  if (!ins) return { title: "강사를 찾을 수 없습니다" };
  return { title: ins.name_ko + " 강사", description: ins.headline_ko };
}

export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { instructors, courses, levels, classTypes, languages } = await getCatalog();

  const ins = instructors.find((i) => i.id === id);
  if (!ins) notFound();

  const course = courses.find((c) => c.instructor_id === ins.id);
  const lang = languages.find((l) => l.code === ins.language_code);
  const level = levels.find((l) => l.code === ins.level_code);
  const classType = classTypes.find((t) => t.code === ins.class_type_code);

  // 이 강사가 맡은 강의의 평가
  const reviews = course ? await getCourseReviews(course.id) : [];
  const avg = course ? ratingAvg(course) : 0;

  // 같은 언어의 다른 강사들
  const colleagues = instructors
    .filter((i) => i.language_code === ins.language_code && i.id !== ins.id)
    .sort(
      (a, b) =>
        (levels.find((l) => l.code === a.level_code)?.sort_order ?? 0) -
          (levels.find((l) => l.code === b.level_code)?.sort_order ?? 0) ||
        (classTypes.find((t) => t.code === a.class_type_code)?.sort_order ?? 0) -
          (classTypes.find((t) => t.code === b.class_type_code)?.sort_order ?? 0),
    );

  return (
    <div data-lang={ins.language_code} data-level={ins.level_code} data-type={ins.class_type_code}>
      <section className="themed">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm opacity-85">
            <Link href="/instructors">강사진</Link>
            <span>/</span>
            <Link href={"/languages/" + ins.language_code}>
              {lang?.flag_emoji} {lang?.name_ko}
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-5">
            <InstructorAvatar
              url={ins.avatar_url}
              emoji={ins.avatar_emoji}
              name={ins.name_ko}
              size={88}
            />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="chip chip-on-brand">
                  {lang?.flag_emoji} {lang?.name_ko}
                </span>
                <span className="chip chip-on-brand">{level?.name_ko}</span>
                <span className="chip chip-on-brand">
                  {classType?.icon_emoji} {classType?.name_ko}
                </span>
              </div>
              <h1 className="display text-3xl sm:text-4xl">{ins.name_ko}</h1>
              {ins.name_native ? (
                <p className="display-native mt-0.5 text-base opacity-80">{ins.name_native}</p>
              ) : null}
              <p className="mt-2 text-sm opacity-90">{ins.headline_ko}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <section className="card p-6">
            <h2 className="display text-xl">소개</h2>
            <p className="prose-muted mt-3 text-sm">{ins.bio_ko}</p>

            <dl className="mt-5 space-y-3 border-t border-[var(--border)] pt-5 text-sm">
              <div>
                <dt className="text-xs font-bold text-[var(--muted)]">학력</dt>
                <dd className="mt-1">{ins.education_ko}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[var(--muted)]">강의 경력</dt>
                <dd className="mt-1">
                  <ul className="space-y-1">
                    {ins.career_ko.map((c) => (
                      <li key={c} className="flex gap-2">
                        <span className="shrink-0 text-[var(--muted)]">·</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[var(--muted)]">수업 언어</dt>
                <dd className="mt-1">
                  {ins.speaks_korean
                    ? "한국어로 설명하고 " + (lang?.name_ko ?? "") + "로 연습합니다."
                    : "수업 전체를 " + (lang?.name_ko ?? "") + "로 진행합니다."}
                </dd>
              </div>
            </dl>
          </section>

          {/* 이 강사의 강의 평가 */}
          <section className="card mt-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] p-6">
              <div>
                <h2 className="display text-xl">{ins.name_ko} 강사 강의 평가</h2>
                <p className="prose-muted mt-1 text-sm">
                  {course ? course.title_ko : "담당 강의"} 수강생이 남긴 후기 {reviews.length}개
                </p>
              </div>
              <div className="text-right">
                <StarRating value={avg} size="md" showValue />
                <p className="mt-1 text-xs text-[var(--muted)]">5점 만점</p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="p-10 text-center text-sm text-[var(--muted)]">
                아직 등록된 평가가 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {reviews.map((r) => (
                  <li key={r.id} className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StarRating value={r.rating} />
                        <span className="text-sm font-bold">{r.title}</span>
                      </div>
                      <span className="text-xs text-[var(--muted)]">
                        {formatDateTime(r.created_at)}
                      </span>
                    </div>
                    <p className="prose-muted mt-2 text-sm">{r.body}</p>
                    <span className="chip mt-3">{r.author_name}</span>
                  </li>
                ))}
              </ul>
            )}

            {course ? (
              <div className="border-t border-[var(--border)] p-6">
                <Link href={"/courses/" + course.slug + "#reviews"} className="btn btn-ghost !text-sm">
                  이 강의에 평가 남기기
                </Link>
              </div>
            ) : null}
          </section>
        </div>

        {/* 담당 강의 */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {course ? (
            <div className="card overflow-hidden">
              <div className="themed px-5 py-4">
                <p className="text-xs font-semibold opacity-85">담당 강의</p>
                <p className="display mt-1 text-lg">{course.title_ko}</p>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-1.5">
                  <LevelBadge level={course.level} />
                  <span className="chip">{course.class_type.name_ko}</span>
                  <span className="chip">월 12차시</span>
                </div>
                <p className="prose-muted mt-3 text-sm">{course.goal_ko}</p>
                <p className="mt-4 text-2xl font-extrabold">
                  {formatKrw(course.price_krw)}
                  <span className="ml-1 text-sm font-normal text-[var(--muted)]">/ 월</span>
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                  <span className="chip">♥ 추천 {course.like_count}</span>
                  <span className="chip">평가 {course.review_count}</span>
                </div>
                <Link href={"/courses/" + course.slug} className="btn btn-primary mt-5 w-full !text-sm">
                  강의 보러가기
                </Link>
              </div>
            </div>
          ) : null}

          {colleagues.length > 0 ? (
            <div className="card mt-5 overflow-hidden">
              <p className="border-b border-[var(--border)] p-4 text-sm font-bold">
                {lang?.name_ko}를 함께 가르치는 선생님
              </p>
              <ul className="divide-y divide-[var(--border)]">
                {colleagues.map((c) => {
                  const lv = levels.find((l) => l.code === c.level_code);
                  const ct = classTypes.find((t) => t.code === c.class_type_code);
                  return (
                    <li key={c.id}>
                      <Link
                        href={"/instructors/" + c.id}
                        data-type={c.class_type_code}
                        className="flex items-center gap-2.5 px-4 py-2.5 transition hover:bg-[var(--surface-2)]"
                      >
                        <span
                          className="h-8 w-1 shrink-0 rounded-full"
                          style={{ background: "var(--type)" }}
                          aria-hidden="true"
                        />
                        <InstructorAvatar
                          url={c.avatar_url}
                          emoji={c.avatar_emoji}
                          name={c.name_ko}
                          size={30}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">{c.name_ko}</span>
                          <span className="block truncate text-xs text-[var(--muted)]">
                            {lv?.name_ko} · {ct?.name_ko}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
