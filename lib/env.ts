/**
 * 환경변수 읽기.
 *
 * Vercel에 `NEXT_PUBLIC_` 접두사 없이 등록된 이름(SUPABASE_URL, TOSS_CLIENT_KEY …)을
 * 먼저 보고, 없으면 접두사가 붙은 이름으로 넘어간다. 어느 쪽으로 등록해도 동작한다.
 *
 * 전부 서버(Node·Edge)에서만 읽는다. 브라우저에 값이 필요하면 서버 컴포넌트에서
 * props 로 내려준다 — `NEXT_PUBLIC_` 이 없는 변수는 클라이언트 번들에 들어가지 않기 때문이다.
 *
 * Edge 런타임에서도 정적 프로퍼티 접근이어야 치환되므로 process.env[name] 같은
 * 동적 인덱싱은 쓰지 않는다.
 */

export function supabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function supabaseAnonKey(): string | undefined {
  return process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function supabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function tossClientKey(): string | undefined {
  return process.env.TOSS_CLIENT_KEY ?? process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
}

export function tossSecretKey(): string | undefined {
  return process.env.TOSS_SECRET_KEY;
}

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"];

/** 스킴을 붙이고 끝의 슬래시를 떼어 절대 URL 형태로 맞춘다 */
function normalize(value: string): string {
  const trimmed = value.trim();
  const withScheme =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : "https://" + trimmed;

  let out = withScheme;
  while (out.endsWith("/")) out = out.slice(0, -1);
  return out;
}

function isLocalhost(value: string): boolean {
  try {
    return LOCAL_HOSTS.includes(new URL(value).hostname);
  } catch {
    return false;
  }
}

/**
 * 결제 successUrl / failUrl, 회원가입 확인 메일 링크에 쓰는 절대 URL.
 *
 * SITE_URL 을 명시하면 그 값을 쓰되, **Vercel 위에서 도는데 값이 localhost 면 무시한다.**
 * 로컬용 값을 그대로 대시보드에 올려 두는 일이 흔한데, 그 경우 확인 메일 링크가
 * localhost 로 나가 아무 데도 닿지 못한다.
 *
 * 그다음은 Vercel 이 주는 시스템 변수로 파생한다.
 * - 프로덕션: VERCEL_PROJECT_PRODUCTION_URL — 배포마다 바뀌지 않는 고정 도메인
 * - 프리뷰:   VERCEL_URL — 그 배포 전용 주소
 */
export function siteUrl(): string {
  const explicit = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  const onVercel = Boolean(process.env.VERCEL);

  if (explicit) {
    const url = normalize(explicit);
    if (!onVercel || !isLocalhost(url)) return url;
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (process.env.VERCEL_ENV === "production" && productionUrl) return normalize(productionUrl);
  if (process.env.VERCEL_URL) return normalize(process.env.VERCEL_URL);
  if (productionUrl) return normalize(productionUrl);

  return "http://localhost:3000";
}

/** 공개 Supabase 설정이 갖춰졌는지 */
export function hasSupabaseEnv(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}
