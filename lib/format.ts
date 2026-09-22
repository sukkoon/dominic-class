export const KST = "Asia/Seoul";

export function formatKrw(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

/** Vercel 함수는 UTC로 돌기 때문에 항상 시간대를 명시한다. */
export function formatSessionDate(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(iso));
}

export function formatSessionTime(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatMonth(dateOnly: string): string {
  const [y, m] = dateOnly.split("-");
  return `${y}년 ${Number(m)}월`;
}

/** 다음 달 1일 (Asia/Seoul 기준) — 수강 시작월 기본값 */
export function nextMonthStart(now = new Date()): string {
  const kst = new Date(now.toLocaleString("en-US", { timeZone: KST }));
  const y = kst.getFullYear();
  const m = kst.getMonth() + 1; // 0-index → 다음 달
  const year = m > 11 ? y + 1 : y;
  const month = m > 11 ? 0 : m;
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}
