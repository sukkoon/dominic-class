// Dominic Class 도메인 타입 (Supabase public 스키마의 dc_* 테이블)

export type LanguageCode = "en" | "ja" | "es" | "zh";
export type LevelCode = "beginner" | "intermediate" | "advanced";
export type ClassTypeCode = "grammar" | "conversation" | "exam";
export type TrackType = "MWF" | "SAT";
export type OrderStatus = "pending" | "paid" | "failed" | "canceled" | "refunded";
export type EnrollmentStatus = "active" | "completed" | "canceled";
export type ProgressStatus = "scheduled" | "completed" | "absent" | "postponed";

export type Language = {
  code: LanguageCode;
  name_ko: string;
  name_native: string;
  flag_emoji: string;
  flag_emoji_alt: string | null;
  country_code: string;
  country_name_ko: string;
  theme_key: string;
  theme_mood_ko: string;
  hero_color: string;
  accent_color: string;
  ink_color: string;
  pattern_key: string;
  font_key: string;
  tagline_ko: string;
  sort_order: number;
};

export type Level = {
  code: LevelCode;
  name_ko: string;
  price_krw: number;
  instructor_rule_ko: string;
  summary_ko: string;
  badge_emoji: string;
  sort_order: number;
};

export type ClassType = {
  code: ClassTypeCode;
  name_ko: string;
  tagline_ko: string;
  summary_ko: string;
  icon_emoji: string;
  sort_order: number;
};

export type Instructor = {
  id: string;
  language_code: LanguageCode;
  level_code: LevelCode;
  /** 강사는 (언어 × 레벨 × 유형)마다 전담이다 — 총 36명 */
  class_type_code: ClassTypeCode;
  name_ko: string;
  name_native: string | null;
  nationality: string;
  nationality_ko: string;
  is_native: boolean;
  speaks_korean: boolean;
  avatar_url: string | null;
  avatar_emoji: string;
  headline_ko: string;
  bio_ko: string;
  /** 최종 학력 */
  education_ko: string;
  /** 주요 강의 경력 3줄 */
  career_ko: string[];
  years_experience: number;
};

export type ScheduleTrack = {
  id: string;
  course_id: string;
  track_type: TrackType;
  label_ko: string;
  days_label_ko: string;
  time_label_ko: string;
  start_time: string;
  end_time: string;
  hours_per_day: number;
  periods_per_day: number;
  days_per_month: number;
  lessons_per_month: number;
  capacity: number;
};

export type Course = {
  id: string;
  slug: string;
  language_code: LanguageCode;
  level_code: LevelCode;
  class_type_code: ClassTypeCode;
  instructor_id: string;
  title_ko: string;
  subtitle_ko: string;
  description_ko: string;
  price_krw: number;
  total_lessons: number;
  highlights: string[];
  /** 한 달 뒤 도달하려는 한 줄 목표 */
  goal_ko: string;
  /** 수료 후 할 수 있게 되는 것 3가지 */
  outcomes: string[];
  /** 중점적으로 다루는 주제 4가지 */
  focus_ko: string[];
  sort_order: number;
};

export type Lesson = {
  id: string;
  course_id: string;
  lesson_no: number;
  title_ko: string;
  objective_ko: string;
  content_ko: string;
  keywords: string[];
};

export type LessonHomework = {
  id: string;
  lesson_id: string;
  seq: number;
  title_ko: string;
  description_ko: string;
  est_minutes: number;
  is_required: boolean;
};

/** 카탈로그 조인 결과: 강의 + 언어/레벨/유형/강사/트랙 */
export type CourseFull = Course & {
  language: Language;
  level: Level;
  class_type: ClassType;
  instructor: Instructor;
  tracks: ScheduleTrack[];
};

export type CartRow = {
  id: string;
  course_id: string;
  track_id: string;
  start_month: string;
  course: Pick<Course, "id" | "slug" | "title_ko" | "price_krw" | "language_code" | "level_code" | "class_type_code">;
  track: Pick<ScheduleTrack, "id" | "track_type" | "label_ko" | "time_label_ko">;
};
