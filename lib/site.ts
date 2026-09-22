export { siteUrl } from "@/lib/env";

/** 수강 시작월 후보: 다음 달부터 3개월 (모두 해당 월 1일) */
export function startMonthOptions(now = new Date()): string[] {
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const out: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(kst.getFullYear(), kst.getMonth() + i, 1);
    out.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-01");
  }
  return out;
}
