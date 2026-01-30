"use client";

import { useState } from "react";
import { CalendarWeekView } from "./CalendarWeekView";
import { CalendarMonthView } from "./CalendarMonthView";
import { LayoutGrid, CalendarDays } from "lucide-react";

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: string | null;
  booked_by_name?: string | null;
};

export function CalendarView({
  slots,
  userId,
  mode,
}: {
  slots: Slot[];
  userId: string;
  mode: "customer" | "admin";
}) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setViewMode("week")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            viewMode === "week"
              ? "bg-sage-600 text-white"
              : "bg-sage-100 text-sage-700 hover:bg-sage-200"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          週間
        </button>
        <button
          type="button"
          onClick={() => setViewMode("month")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            viewMode === "month"
              ? "bg-sage-600 text-white"
              : "bg-sage-100 text-sage-700 hover:bg-sage-200"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          月間
        </button>
      </div>

      {viewMode === "week" ? (
        <CalendarWeekView slots={slots} userId={userId} mode={mode} />
      ) : (
        <CalendarMonthView slots={slots} userId={userId} mode={mode} />
      )}
    </div>
  );
}
