import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "결제 실패" };

export default async function CheckoutFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string; orderId?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-5xl">😥</p>
      <h1 className="display mt-5 text-2xl font-bold">결제가 완료되지 않았습니다</h1>
      <p className="prose-muted mt-3 text-sm">
        {sp.message ?? "결제가 취소되었거나 승인되지 않았습니다."}
      </p>

      {sp.code || sp.orderId ? (
        <dl className="card mx-auto mt-8 space-y-2 p-5 text-left text-sm">
          {sp.code ? (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">오류 코드</dt>
              <dd className="font-mono">{sp.code}</dd>
            </div>
          ) : null}
          {sp.orderId ? (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">주문번호</dt>
              <dd className="font-mono">{sp.orderId}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

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
