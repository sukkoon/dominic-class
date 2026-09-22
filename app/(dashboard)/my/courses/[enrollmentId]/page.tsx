import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/queries";
import { formatMonth, formatSessionDate, formatSessionTime } from "@/lib/format";
import { toggleSessionComplete } from "@/app/actions/progress";
import { toggleHomework } from "@/app/actions/homework";
import InstructorAvatar from "@/components/instructor-avatar";
import type { Lesson, LessonHomework, ProgressStatus, ScheduleTrack } from "@/lib/types";

export const metadata: Metadata = { title: "진도 체크" };

type ProgressRow = {
  id: string;
  lesson_id: string;
  lesson_no: number;
  session_no: number;
  period_no: number;
  scheduled_at: string;
  status: ProgressStatus;
  lesson: Lesson;
};

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const { enrollmentId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=" + encodeURIComponent("/my/courses/" + enrollmentId));

  // RLS로 본인 수강만 조회된다.
  const { data: enrollment } = await supabase
    .from("dc_enrollments")
    .select("*, track:dc_schedule_tracks(*)")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (!enrollment) notFound();

  const track = enrollment.track as ScheduleTrack;

  const { data: progressData } = await supabase
    .from("dc_enrollment_progress")
    .select("id, lesson_id, lesson_no, session_no, period_no, scheduled_at, status, lesson:dc_lessons(*)")
    .eq("enrollment_id", enrollmentId)
    .order("lesson_no");

  const progress = (progressData ?? []) as unknown as ProgressRow[];

  const { data: hwData } = await supabase
    .from("dc_lesson_homework")
    .select("*")
    .in("lesson_id", progress.length ? progress.map((p) => p.lesson_id) : [""])
    .order("seq");
  const homework = (hwData ?? []) as LessonHomework[];

  const { data: doneData } = await supabase
    .from("dc_homework_completions")
    .select("homework_id")
    .eq("enrollment_id", enrollmentId);
  const doneSet = new Set(((doneData ?? []) as { homework_id: string }[]).map((d) => d.homework_id));

  const hwByLesson = new Map<string, LessonHomework[]>();
  for (const h of homework) {
    const arr = hwByLesson.get(h.lesson_id) ?? [];
    arr.push(h);
    hwByLesson.set(h.lesson_id, arr);
  }

  const { courses } = await getCatalog();
  const course = courses.find((c) => c.id === enrollment.course_id);

  const doneCount = progress.filter((p) => p.status === "completed").length;
  const pct = progress.length ? Math.round((doneCount / progress.length) * 100) : 0;
  const isSaturday = track?.track_type === "SAT";

  return (
    <div data-lang={course?.language_code} data-level={course?.level_code} className="pb-16">
      <section className="themed">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <nav className="mb-4 text-sm opacity-80">
            <Link href="/my">← 내 강의실</Link>
          </nav>
          <p className="text-xs font-semibold opacity-85">
            {course?.language.flag_emoji} {course?.language.name_ko} · {course?.level.name_ko} ·{" "}
            {formatMonth(enrollment.start_month)}
          </p>
          <h1 className="display mt-1 text-3xl font-bold sm:text-4xl">
            {course?.title_ko ?? "진도 체크"}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {course ? (
              <div className="flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 py-1.5 pl-1.5 pr-4">
                <InstructorAvatar
                  url={course.instructor.avatar_url}
                  emoji={course.instructor.avatar_emoji}
                  name={course.instructor.name_ko}
                  size={28}
                />
                <span className="text-sm font-semibold">{course.instructor.name_ko} 강사</span>
              </div>
            ) : null}
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold">
              {track?.label_ko} · {track?.time_label_ko}
            </span>
          </div>

          <div className="mt-7">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-semibold">진도 {pct}%</span>
              <span className="opacity-80">
                {doneCount} / {progress.length}차시
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[var(--on-brand)] transition-all"
                style={{ width: pct + "%" }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="display text-2xl font-bold">차시별 진도 · 숙제</h2>
          <p className="text-sm text-[var(--muted)]">
            {isSaturday
              ? "토요일 전일제는 하루에 3교시를 연속으로 수강합니다."
              : "월·수·금 하루 1시간씩 진행합니다."}
          </p>
        </div>

        <ul className="space-y-3">
          {progress.map((p) => {
            const done = p.status === "completed";
            const items = hwByLesson.get(p.lesson_id) ?? [];
            const hwDone = items.filter((h) => doneSet.has(h.id)).length;

            return (
              <li
                key={p.id}
                className={
                  "card p-5 transition " +
                  (done ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))]" : "")
                }
              >
                <div className="flex flex-wrap items-start gap-4">
                  <form action={toggleSessionComplete} className="shrink-0">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="done" value={done ? "1" : "0"} />
                    <button
                      type="submit"
                      aria-label={done ? "진도 체크 해제" : "진도 완료로 표시"}
                      className={
                        "grid h-9 w-9 place-items-center rounded-lg border-2 text-lg font-bold transition " +
                        (done
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--border)] text-transparent hover:border-[var(--accent)]")
                      }
                    >
                      ✓
                    </button>
                  </form>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="chip">{p.lesson_no}차시</span>
                      {isSaturday ? (
                        <span className="chip">
                          {p.session_no}주차 {p.period_no}교시
                        </span>
                      ) : null}
                      <span className="chip">
                        {formatSessionDate(p.scheduled_at)} {formatSessionTime(p.scheduled_at)}
                      </span>
                      {done ? <span className="chip chip-accent">완료</span> : null}
                    </div>

                    <p className={"mt-2 font-bold " + (done ? "line-through opacity-60" : "")}>
                      {p.lesson.title_ko}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{p.lesson.objective_ko}</p>

                    {items.length > 0 ? (
                      <details className="group mt-3">
                        <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--accent)]">
                          숙제 {hwDone}/{items.length} 완료 · 펼쳐보기
                        </summary>
                        <ul className="mt-2.5 space-y-2">
                          {items.map((h) => {
                            const hDone = doneSet.has(h.id);
                            return (
                              <li key={h.id} className="flex items-start gap-3 rounded-lg bg-[var(--surface-2)] p-3">
                                <form action={toggleHomework} className="shrink-0">
                                  <input type="hidden" name="enrollment_id" value={enrollmentId} />
                                  <input type="hidden" name="homework_id" value={h.id} />
                                  <input type="hidden" name="lesson_id" value={h.lesson_id} />
                                  <input type="hidden" name="done" value={hDone ? "1" : "0"} />
                                  <button
                                    type="submit"
                                    aria-label={hDone ? "숙제 완료 해제" : "숙제 완료로 표시"}
                                    className={
                                      "grid h-6 w-6 place-items-center rounded border-2 text-xs font-bold transition " +
                                      (hDone
                                        ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]"
                                        : "border-[var(--border)] bg-[var(--surface)] text-transparent hover:border-[var(--brand)]")
                                    }
                                  >
                                    ✓
                                  </button>
                                </form>
                                <div className="min-w-0">
                                  <p className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className={h.is_required ? "chip chip-accent" : "chip"}>
                                      {h.is_required ? "필수" : "심화"}
                                    </span>
                                    <span className={"font-semibold " + (hDone ? "line-through opacity-60" : "")}>
                                      {h.title_ko}
                                    </span>
                                    <span className="text-xs text-[var(--muted)]">
                                      약 {h.est_minutes}분
                                    </span>
                                  </p>
                                  <p className="mt-1 text-sm text-[var(--muted)]">
                                    {h.description_ko}
                                  </p>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
