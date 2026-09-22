import "server-only";

import { createClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/env";

/**
 * service_role 키를 쓰는 관리자 클라이언트 — RLS를 우회한다.
 * 라우트 핸들러/서버 액션에서만 import 할 것. 클라이언트 번들에 절대 포함되면 안 된다.
 */
export function createAdminClient() {
  const key = supabaseServiceRoleKey();
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다. Vercel Settings → Environment Variables 에 추가하세요.",
    );
  }
  return createClient(supabaseUrl()!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
