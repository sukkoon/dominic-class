import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatKrw, formatMonth } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "주문 내역" };

type OrderItemRow = {
  id: string;
  order_id: string;
  course_title_snapshot: string;
  track_label_snapshot: string;
  instructor_name_snapshot: string;
  unit_price_krw: number;
  start_month: string;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  failed: "결제 실패",
  canceled: "취소",
  refunded: "환불",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="display text-3xl font-bold">주문 내역</h1>
        <p className="prose-muted mt-3">로그인이 필요합니다.</p>
        <Link href="/login?next=%2Fmy%2Forders" className="btn btn-primary mt-6">
          로그인하기
        </Link>
      </div>
    );
  }

  const { data: orderData } = await supabase
    .from("dc_orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const orders = (orderData ?? []) as {
    id: string;
    order_code: string;
    status: OrderStatus;
    amount_krw: number;
    order_name: string;
    created_at: string;
    paid_at: string | null;
    fail_message: string | null;
  }[];

  const { data: itemData } = orders.length
    ? await supabase
        .from("dc_order_items")
        .select("*")
        .in("order_id", orders.map((o) => o.id))
    : { data: [] };
  const items = (itemData ?? []) as OrderItemRow[];

  const { data: payData } = orders.length
    ? await supabase
        .from("dc_payments")
        .select("order_id, method, approved_at, receipt_url")
        .in("order_id", orders.map((o) => o.id))
    : { data: [] };
  const payments = new Map(
    ((payData ?? []) as {
      order_id: string;
      method: string;
      approved_at: string | null;
      receipt_url: string | null;
    }[]).map((p) => [p.order_id, p]),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-4 text-sm text-[var(--muted)]">
        <Link href="/my">← 내 강의실</Link>
      </nav>

      <h1 className="display text-3xl font-bold sm:text-4xl">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-[var(--muted)]">아직 주문 내역이 없습니다.</p>
          <Link href="/courses" className="btn btn-primary mt-5">
            강의 둘러보기
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-5">
          {orders.map((o) => {
            const pay = payments.get(o.id);
            return (
              <li key={o.id} className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-[var(--muted)]">{o.order_code}</p>
                    <p className="mt-1 font-bold">{o.order_name}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatDateTime(o.created_at)} 주문
                      {pay?.method ? " · " + pay.method : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={
                        o.status === "paid"
                          ? "chip chip-accent"
                          : o.status === "failed"
                            ? "chip"
                            : "chip"
                      }
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                    <p className="mt-2 text-lg font-bold">{formatKrw(o.amount_krw)}</p>
                  </div>
                </div>

                {o.fail_message ? (
                  <p className="mt-3 rounded-lg bg-[var(--surface-2)] p-3 text-sm text-[var(--muted)]">
                    {o.fail_message}
                  </p>
                ) : null}

                <ul className="mt-4 space-y-2.5 border-t border-[var(--border)] pt-4">
                  {items
                    .filter((it) => it.order_id === o.id)
                    .map((it) => (
                      <li key={it.id} className="text-sm">
                        <p className="font-semibold">{it.course_title_snapshot}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {it.track_label_snapshot} · {it.instructor_name_snapshot} 강사 ·{" "}
                          {formatMonth(it.start_month)} 시작 · {formatKrw(it.unit_price_krw)}
                        </p>
                      </li>
                    ))}
                </ul>

                {pay?.receipt_url ? (
                  <a
                    href={pay.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost mt-4 !text-xs"
                  >
                    영수증 보기
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
