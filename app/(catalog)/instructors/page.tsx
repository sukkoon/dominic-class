import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/queries";
import InstructorAvatar from "@/components/instructor-avatar";

export const metadata: Metadata = {
  title: "강사진",
  description:
    "강의마다 전담 강사 36명. 초급은 한국인 선생님, 중급은 한국어와 현지어를 모두 쓰는 선생님, 고급은 현지 원어민 강사.",
};

export default async function InstructorsPage() {
  const { languages, levels, classTypes, instructors, courses } = await getCatalog();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="display text-3xl font-bold sm:text-4xl">강사진</h1>
      <p className="prose-muted mt-2 max-w-2xl">
        문법 · 회화 · 시험을 한 사람이 겸하지 않습니다. 언어 × 레벨 × 클래스마다 전담 강사가 따로
        있어 모두 <strong>{instructors.length}명</strong>입니다.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {levels.map((lv) => (
          <div key={lv.code} data-level={lv.code} className="tone-signature card overflow-hidden">
            <div className="themed px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="display text-lg font-bold">
                  {lv.badge_emoji} {lv.name_ko}
                </p>
                <span className="level-meter" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <i key={i} data-on={i <= lv.sort_order ? "" : undefined} />
                  ))}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold opacity-90">{lv.instructor_rule_ko}</p>
            </div>
            <p className="prose-muted p-5 text-sm">{lv.summary_ko}</p>
          </div>
        ))}
      </div>

      {languages.map((lang) => (
        <section key={lang.code} data-lang={lang.code} className="mt-16">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h2 className="display text-2xl font-bold">
              {lang.flag_emoji} {lang.name_ko}
            </h2>
            <Link href={"/languages/" + lang.code} className="chip">
              {lang.name_ko} 클래스 보기
            </Link>
          </div>

          {levels.map((lv) => {
            const row = classTypes
              .map((ct) => ({
                classType: ct,
                instructor: instructors.find(
                  (i) =>
                    i.language_code === lang.code &&
                    i.level_code === lv.code &&
                    i.class_type_code === ct.code,
                ),
                course: courses.find(
                  (c) =>
                    c.language_code === lang.code &&
                    c.level_code === lv.code &&
                    c.class_type_code === ct.code,
                ),
              }))
              .filter((r) => r.instructor);

            if (row.length === 0) return null;

            return (
              <div key={lv.code} data-level={lv.code} className="mb-8">
                <div className="themed mb-3 flex items-center gap-2 rounded-lg px-4 py-2.5">
                  <span className="level-meter" aria-hidden="true">
                    {[1, 2, 3].map((i) => (
                      <i key={i} data-on={i <= lv.sort_order ? "" : undefined} />
                    ))}
                  </span>
                  <span className="text-sm font-bold">{lv.name_ko}</span>
                  <span className="ml-auto text-xs opacity-85">{lv.instructor_rule_ko}</span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {row.map(({ classType, instructor, course }) => (
                    <article
                      key={instructor!.id}
                      data-type={classType.code}
                      className="card flex flex-col p-5"
                    >
                      <div className="flex items-start gap-3.5">
                        <InstructorAvatar
                          url={instructor!.avatar_url}
                          emoji={instructor!.avatar_emoji}
                          name={instructor!.name_ko}
                          size={52}
                        />
                        <div className="min-w-0">
                          <span className="chip chip-type">
                            {classType.icon_emoji} {classType.name_ko}
                          </span>
                          <p className="display mt-1.5 truncate text-lg font-bold">
                            {instructor!.name_ko}
                          </p>
                          {instructor!.name_native ? (
                            <p className="display-native truncate text-xs text-[var(--muted)]">
                              {instructor!.name_native}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="chip">{instructor!.nationality_ko}</span>
                        <span className="chip">
                          {instructor!.is_native ? "현지 원어민" : "한국인 강사"}
                        </span>
                        <span className="chip">경력 {instructor!.years_experience}년</span>
                      </div>

                      <p className="mt-3 text-sm font-semibold">{instructor!.headline_ko}</p>
                      <p className="prose-muted mt-1.5 text-sm">{instructor!.bio_ko}</p>

                      <div className="mt-4 rounded-lg bg-[var(--surface-2)] p-3.5 text-xs">
                        <p className="font-bold text-[var(--muted)]">학력</p>
                        <p className="mt-1 leading-relaxed">{instructor!.education_ko}</p>
                        <p className="mt-2.5 font-bold text-[var(--muted)]">강의 경력</p>
                        <ul className="mt-1 space-y-0.5">
                          {instructor!.career_ko.map((c) => (
                            <li key={c} className="flex gap-1.5 leading-relaxed">
                              <span className="shrink-0 text-[var(--muted)]">·</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {course ? (
                        <Link
                          href={"/courses/" + course.slug}
                          className="btn btn-ghost mt-4 w-full !text-sm"
                        >
                          {classType.name_ko} 클래스 보기
                        </Link>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
