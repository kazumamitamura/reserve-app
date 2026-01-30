"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SlotCreateState = { error?: string; success?: boolean } | null;

/**
 * 指定日の指定時刻で枠を一括作成。
 * @param date YYYY-MM-DD
 * @param times "10:00, 11:00, 12:00" など。各30分枠想定。
 */
export async function createSlots(
  prev: SlotCreateState,
  formData: FormData
): Promise<SlotCreateState> {
  const supabase = await createClient();
  const date = formData.get("date") as string;
  const timesInput = formData.get("times") as string;

  if (!date || !timesInput) {
    return { error: "日付と時刻を入力してください。" };
  }

  const times = timesInput
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  // 各時刻がHH:mmまたはH:mm形式かどうか検証し、不正な場合はエラーメッセージを返す
  const invalidTimes = times.filter((t) => !/^\d{1,2}:\d{2}$/.test(t));
  if (invalidTimes.length > 0) {
    return { error: `時刻の形式が正しくありません: ${invalidTimes.join(", ")}` };
  }

  if (times.length === 0) {
    return { error: "少なくとも1つの時刻を入力してください。" };
  }

  const durationMinutes = 30;
  const slots: { start_time: string; end_time: string }[] = [];
  const [y, mo, d] = date.split("-").map(Number);

  for (const timeStr of times) {
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h)) continue;
    const start = new Date(y, mo - 1, d, h, m ?? 0, 0, 0);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    slots.push({
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });
  }

  const { error } = await supabase.from("slots").insert(slots);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function bookSlot(slotId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインしてください。");

  const { error } = await supabase
    .from("slots")
    .update({ is_booked: true, booked_by: user.id })
    .eq("id", slotId)
    .eq("is_booked", false);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function cancelBooking(slotId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("slots")
    .update({ is_booked: false, booked_by: null })
    .eq("id", slotId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
