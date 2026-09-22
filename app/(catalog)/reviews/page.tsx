import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog, listAllReviews } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";
import { ratingAvg } from "@/lib/types";
import StarRating from "@/components/star-rating";
import InstructorAvatar from "@/components/instructor-avatar";
import type { ClassTypeCode, LanguageCode } from "@/lib/types";

export const metadata: Metadata = {
  title: "강의 평가",
  description: "Dominic Class 수강생이 남긴 강의 평가를 모두 모았습니다.",
};

type SP = { language?: string; type?: string };

function buildHref(current: SP, patch: SP): string {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...current, ...patch })) {
    if (v) merged[k] = v;
  }
  const qs = new URLSearchParams(merged).toString();
  return qs ? "/reviews?" + qs : "/reviews";
}

export default async function ReviewsBoardPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const [{ languages, classTypes, courses, instructors }, allReviews] = await Promise.all([
    getCatalog(),
    listAllReviews(300),
  ]);

  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const insMap = new Map(instructors.map((i) => [i.id, i]));

  const rows = allReviews
    .map((r) => ({ review: r, course: courseMap.get(r.course_id) }))
    .filter((row) => row.course)
    .filter(
      (row) =>
        (!sp.language || row.course!.language_code === (sp.language as LanguageCode)) &&
        (!sp.type || row.course!.class_type_code === (sp.type as ClassTypeCode)),
    );

  const overall =
    rows.length > 0
      ? Math.round((rows.reduce((s, r) => s + r.review.rating, 0) / rows.length) * 10) / 10
      : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="display text-3xl sm:text-4xl">강의 평가</h1>
      <p className="prose-muted mt-2">
        수강생이 직접 남긴 후기입니다. 강의 상세 페이지에서 누구나 평가를 올릴 수 있습니다.
      </p>

      <div className="card mt-8 flex flex-wrap items-center justify-between gap-6 p-6">
        <div>
          <p className="text-xs font-bold text-[var(--muted)]">전체 평균</p>
          <div className="mt-1.5 flex items-center gap-2">
            <StarRating value={overall} size="md" />
            <span className="text-2xl font-extrabold">{overall > 0 ? overall.toFixed(1) : "-"}</span>
            <span className="text-sm text-[var(--muted)]">/ 5</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[var(--muted)]">등록된 평가</p>
          <p className="mt-1.5 text-2xl font-extrabold">{rows.length}개</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="card mt-5 space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 shrink-0 text-xs font-bold text-[var(--muted)]">언어</span>
          <Link
            href={buildHref(sp, { language: undefined })}
            className={sp.language ? "chip" : "chip chip-solid"}
          >
            전체
          </Link>
          {languages.map((l) => (
            <Link
              key={l.code}
              href={buildHref(sp, { language: l.code })}
              className={sp.language === l.code ? "chip chip-solid" : "chip"}
            >
              {l.flag_emoji} {l.name_ko}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 shrink-0 text-xs font-bold text-[var(--muted)]">유형</span>
          <Link
            href={buildHref(sp, { type: undefined })}
            className={sp.type ? "chip" : "chip chip-solid"}
          >
            전체
          </Link>
          {classTypes.map((t) => (
            <Link
              key={t.code}
              href={buildHref(sp, { type: t.code })}
              className={sp.type === t.code ? "chip chip-solid" : "chip"}
            >
              {t.icon_emoji} {t.name_ko}
            </Link>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="card mt-6 p-12 text-center text-[var(--muted)]">
          조건에 맞는 평가가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map(({ review, course }) => {
            const ins = insMap.get(course!.instructor_id);
            return (
              <li
                key={review.id}
                data-lang={course!.language_code}
                data-type={course!.class_type_code}
                className="card overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-3">
                  <Link
                    href={"/courses/" + course!.slug}
                    className="flex flex-wrap items-center gap-2 text-sm font-bold underline-offset-2 hover:underline"
                  >
                    <span>{course!.language.flag_emoji}</span>
                    {course!.title_ko}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="chip chip-type">{course!.class_type.name_ko}</span>
                    <span className="chip">
                      강의 평균 {ratingAvg(course!).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StarRating value={review.rating} />
                      <span className="text-sm font-bold">{review.title}</span>
                    </div>
                    <span className="text-xs text-[var(--muted)]">
                      {formatDateTime(review.created_at)}
                    </span>
                  </div>

                  <p className="prose-muted mt-2 text-sm">{review.body}</p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="chip">{review.author_name}</span>
                    {ins ? (
                      <Link
                        href={"/instructors/" + ins.id}
                        className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--fg)]"
                      >
                        <InstructorAvatar
                          url={ins.avatar_url}
                          emoji={ins.avatar_emoji}
                          name={ins.name_ko}
                          size={24}
                        />
                        {ins.name_ko} 강사
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
