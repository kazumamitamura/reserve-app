"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarClock, Check, X } from "lucide-react";
import { BookButton } from "./BookButton";
import { CancelBookingButton } from "./CancelBookingButton";

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: string | null;
};

export function SlotCards({
  slots,
  userId,
}: {
  slots: Slot[];
  userId: string;
}) {
  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CalendarClock className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-2 text-slate-600">いま予約できる枠はありません。</p>
        <p className="mt-1 text-sm text-slate-500">しばらくしてからご確認ください。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {slots.map((slot) => {
        const isMine = slot.booked_by === userId;
        const available = !slot.is_booked;

        return (
          <div
            key={slot.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-slate-900">
                {format(new Date(slot.start_time), "M月d日(E) HH:mm", { locale: ja })}
              </span>
              <span className="text-slate-400">–</span>
              <span className="text-slate-600">
                {format(new Date(slot.end_time), "HH:mm", { locale: ja })}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {available && (
                <BookButton slotId={slot.id} />
              )}
              {slot.is_booked && !isMine && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                  <X className="h-4 w-4" />
                  受付終了
                </span>
              )}
              {slot.is_booked && isMine && (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-success-100 px-3 py-1.5 text-sm font-medium text-success-600">
                    <Check className="h-4 w-4" />
                    予約済み
                  </span>
                  <CancelBookingButton slotId={slot.id} />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
