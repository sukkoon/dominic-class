"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * 진도 체크 토글. dc_enrollment_progress에 걸린 트리거가
 * dc_enrollments.completed_lessons를 자동으로 갱신한다.
 */
export async function toggleSessionComplete(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const done = String(formData.get("done") ?? "") === "1";

  const supabase = await createClient();
  await supabase
    .from("dc_enrollment_progress")
    .update({
      status: done ? "scheduled" : "completed",
      completed_at: done ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/my", "layout");
}
