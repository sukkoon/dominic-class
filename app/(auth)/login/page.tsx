import Link from "next/link";
import type { Metadata } from "next";
import { signIn } from "@/app/actions/auth";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; next?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="display text-3xl font-bold">로그인</h1>
      <p className="prose-muted mt-2 text-sm">
        수강 신청과 진도·숙제 확인은 로그인 후 이용할 수 있습니다.
      </p>

      {sp.notice ? (
        <p className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
          {sp.notice}
        </p>
      ) : null}
      {sp.error ? (
        <p className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {sp.error}
        </p>
      ) : null}

      <form action={signIn} className="card mt-6 space-y-4 p-6">
        <input type="hidden" name="next" value={sp.next ?? "/my"} />
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
            이메일
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          로그인
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-semibold text-[var(--fg)] underline underline-offset-2">
          회원가입
        </Link>
      </p>
    </div>
  );
}
