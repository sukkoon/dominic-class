"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * 숙제 완료 토글.
 * 미완료 행은 만들지 않고, 체크할 때만 완료 행을 생성한다(해제하면 삭제).
 */
export async function toggleHomework(formData: FormData) {
  const enrollmentId = String(formData.get("enrollment_id") ?? "");
  const homeworkId = String(formData.get("homework_id") ?? "");
  const lessonId = String(formData.get("lesson_id") ?? "");
  const done = String(formData.get("done") ?? "") === "1";

  const supabase = await createClient();

  if (done) {
    await supabase
      .from("dc_homework_completions")
      .delete()
      .eq("enrollment_id", enrollmentId)
      .eq("homework_id", homeworkId);
  } else {
    await supabase.from("dc_homework_completions").upsert(
      {
        enrollment_id: enrollmentId,
        homework_id: homeworkId,
        lesson_id: lessonId,
        is_done: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "enrollment_id,homework_id" },
    );
  }

  revalidatePath("/my", "layout");
}
