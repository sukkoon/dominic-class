import Link from "next/link";
import type { Metadata } from "next";
import { signUp } from "@/app/actions/auth";

export const metadata: Metadata = { title: "회원가입" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="display text-3xl font-bold">회원가입</h1>
      <p className="prose-muted mt-2 text-sm">
        이메일과 비밀번호만 있으면 됩니다. 가입 후 바로 수강 신청할 수 있습니다.
      </p>

      {sp.error ? (
        <p className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {sp.error}
        </p>
      ) : null}

      <form action={signUp} className="card mt-6 space-y-4 p-6">
        <div>
          <label htmlFor="full_name" className="mb-1.5 block text-sm font-semibold">
            이름
          </label>
          <input id="full_name" name="full_name" type="text" required autoComplete="name" />
        </div>
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
            minLength={6}
            autoComplete="new-password"
          />
          <p className="mt-1.5 text-xs text-[var(--muted)]">6자 이상 입력해 주세요.</p>
        </div>
        <button type="submit" className="btn btn-primary w-full">
          가입하기
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-semibold text-[var(--fg)] underline underline-offset-2">
          로그인
        </Link>
      </p>
    </div>
  );
}
