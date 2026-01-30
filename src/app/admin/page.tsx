import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CreateSlotsForm } from "@/components/admin/CreateSlotsForm";
import { BookingsListWithFilter } from "@/components/admin/BookingsListWithFilter";
import { TodayBookingsSummary } from "@/components/admin/TodayBookingsSummary";
import { BookingsExportButton } from "@/components/admin/BookingsExportButton";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const limit = new Date(now);
  limit.setDate(limit.getDate() + 90);
  const past = new Date(now);
  past.setDate(past.getDate() - 30);
  const { data: slots } = await supabase
    .from("slots")
    .select(
      `
      id,
      start_time,
      end_time,
      is_booked,
      booked_by,
      created_at,
      profiles:booked_by (full_name)
    `
    )
    .gte("start_time", past.toISOString())
    .lte("start_time", limit.toISOString())
    .order("start_time", { ascending: true });

  const bookedSlots = (slots ?? []).filter(
    (s: { is_booked: boolean }) => s.is_booked
  );

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const todayBooked = bookedSlots.filter((s: { start_time: string }) => {
    const t = new Date(s.start_time);
    return t >= todayStart && t < todayEnd;
  });

  const slotData = (slots ?? []).map((s) => {
    const profiles = s.profiles;
    const name = Array.isArray(profiles)
      ? profiles[0]?.full_name ?? null
      : (profiles as { full_name?: string | null } | null)?.full_name ?? null;
    return {
      id: s.id,
      start_time: s.start_time,
      end_time: s.end_time,
      is_booked: s.is_booked,
      booked_by: s.booked_by,
      booked_by_name: name,
    };
  });

  const todayStr = format(now, "yyyy-MM-dd");
  const exportTodayUrl = `/api/admin/bookings/export?from=${todayStr}&to=${todayStr}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-800">管理ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-600">
          カレンダーで予約状況を確認し、枠を作成できます
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-700">今日の予約</h2>
        <TodayBookingsSummary todaySlots={todayBooked} exportUrl={exportTodayUrl} />
      </section>

      <section className="rounded-2xl border border-sage-200/80 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-700">
          予約カレンダー
        </h2>
        <CalendarView
          slots={slotData}
          userId={user?.id ?? ""}
          mode="admin"
        />
      </section>

      <section className="rounded-2xl border border-sage-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">枠を作成する</h2>
        <p className="mt-1 text-sm text-slate-600">
          日付と開始時刻（9:00〜18:00、30分刻み）を入力。例: 9:00, 10:00, 14:00
        </p>
        <CreateSlotsForm />
      </section>

      <section className="rounded-2xl border border-sage-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">予約一覧</h2>
            <p className="mt-1 text-sm text-slate-600">
              予約済みの枠一覧（直近30日〜90日）
            </p>
          </div>
          <BookingsExportButton />
        </div>
        <BookingsListWithFilter slots={bookedSlots} />
      </section>
    </div>
  );
}
