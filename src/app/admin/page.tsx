import { createClient } from "@/lib/supabase/server";
import { CreateSlotsForm } from "@/components/admin/CreateSlotsForm";
import { BookingsList } from "@/components/admin/BookingsList";

export default async function AdminPage() {
  const supabase = await createClient();

  const now = new Date().toISOString();
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
      profiles:booked_by (display_name, email)
    `
    )
    .gte("start_time", now)
    .order("start_time", { ascending: true });

  const bookedSlots = (slots ?? []).filter(
    (s: { is_booked: boolean }) => s.is_booked
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">管理ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-600">
          予約枠の作成と予約状況の確認
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">枠を作成する</h2>
        <p className="mt-1 text-sm text-slate-600">
          日付と開始時刻を入力し、枠を一括で追加します。例: 10:00, 11:00, 12:00
        </p>
        <CreateSlotsForm />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">予約一覧</h2>
        <p className="mt-1 text-sm text-slate-600">
          予約済みの枠一覧（{bookedSlots.length} 件）
        </p>
        <BookingsList slots={bookedSlots} />
      </section>
    </div>
  );
}
