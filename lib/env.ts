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

/** 결제 successUrl / failUrl, 이메일 확인 링크에 쓰는 절대 URL */
export function siteUrl(): string {
  const explicit = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return "https://" + process.env.VERCEL_URL;
  return "http://localhost:3000";
}

/** 공개 Supabase 설정이 갖춰졌는지 */
export function hasSupabaseEnv(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}
