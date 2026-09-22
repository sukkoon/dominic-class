import "server-only";

export { siteUrl } from "@/lib/site";

const CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

export type TossPayment = {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  method?: string;
  totalAmount: number;
  approvedAt?: string;
  receipt?: { url?: string };
  [key: string]: unknown;
};

export type TossConfirmResult =
  | { ok: true; payment: TossPayment }
  | { ok: false; code: string; message: string; status: number };

/**
 * 토스페이먼츠는 시크릿 키를 사용자 ID로 쓰고 비밀번호는 쓰지 않는다.
 * 비밀번호가 없다는 것을 알리기 위해 키 뒤에 콜론을 붙여 인코딩한다.
 */
function authHeader(): string {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) throw new Error("TOSS_SECRET_KEY 환경변수가 없습니다.");
  return "Basic " + Buffer.from(secret + ":").toString("base64");
}

export async function confirmPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossConfirmResult> {
  const res = await fetch(CONFIRM_URL, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(params),
    cache: "no-store",
  });

  const body = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      code: String(body.code ?? "UNKNOWN_ERROR"),
      message: String(body.message ?? "결제 승인에 실패했습니다."),
    };
  }
  return { ok: true, payment: body as unknown as TossPayment };
}

/** 토스 결제 상태 문자열을 dc_payment_status enum 값으로 맞춘다. */
export function toPaymentStatus(status: string): string {
  const s = status.toUpperCase();
  if (s === "DONE") return "done";
  if (s === "CANCELED" || s === "PARTIAL_CANCELED") return "canceled";
  if (s === "ABORTED") return "aborted";
  if (s === "EXPIRED") return "expired";
  if (s === "IN_PROGRESS" || s === "WAITING_FOR_DEPOSIT") return "in_progress";
  return "ready";
}
