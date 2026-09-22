import Link from "next/link";
import type { CourseFull } from "@/lib/types";
import { formatKrw } from "@/lib/format";
import InstructorAvatar from "./instructor-avatar";
import LevelBadge from "./level-badge";

/**
 * variant
 *  - "full"    : 전체 강의 목록처럼 언어·레벨을 알 수 없는 곳.
 *                제목에 "영어 초급 문법"을 그대로 쓰고, 머리 색은 레벨 명도 계단을 따른다.
 *  - "compact" : 이미 "영어 초급" 섹션 안에 놓인 경우.
 *                언어·레벨 표기를 빼고 "문법"만 남기며, 머리 색은 유형색(청록/바이올렛/슬레이트)을 쓴다.
 *                같은 레벨 카드 세 장이 나란히 놓여도 서로 구분된다.
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
      data-type={course.class_type_code}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      {compact ? (
        <div className="type-head flex items-center gap-3 px-5 py-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20 text-xl">
            {course.class_type.icon_emoji}
          </span>
          <div className="min-w-0">
            <h3 className="display text-xl">{course.class_type.name_ko}</h3>
            <p className="truncate text-xs font-bold opacity-90">{course.class_type.tagline_ko}</p>
          </div>
        </div>
      ) : (
        <div className="themed px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold opacity-90">
              {showLanguage ? <span className="mr-1.5">{course.language.flag_emoji}</span> : null}
              {course.language.name_ko} · {course.level.name_ko}
            </span>
            <span className="level-meter" aria-hidden="true">
              {[1, 2, 3].map((i) => (
                <i key={i} data-on={i <= course.level.sort_order ? "" : undefined} />
              ))}
            </span>
          </div>
          <h3 className="display mt-1.5 text-xl">{course.title_ko}</h3>
          <p className="mt-0.5 text-xs opacity-80">
            {course.class_type.icon_emoji} {course.class_type.tagline_ko}
          </p>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {compact ? (
          <p className="text-sm font-bold leading-relaxed">{course.goal_ko}</p>
        ) : null}

        <div className="flex items-center gap-3">
          <InstructorAvatar
            url={course.instructor.avatar_url}
            emoji={course.instructor.avatar_emoji}
            name={course.instructor.name_ko}
            size={40}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {course.instructor.name_ko}
              {course.instructor.name_native ? (
                <span className="display-native ml-1 font-normal text-[var(--muted)]">
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
          <div className="flex flex-wrap gap-1.5">
            <span className="chip chip-type">월 12차시</span>
            <span className="chip">숙제 24개</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <LevelBadge level={course.level} />
            <span className="chip">{course.class_type.name_ko}</span>
            <span className="chip">월 12차시</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between border-t border-[var(--border)] pt-3">
          <div className="text-xs leading-relaxed text-[var(--muted)]">
            <p>월·수·금 1시간</p>
            <p>또는 토요일 3시간</p>
          </div>
          <p className="text-lg font-extrabold">
            {formatKrw(course.price_krw)}
            <span className="ml-1 text-xs font-normal text-[var(--muted)]">/ 월</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
