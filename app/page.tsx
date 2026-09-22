import Link from "next/link";
import { getCatalog } from "@/lib/queries";
import { formatKrw } from "@/lib/format";
import InstructorAvatar from "@/components/instructor-avatar";
import WeekSchedule from "@/components/week-schedule";

const TRACKS = [
  {
    key: "MWF",
    badge: "평일반",
    title: "월 · 수 · 금 저녁 1시간",
    lead: "주 3회, 하루 1시간씩 짧게 자주. 퇴근 후 19:00~20:00에 진행합니다.",
    days: [1, 3, 5],
    periods: 1,
    time: "19:00 ~ 20:00",
    stats: [
      { label: "주당", value: "3회" },
      { label: "월 등원", value: "12일" },
      { label: "하루", value: "1시간" },
      { label: "월 수업", value: "12시간" },
    ],
    good: "매일 조금씩 쌓는 편이 몸에 잘 붙는 분",
  },
  {
    key: "SAT",
    badge: "주말 전일제",
    title: "토요일 3시간 연속",
    lead: "평일이 어려우면 토요일 하루에 몰아서. 10:00~13:00, 3교시를 이어서 수강합니다.",
    days: [6],
    periods: 3,
    time: "10:00 ~ 13:00",
    stats: [
      { label: "주당", value: "1회" },
      { label: "월 등원", value: "4일" },
      { label: "하루", value: "3시간" },
      { label: "월 수업", value: "12시간" },
    ],
    good: "평일 저녁 일정이 들쭉날쭉한 분",
  },
];

