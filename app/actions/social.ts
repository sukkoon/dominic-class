"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** 강의 좋아요 토글. dc_courses.like_count 는 트리거가 유지한다. */
export async function toggleCourseLike(formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const liked = String(formData.get("liked") ?? "") === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=" + encodeURIComponent("/courses/" + slug));
  }

  if (liked) {
    await supabase
      .from("dc_course_likes")
      .delete()
      .eq("course_id", courseId)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("dc_course_likes")
      .insert({ course_id: courseId, user_id: user.id });
  }

  revalidatePath("/courses/" + slug);
  revalidatePath("/courses");
  revalidatePath("/");
}

/** 강의 평가 등록·수정. 한 사람이 같은 강의에 하나만 쓸 수 있다. */
export async function submitReview(formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=" + encodeURIComponent("/courses/" + slug));
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect("/courses/" + slug + "?error=" + encodeURIComponent("별점을 1~5 사이로 선택해 주세요."));
  }
  if (body.length < 10) {
    redirect("/courses/" + slug + "?error=" + encodeURIComponent("후기는 10자 이상 적어 주세요."));
  }

  const authorName =
    String(user.user_metadata?.full_name ?? "").trim() ||
    (user.email ? user.email.split("@")[0] : "수강생");

  const { error } = await supabase.from("dc_course_reviews").upsert(
    {
      course_id: courseId,
      user_id: user.id,
      author_name: authorName,
      rating,
      title: title || "수강 후기",
      body,
      is_seed: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "course_id,user_id" },
  );

  if (error) {
    redirect("/courses/" + slug + "?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/courses/" + slug);
  revalidatePath("/reviews");
}

export async function deleteReview(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const supabase = await createClient();
  // RLS가 본인 글만 지우도록 막아 준다.
  await supabase.from("dc_course_reviews").delete().eq("id", id);

  revalidatePath("/courses/" + slug);
  revalidatePath("/reviews");
}
