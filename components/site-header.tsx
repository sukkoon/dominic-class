import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/queries";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cartCount = 0;
  if (user) {
    const { count } = await supabase
      .from("dc_cart_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    cartCount = count ?? 0;
  }

  const { languages } = await getCatalog();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-baseline gap-1.5">
          <span className="display text-xl font-bold tracking-tight">DOMINIC</span>
          <span className="text-xl font-bold tracking-tight text-[var(--accent)]">CLASS</span>
        </Link>

        <nav className="ml-3 hidden items-center gap-0.5 lg:flex">
          {languages.map((l) => (
            <Link
              key={l.code}
              href={"/languages/" + l.code}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
            >
              <span className="mr-1">{l.flag_emoji}</span>
              {l.name_ko}
            </Link>
          ))}
          <span className="mx-1.5 h-4 w-px bg-[var(--border)]" />
          <Link
            href="/courses"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--fg)]"
          >
            전체 강의
          </Link>
          <Link
            href="/instructors"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--fg)]"
          >
            강사진
          </Link>
          <Link
            href="/reviews"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--fg)]"
          >
            강의 평가
          </Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/cart"
            className="relative rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-semibold"
          >
            장바구니
            {cartCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {user ? (
            <>
              <Link href="/my" className="btn btn-primary !px-4 !py-1.5 !text-sm">
                내 강의실
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-full px-2 py-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-3 py-1.5 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--fg)] sm:block"
              >
                로그인
              </Link>
              <Link href="/signup" className="btn btn-primary !px-4 !py-1.5 !text-sm">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
