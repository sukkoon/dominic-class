import { createClient } from "@supabase/supabase-js";
import type {
  ClassType,
  ClassTypeCode,
  Course,
  CourseFull,
  CourseReview,
  CourseSample,
  Instructor,
  Language,
  LanguageCode,
  Lesson,
  LessonHomework,
  Level,
  LevelCode,
  ScheduleTrack,
} from "@/lib/types";

/** 카탈로그는 공개 데이터이므로 쿠키 없는 anon 클라이언트로 읽는다. */
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export type Catalog = {
  languages: Language[];
  levels: Level[];
  classTypes: ClassType[];
  instructors: Instructor[];
  courses: CourseFull[];
};

/**
 * 룩업 테이블이 모두 작아서(4/3/3/12/36/72행) 한 번에 읽고 JS에서 조인한다.
 * dc_courses가 dc_instructors와 복합 FK로도 연결돼 있어 PostgREST 임베드가
 * 모호해질 수 있는 문제도 함께 피한다.
 */
export async function getCatalog(): Promise<Catalog> {
  const [langRes, levelRes, typeRes, insRes, courseRes, trackRes] = await Promise.all([
    sb.from("dc_languages").select("*").order("sort_order"),
    sb.from("dc_levels").select("*").order("sort_order"),
    sb.from("dc_class_types").select("*").order("sort_order"),
    sb.from("dc_instructors").select("*"),
    sb.from("dc_courses").select("*").eq("is_active", true).order("sort_order"),
    sb.from("dc_schedule_tracks").select("*").eq("is_active", true),
  ]);

  const languages = (langRes.data ?? []) as Language[];
  const levels = (levelRes.data ?? []) as Level[];
  const classTypes = (typeRes.data ?? []) as ClassType[];
  const instructors = (insRes.data ?? []) as Instructor[];
  const rawCourses = (courseRes.data ?? []) as Course[];
  const tracks = (trackRes.data ?? []) as ScheduleTrack[];

  const langMap = new Map(languages.map((l) => [l.code, l]));
  const levelMap = new Map(levels.map((l) => [l.code, l]));
  const typeMap = new Map(classTypes.map((t) => [t.code, t]));
  const insMap = new Map(instructors.map((i) => [i.id, i]));
  const trackMap = new Map<string, ScheduleTrack[]>();
  for (const t of tracks) {
    const arr = trackMap.get(t.course_id) ?? [];
    arr.push(t);
    trackMap.set(t.course_id, arr);
  }

  const courses: CourseFull[] = rawCourses
    .map((c) => ({
      ...c,
      language: langMap.get(c.language_code)!,
      level: levelMap.get(c.level_code)!,
      class_type: typeMap.get(c.class_type_code)!,
      instructor: insMap.get(c.instructor_id)!,
      tracks: (trackMap.get(c.id) ?? []).sort((a, b) => (a.track_type === "MWF" ? -1 : 1)),
    }))
    .filter((c) => c.language && c.level && c.class_type && c.instructor)
    .sort(
      (a, b) =>
        a.language.sort_order - b.language.sort_order ||
        a.level.sort_order - b.level.sort_order ||
        a.class_type.sort_order - b.class_type.sort_order,
    );

  return { languages, levels, classTypes, instructors, courses };
}

export type CourseDetail = {
  course: CourseFull;
  lessons: (Lesson & { homework: LessonHomework[] })[];
  sample: CourseSample | null;
  reviews: CourseReview[];
};

/** 한 강의의 평가 목록 (최신순) */
export async function getCourseReviews(courseId: string): Promise<CourseReview[]> {
  const { data } = await sb
    .from("dc_course_reviews")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });
  return (data ?? []) as CourseReview[];
}

/** 전체 평가 게시판용. 최신순으로 한 번에 가져온다 */
export async function listAllReviews(limit = 200): Promise<CourseReview[]> {
  const { data } = await sb
    .from("dc_course_reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as CourseReview[];
}

export async function getCourseDetail(slug: string): Promise<CourseDetail | null> {
  const catalog = await getCatalog();
  const course = catalog.courses.find((c) => c.slug === slug);
  if (!course) return null;

  const { data: lessonRows } = await sb
    .from("dc_lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("lesson_no");
  const lessons = (lessonRows ?? []) as Lesson[];

  const { data: hwRows } = await sb
    .from("dc_lesson_homework")
    .select("*")
    .in("lesson_id", lessons.map((l) => l.id))
    .order("seq");
  const homework = (hwRows ?? []) as LessonHomework[];

  const byLesson = new Map<string, LessonHomework[]>();
  for (const h of homework) {
    const arr = byLesson.get(h.lesson_id) ?? [];
    arr.push(h);
    byLesson.set(h.lesson_id, arr);
  }

  const [{ data: sampleRow }, reviews] = await Promise.all([
    sb.from("dc_course_samples").select("*").eq("course_id", course.id).maybeSingle(),
    getCourseReviews(course.id),
  ]);

  return {
    course,
    lessons: lessons.map((l) => ({ ...l, homework: byLesson.get(l.id) ?? [] })),
    sample: (sampleRow as CourseSample | null) ?? null,
    reviews,
  };
}

export type CourseFilter = {
  language?: LanguageCode;
  level?: LevelCode;
  type?: ClassTypeCode;
};

export function filterCourses(courses: CourseFull[], f: CourseFilter): CourseFull[] {
  return courses.filter(
    (c) =>
      (!f.language || c.language_code === f.language) &&
      (!f.level || c.level_code === f.level) &&
      (!f.type || c.class_type_code === f.type),
  );
}
