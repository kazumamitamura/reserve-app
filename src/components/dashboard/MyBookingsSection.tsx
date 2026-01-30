"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar, History } from "lucide-react";
import { CancelBookingButton } from "./CancelBookingButton";
import { RescheduleButton } from "./RescheduleButton";

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: string | null;
};

export function MyBookingsSection({
  upcoming,
  past,
  availableSlots,
  userId,
}: {
  upcoming: Slot[];
  past: Slot[];
  availableSlots: Slot[];
  userId: string;
}) {
  const myUpcoming = upcoming.filter((s) => s.booked_by === userId);
  const myPast = past.filter((s) => s.booked_by === userId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-700">
          <Calendar className="h-5 w-5 text-sage-600" />
          今後の予約
        </h2>
        {myUpcoming.length === 0 ? (
          <p className="rounded-xl border border-sage-100 bg-sage-50/50 px-4 py-3 text-sm text-slate-600">
            予約はありません。カレンダーから空き枠を選択して予約してください。
          </p>
        ) : (
          <ul className="space-y-2">
            {myUpcoming.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sage-200/80 bg-white px-4 py-3 shadow-sm"
              >
                <span className="font-medium text-slate-800">
                  {format(new Date(slot.start_time), "M月d日(E) HH:mm", { locale: ja })}–
                  {format(new Date(slot.end_time), "HH:mm", { locale: ja })}
                </span>
                <div className="flex items-center gap-2">
                  <RescheduleButton
                    currentSlotId={slot.id}
                    currentStart={slot.start_time}
                    availableSlots={availableSlots.filter((s) => s.id !== slot.id)}
                  />
                  <CancelBookingButton slotId={slot.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {myPast.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-700">
            <History className="h-5 w-5 text-slate-400" />
            過去の予約
          </h2>
          <ul className="space-y-2">
            {myPast.slice(0, 10).map((slot) => (
              <li
                key={slot.id}
                className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm text-slate-600"
              >
                {format(new Date(slot.start_time), "M月d日(E) HH:mm", { locale: ja })}–
                {format(new Date(slot.end_time), "HH:mm", { locale: ja })}
              </li>
            ))}
          </ul>
          {myPast.length > 10 && (
            <p className="mt-2 text-xs text-slate-500">
              他 {myPast.length - 10} 件の過去予約
            </p>
          )}
        </div>
      )}
    </div>
  );
}
