import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatKrw, formatMonth } from "@/lib/format";
import { changeTrack, removeFromCart } from "@/app/actions/cart";
import type { Course, ScheduleTrack } from "@/lib/types";

export const metadata: Metadata = { title: "장바구니" };

type CartRowJoined = {
  id: string;
  start_month: string;
  course_id: string;
  track_id: string;
  course: Course;
  track: ScheduleTrack;
};

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="display text-3xl font-bold">장바구니</h1>
        <p className="prose-muted mt-3">장바구니를 보려면 로그인이 필요합니다.</p>
        <Link href="/login?next=%2Fcart" className="btn btn-primary mt-6">
          로그인하기
        </Link>
      </div>
    );
  }

  const { data } = await supabase
    .from("dc_cart_items")
    .select("id, start_month, course_id, track_id, course:dc_courses(*), track:dc_schedule_tracks(*)")
    .eq("user_id", user.id)
    .order("created_at");

  const items = (data ?? []) as unknown as CartRowJoined[];

  // 모든 강의의 트랙 후보 (트랙 변경용)
  const { data: trackData } = await supabase
    .from("dc_schedule_tracks")
    .select("*")
    .in("course_id", items.map((i) => i.course_id).length ? items.map((i) => i.course_id) : [""]);
  const allTracks = (trackData ?? []) as ScheduleTrack[];

  const total = items.reduce((s, i) => s + (i.course?.price_krw ?? 0), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="display text-3xl font-bold sm:text-4xl">장바구니</h1>
      <p className="prose-muted mt-2">수강료는 월 단위이며, 1개월분을 결제합니다.</p>

      {items.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-[var(--muted)]">장바구니가 비어 있습니다.</p>
          <Link href="/courses" className="btn btn-primary mt-5">
            강의 둘러보기
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-4">
            {items.map((item) => {
              const tracks = allTracks.filter((t) => t.course_id === item.course_id);
              return (
                <li
                  key={item.id}
                  data-lang={item.course.language_code}
                  className="card overflow-hidden"
                >
                  <div className="flex flex-wrap items-start gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={"/courses/" + item.course.slug}
                        className="display text-lg font-bold underline-offset-2 hover:underline"
                      >
                        {item.course.title_ko}
                      </Link>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {formatMonth(item.start_month)} 시작 · 월 12차시
                      </p>

                      <form action={changeTrack} className="mt-3 flex flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={item.id} />
                        <select
                          name="track_id"
                          defaultValue={item.track_id}
                          className="!w-auto !py-1.5 text-sm"
                        >
                          {tracks.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label_ko} · {t.time_label_ko}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="btn btn-ghost !px-3 !py-1.5 !text-xs">
                          일정 변경
                        </button>
                      </form>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <p className="text-lg font-bold">{formatKrw(item.course.price_krw)}</p>
                      <form action={removeFromCart}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="text-xs text-[var(--muted)] underline underline-offset-2"
                        >
                          삭제
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="card mt-8 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">강의 {items.length}개</span>
              <span className="text-2xl font-bold">{formatKrw(total)}</span>
            </div>
            <Link href="/checkout" className="btn btn-primary mt-5 w-full !py-3">
              결제하기
            </Link>
            <p className="mt-3 text-center text-xs text-[var(--muted)]">
              토스페이먼츠 테스트 환경입니다. 실제로 결제되지 않습니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
