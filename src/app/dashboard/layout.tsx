import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect("/admin");

  return (
    <div className="min-h-screen bg-sage-50/40">
      <header className="sticky top-0 z-10 border-b border-sage-200/80 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-800">
            <Calendar className="h-6 w-6 text-primary-600" />
            <span className="font-semibold">Reserve-One</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LayoutDashboard className="h-4 w-4" />
              予約する
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
