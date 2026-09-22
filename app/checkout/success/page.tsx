import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmPayment, toPaymentStatus } from "@/lib/toss";
import { formatKrw } from "@/lib/format";

export const metadata: Metadata = { title: "결제 완료" };
export const dynamic = "force-dynamic";

function Failed({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-5xl">😥</p>
      <h1 className="display mt-5 text-2xl font-bold">{title}</h1>
      <p className="prose-muted mt-3 text-sm">{message}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/cart" className="btn btn-primary">
          장바구니로 돌아가기
        </Link>
        <Link href="/courses" className="btn btn-ghost">
          강의 둘러보기
        </Link>
      </div>
    </div>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}) {
  const sp = await searchParams;
  const { paymentKey, orderId, amount } = sp;

  if (!paymentKey || !orderId || !amount) {
    return <Failed title="결제 정보를 확인할 수 없습니다" message="필수 결제 파라미터가 없습니다." />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return (
      <Failed
        title="서버 설정이 필요합니다"
        message={e instanceof Error ? e.message : "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다."}
      />
    );
  }

  const { data: order } = await admin
    .from("dc_orders")
    .select("*")
    .eq("order_code", orderId)
    .maybeSingle();

  // 가드 1 — 주문 존재 및 소유자 일치
  if (!order) {
    return <Failed title="주문을 찾을 수 없습니다" message={"주문번호 " + orderId} />;
  }
  if (order.user_id !== user.id) {
    return <Failed title="접근할 수 없는 주문입니다" message="본인의 주문이 아닙니다." />;
  }

  // 가드 2 — 이미 승인된 주문이면 멱등하게 완료 화면만 보여준다 (새로고침 대응)
  const alreadyPaid = order.status === "paid";

  if (!alreadyPaid) {
    // 가드 3 — URL로 넘어온 금액이 서버가 확정한 금액과 다르면 승인하지 않는다
    if (order.amount_krw !== Number(amount)) {
      await admin
        .from("dc_orders")
        .update({
          status: "failed",
          failed_at: new Date().toISOString(),
          fail_code: "AMOUNT_MISMATCH",
          fail_message: "결제 요청 금액이 주문 금액과 일치하지 않습니다.",
        })
        .eq("id", order.id);

      return (
        <Failed
          title="결제 금액이 일치하지 않습니다"
          message={
            "주문 금액 " + formatKrw(order.amount_krw) + " / 요청 금액 " + formatKrw(Number(amount))
          }
        />
      );
    }

    // 승인 요청 — 금액은 반드시 DB 값을 보낸다
    const result = await confirmPayment({
      paymentKey,
      orderId,
      amount: order.amount_krw,
    });

    if (!result.ok) {
      await admin
        .from("dc_orders")
        .update({
          status: "failed",
          failed_at: new Date().toISOString(),
          fail_code: result.code,
          fail_message: result.message,
        })
        .eq("id", order.id);

      return <Failed title="결제 승인에 실패했습니다" message={result.message} />;
    }

    const p = result.payment;

    await admin.from("dc_payments").upsert(
      {
        order_id: order.id,
        provider: "toss",
        payment_key: p.paymentKey,
        method: p.method ?? "",
        status: toPaymentStatus(p.status),
        amount_krw: p.totalAmount,
        approved_at: p.approvedAt ?? new Date().toISOString(),
        receipt_url: p.receipt?.url ?? null,
        raw_response: p as unknown as Record<string, unknown>,
      },
      { onConflict: "payment_key" },
    );

    await admin
      .from("dc_orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", order.id);

    // 수강 + 진도 12행 생성 + 장바구니 비우기 (멱등)
    const { error: rpcError } = await admin.rpc("dc_fulfill_order", { p_order_code: orderId });
    if (rpcError) {
      return (
        <Failed
          title="결제는 되었지만 수강 등록에 실패했습니다"
          message={rpcError.message + " — 고객센터로 문의해 주세요. 주문번호: " + orderId}
        />
      );
    }
  }

  const { data: items } = await admin
    .from("dc_order_items")
    .select("*")
    .eq("order_id", order.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <p className="text-5xl">🎉</p>
        <h1 className="display mt-5 text-3xl font-bold">수강 신청이 완료되었습니다</h1>
        <p className="prose-muted mt-3">
          다음 달 첫 수업일에 맞춰 진도표가 만들어졌습니다. 마이페이지에서 확인해 보세요.
        </p>
      </div>

      <div className="card mt-10 p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">주문번호</dt>
            <dd className="font-mono font-semibold">{order.order_code}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">결제 금액</dt>
            <dd className="text-lg font-bold">{formatKrw(order.amount_krw)}</dd>
          </div>
        </dl>

        <ul className="mt-5 space-y-3 border-t border-[var(--border)] pt-5">
          {(items ?? []).map((it) => (
            <li key={it.id}>
              <p className="text-sm font-semibold">{it.course_title_snapshot}</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {it.track_label_snapshot} · {it.instructor_name_snapshot} 강사
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/my" className="btn btn-primary">
          내 강의실 가기
        </Link>
        <Link href="/my/homework" className="btn btn-ghost">
          숙제 확인하기
        </Link>
      </div>
    </div>
  );
}
