"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Slot } from "@/lib/types";
import { CancelBookingButton } from "./CancelBookingButton";

function getProfile(slot: Slot) {
  const p = slot.profiles;
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

export function BookingsList({ slots }: { slots: Slot[] }) {
  if (slots.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-500">予約はまだありません。</p>
    );
  }

  return (
    <ul className="mt-4 space-y-2">
      {slots.map((slot) => {
        const profile = getProfile(slot);
        return (
        <li
          key={slot.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sage-200/80 bg-sage-50/50 px-4 py-3"
        >
            <div>
              <span className="font-medium text-slate-900">
                {format(new Date(slot.start_time), "M月d日(E) HH:mm", { locale: ja })}
              </span>
              <span className="mx-2 text-slate-400">–</span>
              <span className="text-slate-600">
                {format(new Date(slot.end_time), "HH:mm", { locale: ja })}
              </span>
              {profile && (
                <span className="ml-2 text-sm text-slate-600">
                  （{profile.full_name || "予約済み"}）
                </span>
              )}
            </div>
            <CancelBookingButton slotId={slot.id} />
          </li>
        );
      })}
    </ul>
  );
}
