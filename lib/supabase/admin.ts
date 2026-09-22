import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * service_role 키를 쓰는 관리자 클라이언트 — RLS를 우회한다.
 * 라우트 핸들러/서버 액션에서만 import 할 것. 클라이언트 번들에 절대 포함되면 안 된다.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다. .env.local 또는 Vercel 환경변수에 추가하세요.",
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