export default async function HomePage() {
  const { languages, levels, classTypes, instructors, courses } = await getCatalog();

  return (
    <div>
      {/* 히어로 — 밝은 바탕 + 4개 언어 색 레일 */}
      <section className="hero-bright">
        <div className="hero-rail" aria-hidden="true">
          <span style={{ background: "#ef3b4e" }} />
          <span style={{ background: "#c9456c" }} />
          <span style={{ background: "#e08900" }} />
          <span style={{ background: "#f0b429" }} />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="chip chip-accent mb-5">20~40대를 위한 외국어 클래스</p>

          <h1 className="display max-w-3xl text-4xl leading-[1.15] sm:text-6xl">
            퇴근하고 <em className="hero-accent">한 시간</em>,
            <br />
            주말에 <em className="hero-accent">세 시간</em>.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
            영어 · 일본어 · 스페인어 · 중국어.
            <br />
            초급은 한국인 선생님이, 중급은 두 언어를 모두 쓰는 선생님이, 고급은 현지 원어민이
            가르칩니다.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/courses" className="btn btn-primary !px-6 !py-3">
              전체 {courses.length}개 강의 보기
            </Link>
            <Link href="/instructors" className="btn btn-ghost !px-6 !py-3 !bg-[var(--surface)]">
              강사진 만나보기
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2.5">
            {languages.map((l) => (
              <Link
                key={l.code}
                href={"/languages/" + l.code}
                data-lang={l.code}
                className="hero-lang-chip"
              >
                <span className="text-lg">{l.flag_emoji}</span>
                {l.name_ko}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 언어 4종 */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <h2 className="display text-2xl sm:text-3xl">어떤 언어를 시작할까요?</h2>
          <p className="prose-muted mt-2">언어마다 초급 · 중급 · 고급으로 9개 클래스가 열립니다.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {languages.map((l) => (
            <Link
              key={l.code}
              href={"/languages/" + l.code}
              data-lang={l.code}
              data-level="advanced"
              className="themed themed-duo themed-motif group flex flex-col rounded-[var(--radius)] p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
            >
              <div className="text-4xl">{l.flag_emoji}</div>
              <h3 className="display mt-4 text-2xl">{l.name_ko}</h3>
              <p className="display-native text-sm opacity-75">{l.name_native}</p>
              <p className="mt-3 text-sm leading-relaxed opacity-90">{l.tagline_ko}</p>
              <span className="mt-6 text-sm font-bold opacity-90 group-hover:opacity-100">
                9개 클래스 보러가기 →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 레벨 · 가격 */}
      <section className="border-y border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8">
            <h2 className="display text-2xl sm:text-3xl">레벨과 수강료</h2>
            <p className="prose-muted mt-2">
              레벨이 올라갈수록 색이 짙어지고, 가르치는 선생님도 달라집니다.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {levels.map((lv) => (
              <div
                key={lv.code}
                data-level={lv.code}
                className="tone-signature card flex flex-col overflow-hidden"
              >
                <div className="themed px-6 py-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="display text-xl">
                      {lv.badge_emoji} {lv.name_ko}
                    </h3>
                    <span className="level-meter" aria-hidden="true">
                      {[1, 2, 3].map((i) => (
                        <i key={i} data-on={i <= lv.sort_order ? "" : undefined} />
                      ))}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold opacity-90">{lv.instructor_rule_ko}</p>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="prose-muted text-sm">{lv.summary_ko}</p>
                  <p className="mt-6 text-3xl font-extrabold">
                    {formatKrw(lv.price_krw)}
                    <span className="ml-1 text-sm font-normal text-[var(--muted)]">/ 월</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">월 12차시 · 총 12시간</p>
                  <Link href={"/courses?level=" + lv.code} className="btn btn-ghost mt-6 w-full">
                    {lv.name_ko} 클래스 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 수업 일정 — 주간 그리드로 한눈에 비교 */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <h2 className="display text-2xl sm:text-3xl">일정은 두 가지 중에 고르세요</h2>
          <p className="prose-muted mt-2">
            어느 쪽을 골라도 한 달에 <strong className="text-[var(--fg)]">같은 12차시</strong>를
            배웁니다. 커리큘럼과 진도표도 동일합니다.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {TRACKS.map((t) => (
            <div key={t.key} className="card flex flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-6 pb-5">
                <div>
                  <span className={t.key === "MWF" ? "chip" : "chip chip-accent"}>{t.badge}</span>
                  <h3 className="display mt-2.5 text-2xl">{t.title}</h3>
                  <p className="prose-muted mt-2 text-sm">{t.lead}</p>
                </div>
                <span className="chip shrink-0">{t.time}</span>
              </div>

              <div className="p-6">
                <p className="mb-2.5 text-xs font-bold text-[var(--muted)]">
                  주간 시간표 · 칸 하나가 1시간입니다
                </p>
                <WeekSchedule daysOfWeek={t.days} periodsPerDay={t.periods} />

                <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {t.stats.map((s) => (
                    <div key={s.label} className="stat-box">
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-5 rounded-lg bg-[var(--surface-2)] px-4 py-3 text-sm">
                  <strong>이런 분에게</strong> · {t.good}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 클래스 유형 — 진행 순서와 추천 대상까지 */}
      <section className="border-y border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8">
            <h2 className="display text-2xl sm:text-3xl">레벨마다 세 가지 클래스가 열립니다</h2>
            <p className="prose-muted mt-2">
              한 차시가 어떻게 흘러가는지까지 정해져 있습니다. 골라서 하나만 들어도 됩니다.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {classTypes.map((ct) => (
              <div key={ct.code} data-type={ct.code} className="card flex flex-col overflow-hidden">
                <div className="type-head flex items-center gap-3 px-6 py-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 text-2xl">
                    {ct.icon_emoji}
                  </span>
                  <div>
                    <h3 className="display text-xl">{ct.name_ko}</h3>
                    <p className="text-xs font-bold opacity-90">{ct.tagline_ko}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="prose-muted text-sm">{ct.summary_ko}</p>

                  <p className="mb-2.5 mt-5 text-xs font-bold text-[var(--muted)]">
                    한 차시 진행 순서
                  </p>
                  <ol className="step-list">
                    {ct.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>

                  <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-xs font-bold text-[var(--muted)]">이런 분에게</p>
                    <p className="mt-1 text-sm leading-relaxed">{ct.for_whom_ko}</p>
                  </div>

                  <Link
                    href={"/courses?type=" + ct.code}
                    className="btn btn-ghost mt-5 w-full !text-sm"
                  >
                    {ct.name_ko} 클래스 4개 언어로 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-relaxed">
            <strong>시험 클래스는 전 언어 OPIc 기준입니다.</strong> 배경설문 설계부터 자기소개
            템플릿, 롤플레이 공략, 돌발 질문 대처, AL 전략까지 12차시로 구성했습니다. 언어만 다를 뿐
            시험 형식은 동일하기 때문에, 한 번 익힌 전략을 다른 언어에도 그대로 쓸 수 있습니다.
          </p>
        </div>
      </section>

      {/* 강사 36명 — 어떤 언어 / 등급 / 수업을 맡는지 함께 표기 */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display text-2xl sm:text-3xl">{instructors.length}명의 선생님</h2>
            <p className="prose-muted mt-2">
              문법 · 회화 · 시험을 한 사람이 겸하지 않습니다. 언어 × 등급 × 수업마다 전담 강사가
              따로 있습니다.
            </p>
          </div>
          <Link href="/instructors" className="btn btn-ghost shrink-0">
            강사 상세정보 보기
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {languages.map((lang) => (
            <div key={lang.code} data-lang={lang.code} className="card overflow-hidden">
              <div data-level="advanced" className="themed px-4 py-3.5">
                <p className="display text-base">
                  {lang.flag_emoji} {lang.name_ko}
                </p>
                <p className="mt-0.5 text-xs opacity-85">전담 강사 9명</p>
              </div>

              <ul className="divide-y divide-[var(--border)]">
                {levels.flatMap((lv) =>
                  classTypes.map((ct) => {
                    const ins = instructors.find(
                      (i) =>
                        i.language_code === lang.code &&
                        i.level_code === lv.code &&
                        i.class_type_code === ct.code,
                    );
                    if (!ins) return null;
                    return (
                      <li
                        key={lv.code + ct.code}
                        data-type={ct.code}
                        className="flex items-center gap-2.5 px-3.5 py-2.5"
                      >
                        <span
                          className="h-8 w-1 shrink-0 rounded-full"
                          style={{ background: "var(--type)" }}
                          aria-hidden="true"
                        />
                        <InstructorAvatar
                          url={ins.avatar_url}
                          emoji={ins.avatar_emoji}
                          name={ins.name_ko}
                          size={32}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{ins.name_ko}</p>
                          <p className="truncate text-xs text-[var(--muted)]">
                            {lv.name_ko} · {ct.name_ko}
                          </p>
                        </div>
                      </li>
                    );
                  }),
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
