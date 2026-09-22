import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { makeOrderCode } from "@/lib/order-code";
import type { Course, Instructor, ScheduleTrack } from "@/lib/types";

type CartRowJoined = {
  id: string;
  start_month: string;
  course_id: string;
  track_id: string;
  course: Course;
  track: ScheduleTrack;
};

/**
 * 결제 요청 직전에 주문을 확정한다.
 * 금액은 **DB의 dc_courses.price_krw 합계**로만 계산하고 클라이언트 입력은 쓰지 않는다.
 * 이 값이 이후 승인 단계의 위변조 판단 기준이 된다.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: cartData, error: cartError } = await supabase
    .from("dc_cart_items")
    .select("id, start_month, course_id, track_id, course:dc_courses(*), track:dc_schedule_tracks(*)")
    .eq("user_id", user.id)
    .order("created_at");

  if (cartError) {
    return NextResponse.json({ error: cartError.message }, { status: 500 });
  }

  const items = (cartData ?? []) as unknown as CartRowJoined[];
  if (items.length === 0) {
    return NextResponse.json({ error: "장바구니가 비어 있습니다." }, { status: 400 });
  }

  const amount = items.reduce((sum, i) => sum + i.course.price_krw, 0);
  if (amount <= 0) {
    return NextResponse.json({ error: "결제 금액이 올바르지 않습니다." }, { status: 400 });
  }

  const orderName =
    items.length === 1
      ? items[0].course.title_ko
      : items[0].course.title_ko + " 외 " + (items.length - 1) + "건";

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "서버에 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  // 강사명 스냅샷
  const { data: insData } = await admin
    .from("dc_instructors")
    .select("*")
    .in("id", items.map((i) => i.course.instructor_id));
  const insMap = new Map(((insData ?? []) as Instructor[]).map((i) => [i.id, i]));

  const orderCode = makeOrderCode();

  const { data: order, error: orderError } = await admin
    .from("dc_orders")
    .insert({
      order_code: orderCode,
      user_id: user.id,
      status: "pending",
      amount_krw: amount,
      order_name: orderName,
      buyer_name: String(user.user_metadata?.full_name ?? ""),
      buyer_email: user.email ?? "",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "주문 생성에 실패했습니다." },
      { status: 500 },
    );
  }

  const { error: itemError } = await admin.from("dc_order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      course_id: i.course_id,
      track_id: i.track_id,
      course_title_snapshot: i.course.title_ko,
      track_label_snapshot: i.track.label_ko + " · " + i.track.time_label_ko,
      instructor_name_snapshot: insMap.get(i.course.instructor_id)?.name_ko ?? "",
      language_code: i.course.language_code,
      level_code: i.course.level_code,
      unit_price_krw: i.course.price_krw,
      start_month: i.start_month,
    })),
  );

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  return NextResponse.json({
    orderId: orderCode,
    amount,
    orderName,
    customerKey: user.id,
  });
}
