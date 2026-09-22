import Link from "next/link";
import type { CourseReview } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { deleteReview, submitReview } from "@/app/actions/social";
import StarRating from "./star-rating";

/**
 * 강의 평가 게시판.
 * 누구나 읽을 수 있고, 로그인한 사람은 강의당 하나씩 쓰고 고칠 수 있다.
 */
export default function ReviewSection({
  courseId,
  slug,
  reviews,
  currentUserId,
  avg,
}: {
  courseId: string;
  slug: string;
  reviews: CourseReview[];
  currentUserId: string | null;
  avg: number;
}) {
  const mine = currentUserId ? reviews.find((r) => r.user_id === currentUserId) : undefined;

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section id="reviews" className="card mt-6 overflow-hidden scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] p-6">
        <div>
          <h2 className="display text-xl">강의 평가</h2>
          <p className="prose-muted mt-1 text-sm">
            이 강의를 들은 분들이 남긴 후기 {reviews.length}개
          </p>
        </div>
        <div className="text-right">
          <StarRating value={avg} size="md" showValue />
          <p className="mt-1 text-xs text-[var(--muted)]">5점 만점</p>
        </div>
      </div>

      {reviews.length > 0 ? (
        <dl className="grid gap-1.5 border-b border-[var(--border)] p-6">
          {dist.map((d) => (
            <div key={d.star} className="flex items-center gap-2.5 text-xs">
              <dt className="w-8 shrink-0 font-bold text-[var(--muted)]">{d.star}점</dt>
              <dd className="flex flex-1 items-center gap-2.5">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <span
                    className="block h-full rounded-full bg-[var(--accent)]"
                    style={{ width: (reviews.length ? (d.count / reviews.length) * 100 : 0) + "%" }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right text-[var(--muted)]">{d.count}</span>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {/* 작성 폼 */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)] p-6">
        {currentUserId ? (
          <form action={submitReview} className="space-y-3">
            <input type="hidden" name="course_id" value={courseId} />
            <input type="hidden" name="slug" value={slug} />

            <p className="text-sm font-bold">
              {mine ? "내 후기 수정하기" : "이 강의는 어떠셨나요?"}
            </p>

            <div className="flex flex-wrap gap-3">
              <label className="flex-none">
                <span className="mb-1.5 block text-xs font-bold text-[var(--muted)]">별점</span>
                <select name="rating" defaultValue={String(mine?.rating ?? 5)} className="!w-auto">
                  <option value="5">★★★★★ 5점</option>
                  <option value="4">★★★★☆ 4점</option>
                  <option value="3">★★★☆☆ 3점</option>
                  <option value="2">★★☆☆☆ 2점</option>
                  <option value="1">★☆☆☆☆ 1점</option>
                </select>
              </label>
              <label className="min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-bold text-[var(--muted)]">제목</span>
                <input
                  type="text"
                  name="title"
                  defaultValue={mine?.title ?? ""}
                  maxLength={60}
                  placeholder="한 줄로 요약해 주세요"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[var(--muted)]">
                후기 (10자 이상)
              </span>
              <textarea
                name="body"
                rows={4}
                required
                minLength={10}
                maxLength={1000}
                defaultValue={mine?.body ?? ""}
                placeholder="수업 방식, 숙제 양, 강사님 스타일 등 다음 수강생에게 도움이 될 이야기를 남겨 주세요."
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn btn-primary !text-sm">
                {mine ? "후기 수정" : "후기 등록"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm">
            <Link
              href={"/login?next=" + encodeURIComponent("/courses/" + slug)}
              className="font-bold underline underline-offset-2"
            >
              로그인
            </Link>
            하면 이 강의의 평가를 남길 수 있습니다.
          </p>
        )}
      </div>

      {/* 목록 */}
      {reviews.length === 0 ? (
        <p className="p-10 text-center text-sm text-[var(--muted)]">
          아직 등록된 평가가 없습니다. 첫 후기를 남겨 주세요.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {reviews.map((r) => (
            <li key={r.id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StarRating value={r.rating} />
                  <span className="text-sm font-bold">{r.title}</span>
                </div>
                <span className="text-xs text-[var(--muted)]">{formatDateTime(r.created_at)}</span>
              </div>

              <p className="prose-muted mt-2 text-sm">{r.body}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="chip">{r.author_name}</span>
                {r.user_id && r.user_id === currentUserId ? (
                  <>
                    <span className="chip chip-accent">내 후기</span>
                    <form action={deleteReview}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button
                        type="submit"
                        className="text-xs text-[var(--muted)] underline underline-offset-2"
                      >
                        삭제
                      </button>
                    </form>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
