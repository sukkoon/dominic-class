import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/queries";
import { formatMonth, formatSessionDate, formatSessionTime } from "@/lib/format";
import InstructorAvatar from "@/components/instructor-avatar";
import type { EnrollmentStatus, ScheduleTrack } from "@/lib/types";

export const metadata: Metadata = { title: "내 강의실" };

type EnrollmentRow = {
  id: string;
  course_id: string;
  track_id: string;
  status: EnrollmentStatus;
  start_month: string;
  total_lessons: number;
  completed_lessons: number;
  track: ScheduleTrack;
};

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="display text-3xl font-bold">내 강의실</h1>
        <p className="prose-muted mt-3">로그인하면 수강 중인 강의와 진도를 볼 수 있습니다.</p>
        <Link href="/login?next=%2Fmy" className="btn btn-primary mt-6">
          로그인하기
        </Link>
      </div>
    );
  }

  const { data: enrollData } = await supabase
    .from("dc_enrollments")
    .select("id, course_id, track_id, status, start_month, total_lessons, completed_lessons, track:dc_schedule_tracks(*)")
    .eq("user_id", user.id)
    .order("start_month", { ascending: false });

  const enrollments = (enrollData ?? []) as unknown as EnrollmentRow[];
  const enrollmentIds = enrollments.map((e) => e.id);

  // 다음 수업 + 숙제 진행률
  const { data: progressData } = enrollmentIds.length
    ? await supabase
        .from("dc_enrollment_progress")
        .select("enrollment_id, lesson_no, scheduled_at, status, period_no")
        .in("enrollment_id", enrollmentIds)
        .order("scheduled_at")
    : { data: [] };

  const { data: doneData } = enrollmentIds.length
    ? await supabase
        .from("dc_homework_completions")
        .select("enrollment_id")
        .in("enrollment_id", enrollmentIds)
    : { data: [] };

  const homeworkDone = new Map<string, number>();
  for (const d of (doneData ?? []) as { enrollment_id: string }[]) {
    homeworkDone.set(d.enrollment_id, (homeworkDone.get(d.enrollment_id) ?? 0) + 1);
  }

  const nextSession = new Map<string, { scheduled_at: string; lesson_no: number }>();
  for (const p of (progressData ?? []) as {
    enrollment_id: string;
    lesson_no: number;
    scheduled_at: string;
    status: string;
  }[]) {
    if (p.status !== "scheduled") continue;
    if (!nextSession.has(p.enrollment_id)) {
      nextSession.set(p.enrollment_id, { scheduled_at: p.scheduled_at, lesson_no: p.lesson_no });
    }
  }

  const { courses } = await getCatalog();
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const totalDone = enrollments.reduce((s, e) => s + e.completed_lessons, 0);
  const totalLessons = enrollments.reduce((s, e) => s + e.total_lessons, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl font-bold sm:text-4xl">내 강의실</h1>
          <p className="prose-muted mt-2">
            {String(user.user_metadata?.full_name ?? user.email)} 님, 오늘도 한 걸음.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/my/homework" className="btn btn-ghost !text-sm">
            숙제 확인
          </Link>
          <Link href="/my/orders" className="btn btn-ghost !text-sm">
            주문 내역
          </Link>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <p className="text-[var(--muted)]">아직 수강 중인 강의가 없습니다.</p>
          <Link href="/courses" className="btn btn-primary mt-5">
            강의 둘러보기
          </Link>
        </div>
      ) : (
        <>
          <div className="card mt-8 grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
            <div>
              <p className="text-xs text-[var(--muted)]">수강 강의</p>
              <p className="mt-1 text-2xl font-bold">{enrollments.length}개</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">전체 진도</p>
              <p className="mt-1 text-2xl font-bold">
                {totalDone}
                <span className="text-sm font-normal text-[var(--muted)]"> / {totalLessons}차시</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">완료율</p>
              <p className="mt-1 text-2xl font-bold">
                {totalLessons ? Math.round((totalDone / totalLessons) * 100) : 0}%
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">완료한 숙제</p>
              <p className="mt-1 text-2xl font-bold">
                {[...homeworkDone.values()].reduce((a, b) => a + b, 0)}개
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-5">
            {enrollments.map((e) => {
              const course = courseMap.get(e.course_id);
              const pct = e.total_lessons
                ? Math.round((e.completed_lessons / e.total_lessons) * 100)
                : 0;
              const next = nextSession.get(e.id);
              const hwTotal = e.total_lessons * 2;
              const hwDone = homeworkDone.get(e.id) ?? 0;

              return (
                <li
                  key={e.id}
                  data-lang={course?.language_code}
                  className="card overflow-hidden"
                >
                  <div className="themed flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold opacity-85">
                        {course?.language.flag_emoji} {course?.language.name_ko} ·{" "}
                        {course?.level.name_ko} · {formatMonth(e.start_month)}
                      </p>
                      <p className="display truncate text-xl font-bold">
                        {course?.title_ko ?? "강의"}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold">
                      {e.status === "completed" ? "수강 완료" : "수강 중"}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {course ? (
                          <InstructorAvatar
                            url={course.instructor.avatar_url}
                            emoji={course.instructor.avatar_emoji}
                            name={course.instructor.name_ko}
                            size={40}
                          />
                        ) : null}
                        <div className="text-sm">
                          <p className="font-semibold">{course?.instructor.name_ko}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {e.track.label_ko} · {e.track.time_label_ko}
                          </p>
                        </div>
                      </div>

                      {next ? (
                        <div className="rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-sm">
                          <p className="text-xs text-[var(--muted)]">다음 수업</p>
                          <p className="mt-0.5 font-semibold">
                            {formatSessionDate(next.scheduled_at)}{" "}
                            {formatSessionTime(next.scheduled_at)} · {next.lesson_no}차시
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-sm font-semibold">
                          모든 차시를 완료했습니다 🎉
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-semibold">진도</span>
                        <span className="text-[var(--muted)]">
                          {e.completed_lessons} / {e.total_lessons}차시 ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-all"
                          style={{ width: pct + "%" }}
                        />
                      </div>

                      <div className="mb-1.5 mt-4 flex items-center justify-between text-sm">
                        <span className="font-semibold">숙제</span>
                        <span className="text-[var(--muted)]">
                          {hwDone} / {hwTotal}개
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                        <div
                          className="h-full rounded-full bg-[var(--brand)] transition-all"
                          style={{ width: (hwTotal ? (hwDone / hwTotal) * 100 : 0) + "%" }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href={"/my/courses/" + e.id} className="btn btn-primary !text-sm">
                        진도 체크하기
                      </Link>
                      <Link href="/my/homework" className="btn btn-ghost !text-sm">
                        숙제 보기
                      </Link>
                      {course ? (
                        <Link href={"/courses/" + course.slug} className="btn btn-ghost !text-sm">
                          강의 정보
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
