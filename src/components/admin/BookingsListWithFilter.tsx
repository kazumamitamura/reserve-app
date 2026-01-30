"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { BookingsList } from "./BookingsList";
import type { Slot } from "@/lib/types";

export function BookingsListWithFilter({ slots }: { slots: Slot[] }) {
  const now = new Date();
  const [from, setFrom] = useState(format(now, "yyyy-MM-dd"));
  const [to, setTo] = useState(format(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));

  const filtered = useMemo(() => {
    const fromDate = new Date(from + "T00:00:00");
    const toDate = new Date(to + "T23:59:59");
    return slots.filter((s) => {
      const t = new Date(s.start_time);
      return t >= fromDate && t <= toDate;
    });
  }, [slots, from, to]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-600">期間:</span>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-sage-200 px-2 py-1.5 text-sm focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
        />
        <span className="text-slate-500">〜</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-sage-200 px-2 py-1.5 text-sm focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
        />
        <span className="text-sm text-slate-500">{filtered.length} 件</span>
      </div>
      <BookingsList slots={filtered} />
    </div>
  );
}
