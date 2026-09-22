import Link from "next/link";
import type { CourseFull } from "@/lib/types";
import { formatKrw } from "@/lib/format";
import InstructorAvatar from "./instructor-avatar";
import LevelBadge from "./level-badge";

/**
 * variant
 *  - "full"    : 전체 강의 목록처럼 언어·레벨을 알 수 없는 곳. 제목에 "영어 초급 문법"을 그대로 쓴다.
 *  - "compact" : 이미 "영어 초급" 섹션 안에 놓인 경우. 언어·레벨 표기를 모두 빼고 "문법"만 남긴다.
 */
export default function CourseCard({
  course,
  showLanguage = true,
  variant = "full",
}: {
  course: CourseFull;
  showLanguage?: boolean;
  variant?: "full" | "compact";
}) {
  const compact = variant === "compact";

  return (
    <Link
      href={"/courses/" + course.slug}
      data-lang={course.language_code}
      data-level={course.level_code}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <div className="themed px-5 py-4">
        {compact ? (
          <>
            <span className="text-2xl">{course.class_type.icon_emoji}</span>
            <h3 className="display mt-1.5 text-2xl font-bold">{course.class_type.name_ko}</h3>
            <p className="mt-0.5 text-xs opacity-85">{course.class_type.tagline_ko}</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold opacity-90">
                {showLanguage ? <span className="mr-1.5">{course.language.flag_emoji}</span> : null}
                {course.language.name_ko} · {course.level.name_ko}
              </span>
              <span className="level-meter" aria-hidden="true">
                {[1, 2, 3].map((i) => (
                  <i key={i} data-on={i <= course.level.sort_order ? "" : undefined} />
                ))}
              </span>
            </div>
            <h3 className="display mt-1.5 text-xl font-bold">{course.title_ko}</h3>
            <p className="mt-0.5 text-xs opacity-80">
              {course.class_type.icon_emoji} {course.class_type.tagline_ko}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <InstructorAvatar
            url={course.instructor.avatar_url}
            emoji={course.instructor.avatar_emoji}
            name={course.instructor.name_ko}
            size={40}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {course.instructor.name_ko}
              {course.instructor.name_native ? (
                <span className="ml-1 font-normal text-[var(--muted)]">
                  {course.instructor.name_native}
                </span>
              ) : null}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              {course.instructor.nationality_ko} ·{" "}
              {course.instructor.is_native ? "현지 원어민 강사" : "한국인 강사"}
            </p>
          </div>
        </div>

        {compact ? (
          <p className="prose-muted line-clamp-2 text-xs">{course.instructor.headline_ko}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <LevelBadge level={course.level} />
            <span className="chip">{course.class_type.name_ko}</span>
            <span className="chip">월 12차시</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="text-xs leading-relaxed text-[var(--muted)]">
            <p>월·수·금 1시간</p>
            <p>또는 토요일 3시간</p>
          </div>
          <p className="text-lg font-bold">
            {formatKrw(course.price_krw)}
            <span className="ml-1 text-xs font-normal text-[var(--muted)]">/ 월</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
