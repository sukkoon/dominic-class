import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/queries";
import { formatSessionDate } from "@/lib/format";
import { toggleHomework } from "@/app/actions/homework";
import type { Lesson, LessonHomework } from "@/lib/types";

export const metadata: Metadata = { title: "숙제" };

type Task = {
  homework: LessonHomework;
  lesson: Lesson;
  enrollmentId: string;
  courseTitle: string;
  languageCode: string;
  flag: string;
  instructor: string;
  scheduledAt: string | null;
  done: boolean;
};

export default async function HomeworkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="display text-3xl font-bold">숙제</h1>
        <p className="prose-muted mt-3">로그인하면 강사가 내준 숙제를 확인할 수 있습니다.</p>
        <Link href="/login?next=%2Fmy%2Fhomework" className="btn btn-primary mt-6">
          로그인하기
        </Link>
      </div>
    );
  }

  const { data: enrollData } = await supabase
    .from("dc_enrollments")
    .select("id, course_id, start_month")
    .eq("user_id", user.id);
  const enrollments = (enrollData ?? []) as { id: string; course_id: string; start_month: string }[];

  if (enrollments.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="display text-3xl font-bold">숙제</h1>
        <p className="prose-muted mt-3">수강 중인 강의가 없어 표시할 숙제가 없습니다.</p>
        <Link href="/courses" className="btn btn-primary mt-6">
          강의 둘러보기
        </Link>
      </div>
    );
  }

  const courseIds = [...new Set(enrollments.map((e) => e.course_id))];
  const enrollmentIds = enrollments.map((e) => e.id);

  const { data: lessonData } = await supabase
    .from("dc_lessons")
    .select("*")
    .in("course_id", courseIds)
    .order("lesson_no");
  const lessons = (lessonData ?? []) as Lesson[];

  const { data: hwData } = await supabase
    .from("dc_lesson_homework")
    .select("*")
    .in("lesson_id", lessons.length ? lessons.map((l) => l.id) : [""])
    .order("seq");
  const homework = (hwData ?? []) as LessonHomework[];

  const { data: doneData } = await supabase
    .from("dc_homework_completions")
    .select("enrollment_id, homework_id")
    .in("enrollment_id", enrollmentIds);
  const doneSet = new Set(
    ((doneData ?? []) as { enrollment_id: string; homework_id: string }[]).map(
      (d) => d.enrollment_id + ":" + d.homework_id,
    ),
  );

  const { data: progressData } = await supabase
    .from("dc_enrollment_progress")
    .select("enrollment_id, lesson_id, scheduled_at")
    .in("enrollment_id", enrollmentIds);
  const schedule = new Map(
    ((progressData ?? []) as { enrollment_id: string; lesson_id: string; scheduled_at: string }[]).map(
      (p) => [p.enrollment_id + ":" + p.lesson_id, p.scheduled_at],
    ),
  );

  const { courses } = await getCatalog();
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const lessonsByCourse = new Map<string, Lesson[]>();
  for (const l of lessons) {
    const arr = lessonsByCourse.get(l.course_id) ?? [];
    arr.push(l);
    lessonsByCourse.set(l.course_id, arr);
  }
  const hwByLesson = new Map<string, LessonHomework[]>();
  for (const h of homework) {
    const arr = hwByLesson.get(h.lesson_id) ?? [];
    arr.push(h);
    hwByLesson.set(h.lesson_id, arr);
  }

  const tasks: Task[] = [];
  for (const e of enrollments) {
    const course = courseMap.get(e.course_id);
    for (const lesson of lessonsByCourse.get(e.course_id) ?? []) {
      for (const h of hwByLesson.get(lesson.id) ?? []) {
        tasks.push({
          homework: h,
          lesson,
          enrollmentId: e.id,
          courseTitle: course?.title_ko ?? "강의",
          languageCode: course?.language_code ?? "en",
          flag: course?.language.flag_emoji ?? "",
          instructor: course?.instructor.name_ko ?? "",
          scheduledAt: schedule.get(e.id + ":" + lesson.id) ?? null,
          done: doneSet.has(e.id + ":" + h.id),
        });
      }
    }
  }

  // 미완료 우선 → 수업일 빠른 순 → 차시 순
  tasks.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const at = a.scheduledAt ?? "";
    const bt = b.scheduledAt ?? "";
    if (at !== bt) return at < bt ? -1 : 1;
    return a.homework.seq - b.homework.seq;
  });

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-4 text-sm text-[var(--muted)]">
        <Link href="/my">← 내 강의실</Link>
      </nav>

      <h1 className="display text-3xl font-bold sm:text-4xl">숙제</h1>
      <p className="prose-muted mt-2">
        강사가 차시마다 내준 숙제입니다. 남은 숙제가 위로 올라옵니다.
      </p>

      <div className="card mt-8 grid grid-cols-3 gap-4 p-6 text-center">
        <div>
          <p className="text-xs text-[var(--muted)]">전체</p>
          <p className="mt-1 text-2xl font-bold">{tasks.length}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--muted)]">완료</p>
          <p className="mt-1 text-2xl font-bold">{tasks.length - remaining}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--muted)]">남음</p>
          <p className="mt-1 text-2xl font-bold text-[var(--accent)]">{remaining}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {tasks.map((t) => (
          <li
            key={t.enrollmentId + t.homework.id}
            data-lang={t.languageCode}
            className={
              "card flex items-start gap-4 p-5 " +
              (t.done ? "opacity-60" : "")
            }
          >
            <form action={toggleHomework} className="shrink-0">
              <input type="hidden" name="enrollment_id" value={t.enrollmentId} />
              <input type="hidden" name="homework_id" value={t.homework.id} />
              <input type="hidden" name="lesson_id" value={t.lesson.id} />
              <input type="hidden" name="done" value={t.done ? "1" : "0"} />
              <button
                type="submit"
                aria-label={t.done ? "완료 해제" : "완료로 표시"}
                className={
                  "grid h-8 w-8 place-items-center rounded-lg border-2 text-base font-bold transition " +
                  (t.done
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] text-transparent hover:border-[var(--accent)]")
                }
              >
                ✓
              </button>
            </form>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">
                  {t.flag} {t.courseTitle}
                </span>
                <span className="chip">{t.lesson.lesson_no}차시</span>
                <span className={t.homework.is_required ? "chip chip-accent" : "chip"}>
                  {t.homework.is_required ? "필수" : "심화"}
                </span>
                {t.scheduledAt ? (
                  <span className="chip">{formatSessionDate(t.scheduledAt)} 수업</span>
                ) : null}
              </div>

              <p className={"mt-2 font-bold " + (t.done ? "line-through" : "")}>
                {t.homework.title_ko}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">{t.homework.description_ko}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {t.instructor} 강사 · 예상 소요 {t.homework.est_minutes}분 · {t.lesson.title_ko}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
