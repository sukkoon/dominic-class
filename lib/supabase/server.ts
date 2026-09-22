import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * 쿠키에 묶인 서버 클라이언트. RLS가 그대로 적용되므로
 * 본인 데이터 조회(장바구니/수강/진도/숙제)는 반드시 이걸 쓴다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트 렌더 중에는 쿠키가 읽기 전용이다.
            // 세션 갱신은 미들웨어가 담당하므로 무시해도 안전하다.
          }
        },
      },
    },
  );
}

export async function getSessionUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
