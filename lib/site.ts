/** 프리뷰 배포에서도 절대 URL이 되도록 런타임에 파생한다. */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return "https://" + process.env.VERCEL_URL;
  return "http://localhost:3000";
}

/** 수강 시작월 후보: 다음 달부터 3개월 (모두 해당 월 1일) */
export function startMonthOptions(now = new Date()): string[] {
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const out: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(kst.getFullYear(), kst.getMonth() + i, 1);
    out.push(
      d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-01",
    );
  }
  return out;
}
