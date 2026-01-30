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

export type RecurringSlotCreateState = { error?: string; success?: boolean } | null;

/**
 * 繰り返し枠を一括作成（指定曜日・時刻で期間内の該当日に枠を追加）
 */
export async function createRecurringSlots(
  prev: RecurringSlotCreateState,
  formData: FormData
): Promise<RecurringSlotCreateState> {
  const supabase = await createClient();
  const startDateStr = formData.get("start_date") as string;
  const endDateStr = formData.get("end_date") as string;
  const weekdaysInput = formData.get("weekdays") as string; // "1,2,3,4,5" = 月〜金
  const timesInput = formData.get("times") as string;

  if (!startDateStr || !endDateStr || !weekdaysInput || !timesInput) {
    return { error: "すべての項目を入力してください。" };
  }

  const times = timesInput
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const invalidTimes = times.filter((t) => !/^\d{1,2}:\d{2}$/.test(t));
  if (invalidTimes.length > 0) {
    return { error: `時刻の形式が正しくありません: ${invalidTimes.join(", ")}` };
  }
  if (times.length === 0) return { error: "少なくとも1つの時刻を入力してください。" };

  const weekdays = weekdaysInput.split(",").map(Number).filter((d) => d >= 0 && d <= 6);
  if (weekdays.length === 0) return { error: "曜日を1つ以上選択してください。" };

  const start = new Date(startDateStr + "T00:00:00");
  const end = new Date(endDateStr + "T23:59:59");
  if (start > end) return { error: "終了日は開始日以降にしてください。" };

  const durationMinutes = 30;
  const slots: { start_time: string; end_time: string }[] = [];
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (weekdays.includes(dayOfWeek)) {
      for (const timeStr of times) {
        const [h, m] = timeStr.split(":").map(Number);
        const slotStart = new Date(current.getFullYear(), current.getMonth(), current.getDate(), h, m ?? 0, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
        slots.push({
          start_time: slotStart.toISOString(),
          end_time: slotEnd.toISOString(),
        });
      }
    }
    current.setDate(current.getDate() + 1);
  }

  if (slots.length === 0) return { error: "作成する枠がありません。期間と曜日を確認してください。" };
  if (slots.length > 500) return { error: "一度に作成できる枠は500件までです。期間を短くしてください。" };

  const { error } = await supabase.from("slots").insert(slots);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export type BookSlotResult = { ok: true } | { ok: false; error: string };

export async function bookSlotAction(
  _prev: BookSlotResult | null,
  formData: FormData
): Promise<BookSlotResult> {
  const slotId = formData.get("slotId") as string;
  if (!slotId) return { ok: false, error: "枠が指定されていません。" };
  try {
    await bookSlot(slotId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "予約に失敗しました。" };
  }
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

/** 予約変更：旧枠をキャンセルして新枠を予約 */
export async function rescheduleBooking(oldSlotId: string, newSlotId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインしてください。");

  const { data: oldSlot } = await supabase
    .from("slots")
    .select("booked_by")
    .eq("id", oldSlotId)
    .single();

  if (!oldSlot || oldSlot.booked_by !== user.id) {
    throw new Error("この予約を変更する権限がありません。");
  }

  const { error: cancelErr } = await supabase
    .from("slots")
    .update({ is_booked: false, booked_by: null })
    .eq("id", oldSlotId);

  if (cancelErr) throw new Error(cancelErr.message);

  const { error: bookErr } = await supabase
    .from("slots")
    .update({ is_booked: true, booked_by: user.id })
    .eq("id", newSlotId)
    .eq("is_booked", false);

  if (bookErr) {
    await supabase
      .from("slots")
      .update({ is_booked: true, booked_by: user.id })
      .eq("id", oldSlotId);
    throw new Error("新しい枠の予約に失敗しました。再度お試しください。");
  }

  revalidatePath("/dashboard");
}
