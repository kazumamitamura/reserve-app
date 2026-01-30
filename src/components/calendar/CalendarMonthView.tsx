"use client";

import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  addDays,
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

function getSlotsForDay(slots: Slot[], day: Date) {
  return slots.filter((s) => {
    const start = parseISO(s.start_time);
    return isSameDay(start, day);
  });
}

export function CalendarMonthView({
  slots,
  userId,
  mode,
}: {
  slots: Slot[];
  userId: string;
  mode: "customer" | "admin";
}) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let d = new Date(calStart);
  while (d <= calEnd) {
    days.push(new Date(d));
    d = addDays(d, 1);
  }

  const visibleSlots = slots.filter((s) => {
    const start = parseISO(s.start_time);
    return isWithinInterval(start, { start: monthStart, end: monthEnd });
  });

  const today = new Date();
  const selectedDaySlots = selectedDate
    ? getSlotsForDay(visibleSlots, selectedDate)
    : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-sage-200/80 bg-white shadow-sm">
      {/* 月ナビ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sage-200/60 bg-sage-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="flex h-9 items-center rounded-lg px-2 text-sm font-medium text-sage-600 transition hover:bg-sage-200/80 hover:text-sage-800"
            aria-label="前の月"
          >
            <ChevronLeft className="h-4 w-4" /> 前へ
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-sage-600 transition hover:bg-sage-200/80 hover:text-sage-800 sm:px-3"
          >
            今日
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="flex h-9 items-center rounded-lg px-2 text-sm font-medium text-sage-600 transition hover:bg-sage-200/80 hover:text-sage-800"
            aria-label="次の月"
          >
            次へ <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-sage-600" />
          <span className="text-sm font-semibold text-slate-800 sm:text-base">
            {format(currentMonth, "yyyy年M月", { locale: ja })}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* 月間カレンダーグリッド */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-7 gap-1">
            {["月", "火", "水", "木", "金", "土", "日"].map((wd) => (
              <div
                key={wd}
                className="py-2 text-center text-xs font-medium text-slate-500"
              >
                {wd}
              </div>
            ))}
            {days.map((day) => {
              const daySlots = getSlotsForDay(visibleSlots, day);
              const hasAvailable = daySlots.some((s) => !s.is_booked);
              const hasBooked = daySlots.some((s) => s.is_booked);
              const inMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[52px] rounded-lg border p-2 text-left transition ${
                    !inMonth ? "bg-slate-50/50 text-slate-400" : "bg-white"
                  } ${
                    isToday
                      ? "border-sage-400 font-semibold text-sage-700 ring-2 ring-sage-300"
                      : "border-sage-100"
                  } ${
                    isSelected
                      ? "ring-2 ring-sage-500 bg-sage-50"
                      : "hover:border-sage-300 hover:bg-sage-50/50"
                  }`}
                >
                  <span className="text-sm font-medium">{format(day, "d")}</span>
                  <div className="mt-1 flex gap-0.5">
                    {hasAvailable && (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500" />
                    )}
                    {hasBooked && (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 選択日のスロット一覧 */}
        <div className="min-w-[280px] border-t border-sage-200/60 bg-sage-50/50 p-4 lg:border-t-0 lg:border-l">
          <h3 className="mb-4 font-semibold text-slate-800">
            {selectedDate
              ? format(selectedDate, "M月d日(E)", { locale: ja })
              : "日付を選択"}
          </h3>
          {selectedDate && selectedDaySlots.length === 0 && (
            <p className="text-sm text-slate-500">この日の枠はありません</p>
          )}
          {selectedDate && selectedDaySlots.length > 0 && (
            <ul className="space-y-3">
              {selectedDaySlots.map((slot) => {
                const isMine = slot.booked_by === userId;
                const available = !slot.is_booked;
                return (
                  <li
                    key={slot.id}
                    className={`rounded-xl border px-4 py-3 ${
                      available
                        ? "border-sage-300 bg-white"
                        : isMine
                          ? "border-sage-400/80 bg-primary-100"
                          : "border-slate-200 bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-800">
                        {format(parseISO(slot.start_time), "HH:mm")}–
                        {format(parseISO(slot.end_time), "HH:mm")}
                      </span>
                      <div className="flex items-center gap-2">
                        {available && mode === "customer" && (
                          <BookButton slotId={slot.id} />
                        )}
                        {available && mode === "admin" && (
                          <span className="text-sm text-sage-600">空き</span>
                        )}
                        {slot.is_booked && isMine && (
                          <>
                            <span className="text-sm font-medium text-slate-700">
                              予約済み
                            </span>
                            <CancelBookingButton slotId={slot.id} />
                          </>
                        )}
                        {slot.is_booked && !isMine && (
                          <span className="text-sm text-slate-600">
                            {slot.booked_by_name ? `${slot.booked_by_name} 様` : "予約済"}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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
