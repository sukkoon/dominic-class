import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/queries";
import InstructorAvatar from "@/components/instructor-avatar";

export const metadata: Metadata = {
  title: "강사진",
  description:
    "초급은 한국인 선생님, 중급은 한국어와 현지어를 모두 쓰는 선생님, 고급은 현지 원어민 강사.",
};

export default async function InstructorsPage() {
  const { languages, levels, instructors, courses } = await getCatalog();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="display text-3xl font-bold sm:text-4xl">강사진</h1>
      <p className="prose-muted mt-2 max-w-2xl">
        Dominic Class는 레벨마다 가르치는 사람이 다릅니다. 처음에는 한국어로 확실히 이해하고,
        마지막에는 현지어만으로 수업합니다.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {levels.map((lv) => (
          <div key={lv.code} className="card p-5">
            <p className="text-lg font-bold">
              {lv.badge_emoji} {lv.name_ko}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
              {lv.instructor_rule_ko}
            </p>
            <p className="prose-muted mt-2 text-sm">{lv.summary_ko}</p>
          </div>
        ))}
      </div>

      {languages.map((lang) => {
        const group = instructors
          .filter((i) => i.language_code === lang.code)
          .sort(
            (a, b) =>
              (levels.find((l) => l.code === a.level_code)?.sort_order ?? 0) -
              (levels.find((l) => l.code === b.level_code)?.sort_order ?? 0),
          );

        return (
          <section key={lang.code} data-lang={lang.code} className="mt-14">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <h2 className="display text-2xl font-bold">
                {lang.flag_emoji} {lang.name_ko}
              </h2>
              <Link href={"/languages/" + lang.code} className="chip">
                {lang.name_ko} 클래스 보기
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {group.map((ins) => {
                const level = levels.find((l) => l.code === ins.level_code);
                const taught = courses.filter(
                  (c) => c.language_code === lang.code && c.level_code === ins.level_code,
                );
                return (
                  <article
                    key={ins.id}
                    data-level={ins.level_code}
                    className="card overflow-hidden"
                  >
                    <div className="themed flex items-center gap-4 px-5 py-5">
                      <InstructorAvatar
                        url={ins.avatar_url}
                        emoji={ins.avatar_emoji}
                        name={ins.name_ko}
                        size={64}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold opacity-80">{level?.name_ko} 전담</p>
                        <p className="display truncate text-xl font-bold">{ins.name_ko}</p>
                        {ins.name_native ? (
                          <p className="display truncate text-sm opacity-75">{ins.name_native}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="chip">{ins.nationality_ko}</span>
                        <span className="chip">
                          {ins.is_native ? "현지 원어민" : "한국인 강사"}
                        </span>
                        {ins.speaks_korean ? <span className="chip">한국어 수업 가능</span> : null}
                        <span className="chip">경력 {ins.years_experience}년</span>
                      </div>

                      <p className="mt-3 font-semibold">{ins.headline_ko}</p>
                      <p className="prose-muted mt-2 text-sm">{ins.bio_ko}</p>

                      <p className="mt-4 text-xs font-bold text-[var(--muted)]">담당 클래스</p>
                      <ul className="mt-1.5 space-y-1">
                        {taught.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={"/courses/" + c.slug}
                              className="text-sm underline-offset-2 hover:underline"
                            >
                              {c.class_type.icon_emoji} {c.title_ko}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
