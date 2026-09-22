import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatKrw, formatMonth } from "@/lib/format";
import type { Course, ScheduleTrack } from "@/lib/types";
import TossWidget from "./_components/toss-widget";

export const metadata: Metadata = { title: "결제" };

type CartRowJoined = {
  id: string;
  start_month: string;
  course_id: string;
  track_id: string;
  course: Course;
  track: ScheduleTrack;
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fcheckout");

  const { data } = await supabase
    .from("dc_cart_items")
    .select("id, start_month, course_id, track_id, course:dc_courses(*), track:dc_schedule_tracks(*)")
    .eq("user_id", user.id)
    .order("created_at");

  const items = (data ?? []) as unknown as CartRowJoined[];
  if (items.length === 0) redirect("/cart");

  const total = items.reduce((s, i) => s + i.course.price_krw, 0);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        <h1 className="display text-3xl font-bold">결제</h1>
        <p className="prose-muted mt-2 text-sm">
          아래에서 결제 수단을 선택한 뒤 결제하기를 눌러주세요.
        </p>

        <div className="card mt-6 p-2 sm:p-4">
          <TossWidget
            amount={total}
            customerKey={user.id}
            customerEmail={user.email ?? ""}
            customerName={String(user.user_metadata?.full_name ?? "수강생")}
          />
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <h2 className="font-bold">주문 내역</h2>
          <ul className="mt-4 space-y-4">
            {items.map((i) => (
              <li key={i.id} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                <p className="text-sm font-semibold">{i.course.title_ko}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {i.track.label_ko} · {i.track.time_label_ko}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {formatMonth(i.start_month)} 시작 · 월 12차시
                </p>
                <p className="mt-1.5 text-sm font-bold">{formatKrw(i.course.price_krw)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-5">
            <span className="text-sm text-[var(--muted)]">총 결제 금액</span>
            <span className="text-2xl font-bold">{formatKrw(total)}</span>
          </div>

          <Link href="/cart" className="btn btn-ghost mt-4 w-full !text-sm">
            장바구니로 돌아가기
          </Link>
        </div>
      </aside>
    </div>
  );
}
