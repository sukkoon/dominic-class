import Link from "next/link";
import type { Metadata } from "next";
import { filterCourses, getCatalog } from "@/lib/queries";
import CourseCard from "@/components/course-card";
import type { ClassTypeCode, LanguageCode, LevelCode } from "@/lib/types";

export const metadata: Metadata = {
  title: "전체 강의",
  description: "영어·일본어·스페인어·중국어 36개 클래스. 언어·레벨·유형으로 골라보세요.",
};

type SP = { language?: string; level?: string; type?: string };

function buildHref(current: SP, patch: SP): string {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...current, ...patch })) {
    if (v) merged[k] = v;
  }
  const qs = new URLSearchParams(merged).toString();
  return qs ? "/courses?" + qs : "/courses";
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const { languages, levels, classTypes, courses } = await getCatalog();

  const list = filterCourses(courses, {
    language: sp.language as LanguageCode | undefined,
    level: sp.level as LevelCode | undefined,
    type: sp.type as ClassTypeCode | undefined,
  });

  const Filter = ({
    label,
    items,
    key_,
  }: {
    label: string;
    items: { code: string; name: string; emoji?: string }[];
    key_: keyof SP;
  }) => (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-12 shrink-0 text-xs font-bold text-[var(--muted)]">{label}</span>
      <Link
        href={buildHref(sp, { [key_]: undefined } as SP)}
        className={sp[key_] ? "chip" : "chip chip-solid"}
      >
        전체
      </Link>
      {items.map((it) => (
        <Link
          key={it.code}
          href={buildHref(sp, { [key_]: it.code } as SP)}
          className={sp[key_] === it.code ? "chip chip-solid" : "chip"}
        >
          {it.emoji ? <span>{it.emoji}</span> : null}
          {it.name}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="display text-3xl font-bold sm:text-4xl">전체 강의</h1>
      <p className="prose-muted mt-2">
        4개 언어 × 3개 레벨 × 3개 유형, 모두 {courses.length}개 클래스입니다.
      </p>

      <div className="card mt-8 space-y-3 p-5">
        <Filter
          label="언어"
          key_="language"
          items={languages.map((l) => ({ code: l.code, name: l.name_ko, emoji: l.flag_emoji }))}
        />
        <Filter
          label="레벨"
          key_="level"
          items={levels.map((l) => ({ code: l.code, name: l.name_ko, emoji: l.badge_emoji }))}
        />
        <Filter
          label="유형"
          key_="type"
          items={classTypes.map((t) => ({ code: t.code, name: t.name_ko, emoji: t.icon_emoji }))}
        />
      </div>

      <p className="mt-6 text-sm text-[var(--muted)]">{list.length}개 강의</p>

      {list.length === 0 ? (
        <p className="card mt-4 p-10 text-center text-[var(--muted)]">
          조건에 맞는 강의가 없습니다.
        </p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
