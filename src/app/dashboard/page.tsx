import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/calendar/CalendarView";
import { SlotCards } from "@/components/dashboard/SlotCards";
import { MyBookingsSection } from "@/components/dashboard/MyBookingsSection";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const futureEnd = new Date(now);
  futureEnd.setDate(futureEnd.getDate() + 120);
  const pastStart = new Date(now);
  pastStart.setDate(pastStart.getDate() - 30);

  const { data: futureSlots } = await supabase
    .from("slots")
    .select("id, start_time, end_time, is_booked, booked_by")
    .gte("start_time", now.toISOString())
    .lte("start_time", futureEnd.toISOString())
    .order("start_time", { ascending: true });

  const { data: pastSlots } = await supabase
    .from("slots")
    .select("id, start_time, end_time, is_booked, booked_by")
    .gte("start_time", pastStart.toISOString())
    .lt("start_time", now.toISOString())
    .order("start_time", { ascending: false });

  const upcoming = futureSlots ?? [];
  const past = pastSlots ?? [];
  const availableSlots = upcoming.filter((s) => !s.is_booked);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-800">予約カレンダー</h1>
        <p className="mt-1 text-sm text-slate-600">
          週の枠を確認し、空き枠から予約できます
        </p>
      </div>

      <section className="rounded-2xl border border-sage-200/80 bg-white p-6 shadow-sm">
        <MyBookingsSection
          upcoming={upcoming}
          past={past}
          availableSlots={availableSlots}
          userId={user.id}
        />
      </section>

      <section className="rounded-2xl border border-sage-200/80 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-700">
          予約カレンダー
        </h2>
        <CalendarView
          slots={upcoming}
          userId={user.id}
          mode="customer"
        />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-700">
          一覧表示
        </h2>
        <SlotCards slots={upcoming} userId={user.id} />
      </section>
    </div>
  );
}
