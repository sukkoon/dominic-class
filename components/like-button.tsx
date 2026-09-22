import { toggleCourseLike } from "@/app/actions/social";

/**
 * 강의 추천(좋아요) 버튼.
 * 자바스크립트 없이 동작하도록 서버 액션 폼으로 만들었다.
 */
export default function LikeButton({
  courseId,
  slug,
  liked,
  count,
  size = "md",
}: {
  courseId: string;
  slug: string;
  liked: boolean;
  count: number;
  size?: "sm" | "md";
}) {
  return (
    <form action={toggleCourseLike}>
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="liked" value={liked ? "1" : "0"} />
      <button
        type="submit"
        aria-pressed={liked}
        className={
          "like-btn " +
          (liked ? "is-on " : "") +
          (size === "sm" ? "like-btn--sm" : "")
        }
      >
        <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
        추천 {count}
      </button>
    </form>
  );
}
