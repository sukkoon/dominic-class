import type { Lesson, LessonHomework } from "@/lib/types";

export default function CurriculumList({
  lessons,
}: {
  lessons: (Lesson & { homework: LessonHomework[] })[];
}) {
  return (
    <ol className="divide-y divide-[var(--border)]">
      {lessons.map((l) => (
        <li key={l.id} className="py-4">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-xs font-bold">
                {l.lesson_no}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{l.title_ko}</p>
                <p className="mt-0.5 text-sm text-[var(--muted)]">{l.objective_ko}</p>
              </div>
              <span className="mt-1 shrink-0 text-xs text-[var(--muted)] group-open:hidden">
                펼치기
              </span>
              <span className="mt-1 hidden shrink-0 text-xs text-[var(--muted)] group-open:inline">
                접기
              </span>
            </summary>

            <div className="mt-3 space-y-3 pl-10">
              <p className="rounded-lg bg-[var(--surface-2)] p-3 text-sm leading-relaxed">
                {l.content_ko}
              </p>
              {l.homework.length > 0 ? (
                <div>
                  <p className="mb-1.5 text-xs font-bold text-[var(--muted)]">강사가 내주는 숙제</p>
                  <ul className="space-y-1.5">
                    {l.homework.map((h) => (
                      <li key={h.id} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className={h.is_required ? "chip chip-accent" : "chip"}>
                          {h.is_required ? "필수" : "심화"}
                        </span>
                        <span className="font-medium">{h.title_ko}</span>
                        <span className="text-xs text-[var(--muted)]">약 {h.est_minutes}분</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
