"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { createSlots, type SlotCreateState } from "@/app/actions/slots";
import { toast } from "sonner";

export function CreateSlotsForm() {
  const [state, formAction] = useFormState(createSlots, null as SlotCreateState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success("枠を作成しました");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700">
            日付
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="times" className="block text-sm font-medium text-slate-700">
            開始時刻（カンマまたは改行区切り）
          </label>
          <textarea
            id="times"
            name="times"
            rows={3}
            placeholder="10:00, 11:00, 12:00"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition"
      >
        枠を作成
      </button>
    </form>
  );
}
