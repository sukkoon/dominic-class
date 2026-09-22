"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addToCart(formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  const trackId = String(formData.get("track_id") ?? "");
  const startMonth = String(formData.get("start_month") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=" + encodeURIComponent("/courses/" + slug));
  }

  const { error } = await supabase.from("dc_cart_items").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      track_id: trackId,
      start_month: startMonth,
    },
    { onConflict: "user_id,course_id,start_month" },
  );

  if (error) {
    redirect("/courses/" + slug + "?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect("/cart");
}

export async function removeFromCart(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  await supabase.from("dc_cart_items").delete().eq("id", id);

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function changeTrack(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const trackId = String(formData.get("track_id") ?? "");

  const supabase = await createClient();
  await supabase.from("dc_cart_items").update({ track_id: trackId }).eq("id", id);

  revalidatePath("/cart");
}
