import Link from "next/link";
import { getCatalog } from "@/lib/queries";
import { formatKrw } from "@/lib/format";
import InstructorAvatar from "@/components/instructor-avatar";

export default async function HomePage() {
  const { languages, levels, classTypes, instructors, courses } = await getCatalog();

  return (
    <div>
      {/* 히어로 */}
      <section className="themed">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="chip chip-on-brand mb-5">20~40대를 위한 외국어 클래스</p>
          <h1 className="display max-w-3xl text-4xl font-bold leading-[1.15] sm:text-6xl">
            퇴근하고 한 시간,
            <br />
            주말에 세 시간.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-90">
            영어 · 일본어 · 스페인어 · 중국어.
            <br />
            초급은 한국인 선생님이, 중급은 두 언어를 모두 쓰는 선생님이, 고급은 현지 원어민이
            가르칩니다.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="btn !bg-[var(--on-brand)] !text-[var(--brand-base)] !px-6 !py-3"
            >
              전체 {courses.length}개 강의 보기
            </Link>
            <Link
              href="/instructors"
              className="btn !border-white/40 !text-[var(--on-brand)] !px-6 !py-3"
            >
              강사진 만나보기
            </Link>
          </div>
        </div>
      </section>

      {/* 언어 4종 — 카드마다 그 나라 국기 두 색 + 국가 모티프 */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <h2 className="display text-2xl font-bold sm:text-3xl">어떤 언어를 시작할까요?</h2>
          <p className="prose-muted mt-2">각 언어 페이지는 그 나라의 색과 서체로 꾸며 두었습니다.</p>
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
              <div className="flex items-center gap-2 text-4xl">
                <span>{l.flag_emoji}</span>
                {l.flag_emoji_alt ? (
                  <span className="text-2xl opacity-80">{l.flag_emoji_alt}</span>
                ) : null}
              </div>
              <h3 className="display mt-4 text-2xl font-bold">{l.name_ko}</h3>
              <p className="display text-sm opacity-75">{l.name_native}</p>
              <p className="mt-3 text-sm leading-relaxed opacity-90">{l.tagline_ko}</p>
              <p className="mt-4 text-xs opacity-70">{l.theme_mood_ko}</p>
              <span className="mt-5 text-sm font-semibold opacity-90 group-hover:opacity-100">
                9개 클래스 보러가기 →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 레벨 · 가격 — 옅은 색에서 짙은 색으로 */}
      <section className="border-y border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8">
            <h2 className="display text-2xl font-bold sm:text-3xl">레벨과 수강료</h2>
            <p className="prose-muted mt-2">
              레벨이 올라갈수록 색이 짙어지고, 가르치는 선생님도 달라집니다.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {levels.map((lv) => (
              <div key={lv.code} data-level={lv.code} className="card flex flex-col overflow-hidden">
                <div className="themed px-6 py-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="display text-xl font-bold">
                      {lv.badge_emoji} {lv.name_ko}
                    </h3>
                    <span className="level-meter" aria-hidden="true">
                      {[1, 2, 3].map((i) => (
                        <i key={i} data-on={i <= lv.sort_order ? "" : undefined} />
                      ))}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold opacity-90">
                    {lv.instructor_rule_ko}
                  </p>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="prose-muted text-sm">{lv.summary_ko}</p>
                  <p className="mt-6 text-3xl font-bold">
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

      {/* 수업 일정 2트랙 */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <h2 className="display text-2xl font-bold sm:text-3xl">일정은 두 가지 중에 고르세요</h2>
          <p className="prose-muted mt-2">
            어느 쪽을 골라도 한 달에 같은 12차시를 배웁니다. 진도표도 동일합니다.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="card p-7">
            <span className="chip">평일반</span>
            <h3 className="display mt-3 text-2xl font-bold">월 · 수 · 금 저녁 1시간</h3>
            <p className="prose-muted mt-3 text-sm">
              주 3회, 하루 1시간씩 짧게 자주. 퇴근 후 19:00~20:00에 진행합니다.
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-[var(--surface-2)] p-3">
                <dt className="text-xs text-[var(--muted)]">주당</dt>
                <dd className="mt-0.5 font-bold">3회</dd>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] p-3">
                <dt className="text-xs text-[var(--muted)]">월 등원</dt>
                <dd className="mt-0.5 font-bold">12일</dd>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] p-3">
                <dt className="text-xs text-[var(--muted)]">월 수업</dt>
                <dd className="mt-0.5 font-bold">12시간</dd>
              </div>
            </dl>
          </div>

          <div className="card p-7">
            <span className="chip chip-accent">주말 전일제</span>
            <h3 className="display mt-3 text-2xl font-bold">토요일 3시간 연속</h3>
            <p className="prose-muted mt-3 text-sm">
              평일이 어려우면 토요일 하루에 몰아서. 10:00~13:00, 3교시를 이어서 수강합니다.
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-[var(--surface-2)] p-3">
                <dt className="text-xs text-[var(--muted)]">주당</dt>
                <dd className="mt-0.5 font-bold">1회</dd>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] p-3">
                <dt className="text-xs text-[var(--muted)]">월 등원</dt>
                <dd className="mt-0.5 font-bold">4일</dd>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] p-3">
                <dt className="text-xs text-[var(--muted)]">월 수업</dt>
                <dd className="mt-0.5 font-bold">12시간</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* 클래스 유형 */}
      <section className="border-y border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="display mb-8 text-2xl font-bold sm:text-3xl">
            레벨마다 세 가지 클래스가 열립니다
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {classTypes.map((ct) => (
              <div key={ct.code} className="card p-6">
                <span className="text-3xl">{ct.icon_emoji}</span>
                <h3 className="mt-3 text-xl font-bold">{ct.name_ko}</h3>
                <p className="mt-1 text-sm font-semibold text-[var(--accent)]">{ct.tagline_ko}</p>
                <p className="prose-muted mt-3 text-sm">{ct.summary_ko}</p>
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

      {/* 강사 미리보기 */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="display text-2xl font-bold sm:text-3xl">12명의 선생님</h2>
            <p className="prose-muted mt-2">언어 × 레벨마다 전담 강사가 배정됩니다.</p>
          </div>
          <Link href="/instructors" className="btn btn-ghost shrink-0">
            전체 보기
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {instructors
            .slice()
            .sort((a, b) => a.language_code.localeCompare(b.language_code))
            .map((ins) => (
              <div
                key={ins.id}
                data-lang={ins.language_code}
                data-level={ins.level_code}
                className="card overflow-hidden text-center"
              >
                <div className="themed h-1.5" />
                <div className="p-4">
                  <div className="flex justify-center">
                    <InstructorAvatar
                      url={ins.avatar_url}
                      emoji={ins.avatar_emoji}
                      name={ins.name_ko}
                      size={56}
                    />
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold">{ins.name_ko}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{ins.nationality_ko}</p>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
