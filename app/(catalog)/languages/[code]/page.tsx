import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/queries";
import { formatKrw } from "@/lib/format";
import CourseCard from "@/components/course-card";
import InstructorAvatar from "@/components/instructor-avatar";
import type { LanguageCode } from "@/lib/types";

export async function generateStaticParams() {
  return [{ code: "en" }, { code: "ja" }, { code: "es" }, { code: "zh" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const { languages } = await getCatalog();
  const lang = languages.find((l) => l.code === code);
  if (!lang) return { title: "언어를 찾을 수 없습니다" };
  return { title: lang.name_ko + " 클래스", description: lang.tagline_ko };
}

export default async function LanguagePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { languages, levels, courses, instructors } = await getCatalog();

  const lang = languages.find((l) => l.code === code);
  if (!lang) notFound();

  const langCourses = courses.filter((c) => c.language_code === (code as LanguageCode));
  const langInstructors = instructors
    .filter((i) => i.language_code === code)
    .sort(
      (a, b) =>
        (levels.find((l) => l.code === a.level_code)?.sort_order ?? 0) -
        (levels.find((l) => l.code === b.level_code)?.sort_order ?? 0),
    );

  return (
    <div>
      {/* 언어 테마 히어로 */}
      <section className="themed">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <div className="flex items-center gap-3 text-5xl">
            <span>{lang.flag_emoji}</span>
            {lang.flag_emoji_alt ? <span className="text-3xl opacity-80">{lang.flag_emoji_alt}</span> : null}
          </div>
          <p className="display mt-5 text-lg opacity-80">{lang.name_native}</p>
          <h1 className="display mt-1 text-4xl font-bold sm:text-5xl">{lang.name_ko} 클래스</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-90">{lang.tagline_ko}</p>
          <p className="mt-3 text-sm opacity-75">
            {lang.country_name_ko} · {lang.theme_mood_ko}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {levels.map((lv) => (
              <span
                key={lv.code}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold"
              >
                {lv.name_ko} {formatKrw(lv.price_krw)} / 월
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 강사 3인 */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="display mb-6 text-2xl font-bold">
          {lang.name_ko}를 가르치는 세 분의 선생님
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {langInstructors.map((ins) => {
            const level = levels.find((l) => l.code === ins.level_code);
            return (
              <div key={ins.id} data-lang={lang.code} className="card overflow-hidden">
                <div className="themed flex items-center gap-4 px-5 py-4">
                  <InstructorAvatar
                    url={ins.avatar_url}
                    emoji={ins.avatar_emoji}
                    name={ins.name_ko}
                    size={56}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold opacity-80">{level?.name_ko} 담당</p>
                    <p className="display truncate text-lg font-bold">{ins.name_ko}</p>
                    {ins.name_native ? (
                      <p className="display truncate text-xs opacity-75">{ins.name_native}</p>
                    ) : null}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip">{ins.nationality_ko}</span>
                    <span className="chip">{ins.is_native ? "원어민" : "한국인"}</span>
                    <span className="chip">경력 {ins.years_experience}년</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{ins.headline_ko}</p>
                  <p className="prose-muted mt-2 text-sm">{ins.bio_ko}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 레벨별 강의 9개 */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        {levels.map((lv) => {
          const group = langCourses.filter((c) => c.level_code === lv.code);
          if (group.length === 0) return null;
          return (
            <div key={lv.code} className="mb-12">
              <div className="mb-5 flex flex-wrap items-baseline gap-3">
                <h2 className="display text-2xl font-bold">
                  {lv.badge_emoji} {lang.name_ko} {lv.name_ko}
                </h2>
                <span className="chip chip-accent">{lv.instructor_rule_ko}</span>
                <span className="text-sm text-[var(--muted)]">{formatKrw(lv.price_krw)} / 월</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((c) => (
                  <CourseCard key={c.id} course={c} showLanguage={false} />
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex flex-wrap gap-3">
          <Link href="/courses" className="btn btn-ghost">
            다른 언어도 둘러보기
          </Link>
        </div>
      </section>
    </div>
  );
}
