import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/queries";
import { formatKrw } from "@/lib/format";
import CourseCard from "@/components/course-card";
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
  const { languages, levels, courses } = await getCatalog();

  const lang = languages.find((l) => l.code === code);
  if (!lang) notFound();

  const langCourses = courses.filter((c) => c.language_code === (code as LanguageCode));

  return (
    <div>
      {/* 언어 테마 히어로 — 현지어 워터마크 + 국가 모티프 */}
      <section className="themed themed-hero">
        <span className="hero-watermark display" aria-hidden="true">
          {lang.name_native}
        </span>

        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <div className="flex items-center gap-3 text-5xl">
            <span>{lang.flag_emoji}</span>
            {lang.flag_emoji_alt ? (
              <span className="text-3xl opacity-80">{lang.flag_emoji_alt}</span>
            ) : null}
          </div>
          <p className="display mt-5 text-lg opacity-80">{lang.name_native}</p>
          <h1 className="display mt-1 text-4xl font-bold sm:text-5xl">{lang.name_ko} 클래스</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-90">{lang.tagline_ko}</p>
          <p className="mt-3 text-sm opacity-75">
            {lang.country_name_ko} · {lang.theme_mood_ko}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {levels.map((lv) => (
              <a key={lv.code} href={"#" + lv.code} className="chip chip-on-brand !px-4 !py-2 !text-sm">
                <span className="level-meter" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <i key={i} data-on={i <= lv.sort_order ? "" : undefined} />
                  ))}
                </span>
                {lv.name_ko} {formatKrw(lv.price_krw)} / 월
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 레벨 3개 섹션 × 클래스 3개 = 9개 강의.
          섹션 제목이 이미 "영어 초급"이므로 카드에는 문법 / 회화 / 시험만 적는다. */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        {levels.map((lv) => {
          const group = langCourses.filter((c) => c.level_code === lv.code);
          if (group.length === 0) return null;

          return (
            <div
              key={lv.code}
              id={lv.code}
              data-lang={lang.code}
              data-level={lv.code}
              className="mb-14 scroll-mt-24"
            >
              <div className="themed mb-5 rounded-[var(--radius)] px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="level-meter" aria-hidden="true">
                        {[1, 2, 3].map((i) => (
                          <i key={i} data-on={i <= lv.sort_order ? "" : undefined} />
                        ))}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                        Level {lv.sort_order}
                      </span>
                    </div>
                    <h2 className="display text-2xl font-bold sm:text-3xl">
                      {lang.name_ko} {lv.name_ko}
                    </h2>
                    <p className="mt-1 text-sm opacity-85">{lv.summary_ko}</p>
                  </div>

                  <div className="text-right">
                    <span className="chip chip-on-brand">{lv.instructor_rule_ko}</span>
                    <p className="display mt-2 text-2xl font-bold">
                      {formatKrw(lv.price_krw)}
                      <span className="ml-1 text-sm font-normal opacity-80">/ 월</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((c) => (
                  <CourseCard key={c.id} course={c} variant="compact" />
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex flex-wrap gap-3">
          <Link href="/courses" className="btn btn-ghost">
            다른 언어도 둘러보기
          </Link>
          <Link href="/instructors" className="btn btn-ghost">
            {lang.name_ko} 강사 9인 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
