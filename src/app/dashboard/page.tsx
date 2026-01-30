import { createClient } from "@/lib/supabase/server";
import { SlotCards } from "@/components/dashboard/SlotCards";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date().toISOString();
  const { data: slots } = await supabase
    .from("slots")
    .select("id, start_time, end_time, is_booked, booked_by")
    .gte("start_time", now)
    .order("start_time", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">予約する</h1>
        <p className="mt-1 text-sm text-slate-600">
          空いている枠から予約できます
        </p>
      </div>
      <SlotCards slots={slots ?? []} userId={user.id} />
    </div>
  );
}
