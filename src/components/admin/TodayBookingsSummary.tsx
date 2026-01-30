"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarCheck, FileSpreadsheet } from "lucide-react";
import { CancelBookingButton } from "./CancelBookingButton";
import type { Slot } from "@/lib/types";

function getProfile(slot: Slot) {
  const p = slot.profiles;
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

export function TodayBookingsSummary({
  todaySlots,
  exportUrl,
}: {
  todaySlots: Slot[];
  exportUrl?: string;
}) {
  if (todaySlots.length === 0) {
    return (
      <div className="rounded-xl border border-sage-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarCheck className="h-5 w-5" />
          <span className="text-sm font-medium">本日の予約はありません</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-sage-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-sage-600" />
          <span className="font-semibold text-slate-800">
            本日の予約（{todaySlots.length} 件）
          </span>
        </div>
        {exportUrl && (
          <a
            href={exportUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-sage-300 bg-sage-50 px-3 py-1.5 text-sm font-medium text-sage-700 transition hover:bg-sage-100"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV出力
          </a>
        )}
      </div>
      <ul className="space-y-2">
        {todaySlots.map((slot) => {
          const profile = getProfile(slot);
          return (
            <li
              key={slot.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-sage-100 bg-sage-50/50 px-3 py-2"
            >
              <span className="text-sm font-medium text-slate-800">
                {format(new Date(slot.start_time), "HH:mm", { locale: ja })}–
                {format(new Date(slot.end_time), "HH:mm", { locale: ja })}
              </span>
              <span className="text-sm text-slate-600">
                {profile?.full_name || "予約済み"}
              </span>
              <CancelBookingButton slotId={slot.id} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
