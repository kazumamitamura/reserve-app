import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * 予約データをCSV形式でエクスポート（管理画面用）
 * GET /api/admin/bookings/export?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  const now = new Date();
  const from = fromStr
    ? new Date(fromStr + "T00:00:00")
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = toStr
    ? new Date(toStr + "T23:59:59")
    : new Date(now.getFullYear(), now.getMonth() + 2, 0);

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
    .gte("start_time", from.toISOString())
    .lte("start_time", to.toISOString())
    .order("start_time", { ascending: true });

  const booked = (slots ?? []).filter(
    (s: { is_booked: boolean }) => s.is_booked
  );

  const escapeCsv = (v: string | number | null | undefined) => {
    if (v == null || v === "") return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = [
    [
      "予約日",
      "開始時刻",
      "終了時刻",
      "予約者名",
      "予約ID",
      "作成日時",
    ].join(","),
    ...booked.map((s: { start_time: string; end_time: string; profiles: { full_name?: string } | { full_name?: string }[] | null }) => {
      const profiles = s.profiles;
      const name = Array.isArray(profiles)
        ? profiles[0]?.full_name ?? ""
        : (profiles as { full_name?: string } | null)?.full_name ?? "";
      return [
        escapeCsv(format(new Date(s.start_time), "yyyy/MM/dd", { locale: ja })),
        escapeCsv(format(new Date(s.start_time), "HH:mm", { locale: ja })),
        escapeCsv(format(new Date(s.end_time), "HH:mm", { locale: ja })),
        escapeCsv(name),
        escapeCsv((s as { id?: string }).id),
        escapeCsv(format(new Date((s as { created_at?: string }).created_at ?? 0), "yyyy/MM/dd HH:mm", { locale: ja })),
      ].join(",");
    }),
  ];

  const csv = "\uFEFF" + rows.join("\n");
  const filename = `予約一覧_${format(from, "yyyyMMdd")}_${format(to, "yyyyMMdd")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
