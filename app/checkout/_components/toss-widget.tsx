"use client";

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useRef, useState } from "react";

type TossPaymentsInstance = Awaited<ReturnType<typeof loadTossPayments>>;
type Widgets = ReturnType<TossPaymentsInstance["widgets"]>;

export default function TossWidget({
  amount,
  customerKey,
  customerEmail,
  customerName,
}: {
  amount: number;
  customerKey: string;
  customerEmail: string;
  customerName: string;
}) {
  const [widgets, setWidgets] = useState<Widgets | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey) {
      setError("NEXT_PUBLIC_TOSS_CLIENT_KEY 환경변수가 없습니다.");
      return;
    }

    loadTossPayments(clientKey)
      .then((tossPayments) => {
        if (cancelled) return;
        setWidgets(tossPayments.widgets({ customerKey }));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
    };
  }, [customerKey]);

  useEffect(() => {
    if (!widgets || renderedRef.current) return;
    renderedRef.current = true;

    (async () => {
      // setAmount는 렌더링·결제요청보다 반드시 먼저 호출해야 한다.
      await widgets.setAmount({ currency: "KRW", value: amount });
      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);
      setReady(true);
    })().catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [widgets, amount]);

  async function handlePay() {
    if (!widgets) return;
    setBusy(true);
    setError(null);

    try {
      // 결제 요청 전에 서버가 orderId와 금액을 확정해 저장한다.
      const res = await fetch("/api/checkout/prepare", { method: "POST" });
      const data = (await res.json()) as {
        orderId?: string;
        amount?: number;
        orderName?: string;
        error?: string;
      };

      if (!res.ok || !data.orderId || !data.amount) {
        throw new Error(data.error ?? "주문 생성에 실패했습니다.");
      }

      if (data.amount !== amount) {
        await widgets.setAmount({ currency: "KRW", value: data.amount });
      }

      await widgets.requestPayment({
        orderId: data.orderId,
        orderName: data.orderName ?? "Dominic Class 수강료",
        successUrl: window.location.origin + "/checkout/success",
        failUrl: window.location.origin + "/checkout/fail",
        customerEmail,
        customerName,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <div>
      <div id="payment-method" />
      <div id="agreement" />

      {error ? (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handlePay}
        disabled={!ready || busy}
        className="btn btn-primary mt-6 w-full !py-3.5 !text-base"
      >
        {busy ? "결제창을 여는 중…" : ready ? "결제하기" : "결제 수단을 불러오는 중…"}
      </button>

      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        토스페이먼츠 <strong>테스트 키</strong>로 동작합니다. 실제 금액이 청구되지 않습니다.
      </p>
    </div>
  );
}
