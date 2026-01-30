import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** デプロイ確認用。GET /api/health が 200 ならアプリは起動している。 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "reserve-one",
    env: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
  });
}
