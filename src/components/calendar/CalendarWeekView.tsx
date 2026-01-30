"use client";

import { useState } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { BookButton } from "@/components/dashboard/BookButton";
import { CancelBookingButton } from "@/components/dashboard/CancelBookingButton";

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: string | null;
  booked_by_name?: string | null;
};

const HOUR_START = 9;
const HOUR_END = 18;
const SLOT_MINUTES = 30;

function getSlotAt(slots: Slot[], day: Date, hour: number, minute: number) {
  return slots.find((s) => {
    const start = parseISO(s.start_time);
    return (
      isSameDay(start, day) &&
      start.getHours() === hour &&
      start.getMinutes() === minute
    );
  });
}

export function CalendarWeekView({
  slots,
  userId,
  mode,
}: {
  slots: Slot[];
  userId: string;
  mode: "customer" | "admin";
}) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const timeRows = Array.from(
    { length: ((HOUR_END - HOUR_START) * 60) / SLOT_MINUTES },
    (_, i) => {
      const h = HOUR_START + Math.floor((i * SLOT_MINUTES) / 60);
      const m = (i * SLOT_MINUTES) % 60;
      return { hour: h, minute: m };
    }
  );

  const visibleSlots = slots.filter((s) => {
    const start = parseISO(s.start_time);
    return isWithinInterval(start, { start: weekStart, end: weekEnd });
  });

  const today = new Date();

  return (
    <div className="overflow-hidden rounded-2xl border border-sage-200/80 bg-white shadow-sm">
      {/* 週ナビ（TimeRex / Airリザーブ風） */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sage-200/60 bg-sage-50 px-4 py-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((w) => subWeeks(w, 1))}
            className="flex h-9 items-center rounded-lg px-2 text-sm font-medium text-sage-600 transition hover:bg-sage-200/80 hover:text-sage-800"
            aria-label="前の週"
          >
            <ChevronLeft className="h-4 w-4" /> 前へ
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-sage-600 transition hover:bg-sage-200/80 hover:text-sage-800 sm:px-3"
          >
            今日
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            className="flex h-9 items-center rounded-lg px-2 text-sm font-medium text-sage-600 transition hover:bg-sage-200/80 hover:text-sage-800"
            aria-label="次の週"
          >
            次へ <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-sage-600" />
          <span className="text-sm font-semibold text-slate-800 sm:text-base">
            {format(weekStart, "yyyy年M月", { locale: ja })} – {format(weekEnd, "M月d日", { locale: ja })}
          </span>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* ヘッダー行（曜日） */}
          <div className="grid grid-cols-[64px_repeat(7,minmax(80px,1fr))] border-b border-sage-200/60 bg-sage-50">
            <div className="border-r border-sage-200/50 p-2" />
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={`border-r border-sage-200/50 p-2 text-center last:border-r-0 ${
                  isSameDay(day, today)
                    ? "bg-sage-200/60 font-semibold text-sage-700"
                    : "text-slate-600"
                }`}
              >
                <div className="text-xs font-medium">
                  {format(day, "EEE", { locale: ja })}
                </div>
                <div className="text-lg">{format(day, "d")}</div>
              </div>
            ))}
          </div>

          {/* 時間スロット */}
          {timeRows.map(({ hour, minute }) => (
            <div
              key={`${hour}-${minute}`}
              className="grid grid-cols-[64px_repeat(7,minmax(80px,1fr))] border-b border-sage-100 last:border-b-0"
            >
              <div className="border-r border-sage-200/40 px-2 py-2 text-right text-xs text-slate-500">
                {hour}:{minute.toString().padStart(2, "0")}
              </div>
              {days.map((day) => {
                const slot = getSlotAt(visibleSlots, day, hour, minute);
                const isMine = slot?.booked_by === userId;
                const available = slot && !slot.is_booked;

                return (
                  <div
                    key={`${day.toISOString()}-${hour}-${minute}`}
                    className={`border-r border-sage-100 p-1.5 last:border-r-0 ${
                      slot
                        ? available
                    ? "bg-sage-50"
                        : isMine
                            ? "bg-primary-100/80"
                            : "bg-slate-50"
                        : "bg-white"
                    }`}
                  >
                    {slot && (
                      <div
                        className={`flex h-full min-h-[60px] flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-center transition ${
                          available
                            ? "border border-sage-400/60 bg-sage-50 shadow-sm hover:border-sage-500 hover:bg-sage-100"
                            : isMine
                              ? "border border-sage-400/80 bg-primary-100"
                              : "border border-slate-200 bg-slate-100/90"
                        }`}
                      >
                        <span className="text-xs font-medium text-slate-600">
                          {format(parseISO(slot.start_time), "HH:mm")}–
                          {format(parseISO(slot.end_time), "HH:mm")}
                        </span>
                        {available && mode === "customer" && (
                          <BookButton slotId={slot.id} compact />
                        )}
                        {available && mode === "admin" && (
                          <span className="text-sm font-medium text-sage-600">
                            空き
                          </span>
                        )}
                        {slot.is_booked && isMine && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-800">
                              予約済み
                            </span>
                            <CancelBookingButton slotId={slot.id} compact />
                          </div>
                        )}
                        {slot.is_booked && !isMine && (
                          <span className="truncate max-w-full px-1 text-xs font-medium text-slate-700" title={slot.booked_by_name ?? "予約済"}>
                            {slot.booked_by_name ? `${slot.booked_by_name} 様` : "予約済"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap items-center justify-center gap-5 border-t border-sage-200/60 bg-sage-50 px-4 py-3">
        <span className="flex items-center gap-2 text-sm text-slate-700">
          <span className="h-5 w-8 rounded border border-sage-400 bg-sage-50" />
          空き
        </span>
        <span className="flex items-center gap-2 text-sm text-slate-700">
          <span className="h-5 w-8 rounded border border-sage-400 bg-primary-100" />
          自分の予約
        </span>
        <span className="flex items-center gap-2 text-sm text-slate-700">
          <span className="h-5 w-8 rounded border border-slate-200 bg-slate-100" />
          受付終了
        </span>
      </div>
    </div>
  );
}
