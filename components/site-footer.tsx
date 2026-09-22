import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[var(--surface-2)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-baseline gap-1.5">
            <span className="display text-lg font-bold">DOMINIC</span>
            <span className="text-lg font-bold text-[var(--accent)]">CLASS</span>
          </div>
          <p className="prose-muted mt-3 max-w-sm text-sm">
            영어 · 일본어 · 스페인어 · 중국어. 초급은 한국인 선생님이, 중급은 한국어와 현지어를 모두
            구사하는 선생님이, 고급은 현지 원어민 강사가 가르칩니다. 시험 클래스는 전 언어 OPIc
            기준입니다.
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold">언어별 클래스</p>
          <ul className="space-y-2 text-[var(--muted)]">
            <li>
              <Link href="/languages/en">🇺🇸 영어</Link>
            </li>
            <li>
              <Link href="/languages/ja">🇯🇵 일본어</Link>
            </li>
            <li>
              <Link href="/languages/es">🇪🇸 스페인어</Link>
            </li>
            <li>
              <Link href="/languages/zh">🇨🇳 중국어</Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold">바로가기</p>
          <ul className="space-y-2 text-[var(--muted)]">
            <li>
              <Link href="/courses">전체 강의</Link>
            </li>
            <li>
              <Link href="/instructors">강사진 소개</Link>
            </li>
            <li>
              <Link href="/my">내 강의실</Link>
            </li>
            <li>
              <Link href="/my/homework">숙제 확인</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-4 py-5 text-center text-xs text-[var(--muted)]">
        © 2026 Dominic Class · 결제는 토스페이먼츠 테스트 환경으로 동작합니다.
      </div>
    </footer>
  );
}
