"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { createRecurringSlots, type RecurringSlotCreateState } from "@/app/actions/slots";
import { toast } from "sonner";

const WEEKDAYS = [
  { value: 1, label: "月" },
  { value: 2, label: "火" },
  { value: 3, label: "水" },
  { value: 4, label: "木" },
  { value: 5, label: "金" },
  { value: 6, label: "土" },
  { value: 0, label: "日" },
];

export function RecurringSlotsForm() {
  const [state, formAction] = useFormState(createRecurringSlots, null as RecurringSlotCreateState);
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([1, 2, 3, 4, 5]);

  const toggle = (d: number) => {
    setSelected((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
    );
  };

  useEffect(() => {
    if (state?.success) {
      toast.success("繰り返し枠を作成しました");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const defaultEnd = nextMonth.toISOString().slice(0, 10);

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-slate-700">
            開始日
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={today}
            required
            className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2 text-slate-900 shadow-sm focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
          />
        </div>
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-slate-700">
            終了日
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={defaultEnd}
            required
            className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2 text-slate-900 shadow-sm focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
          />
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700">曜日</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => (
            <label
              key={d.value}
              className={`flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm transition ${
                selected.includes(d.value)
                  ? "border-sage-400 bg-sage-100 text-sage-800"
                  : "border-sage-200 bg-white text-slate-600 hover:border-sage-300"
              }`}
            >
              <input
                type="checkbox"
                value={d.value}
                checked={selected.includes(d.value)}
                onChange={() => toggle(d.value)}
                className="sr-only"
              />
              {d.label}
            </label>
          ))}
        </div>
        <input type="hidden" name="weekdays" value={selected.join(",")} />
      </div>

      <div>
        <label htmlFor="times_recurring" className="block text-sm font-medium text-slate-700">
          開始時刻（9:00〜18:00、30分刻み・カンマ区切り）
        </label>
        <input
          id="times_recurring"
          name="times"
          type="text"
          placeholder="9:00, 10:00, 11:00, 14:00, 15:00"
          className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2 text-slate-900 shadow-sm focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-sage-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2 transition"
      >
        繰り返し枠を作成
      </button>
    </form>
  );
}
