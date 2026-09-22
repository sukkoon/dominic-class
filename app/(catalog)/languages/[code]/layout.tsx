/**
 * 언어별 페이지 전체에 data-lang을 걸어 globals.css의 테마 변수를 스위칭한다.
 * (브랜드/액센트 컬러, 배경 패턴, 디스플레이 폰트가 한 번에 바뀐다)
 */
export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <div data-lang={code}>{children}</div>;
}
