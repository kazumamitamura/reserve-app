"use client";

import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";

export function BookingsExportButton() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const exportUrl = `/api/admin/bookings/export?from=${from}&to=${to}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-sage-200 px-2 py-1.5 text-sm text-slate-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
        />
        <span className="text-slate-500">〜</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-sage-200 px-2 py-1.5 text-sm text-slate-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
        />
      </div>
      <a
        href={exportUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-sage-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sage-700"
      >
        <FileSpreadsheet className="h-4 w-4" />
        CSVエクスポート
      </a>
    </div>
  );
}
