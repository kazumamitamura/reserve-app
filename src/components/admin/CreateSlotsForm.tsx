"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { createSlots, type SlotCreateState } from "@/app/actions/slots";
import { toast } from "sonner";
import { RecurringSlotsForm } from "./RecurringSlotsForm";

export function CreateSlotsForm() {
  const [mode, setMode] = useState<"single" | "recurring">("single");
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
    <div className="mt-4">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            mode === "single" ? "bg-sage-600 text-white" : "bg-sage-100 text-sage-700 hover:bg-sage-200"
          }`}
        >
          単日作成
        </button>
        <button
          type="button"
          onClick={() => setMode("recurring")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            mode === "recurring" ? "bg-sage-600 text-white" : "bg-sage-100 text-sage-700 hover:bg-sage-200"
          }`}
        >
          繰り返し作成
        </button>
      </div>
      {mode === "single" ? (
    <form action={formAction} className="space-y-4">
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
            className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2 text-slate-900 shadow-sm focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
          />
        </div>
        <div>
          <label htmlFor="times" className="block text-sm font-medium text-slate-700">
            開始時刻（9:00〜18:00、30分刻み・カンマ区切り）
          </label>
          <textarea
            id="times"
            name="times"
            rows={3}
            placeholder="9:00, 10:00, 11:00, 14:00, 15:00"
            className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2 text-slate-900 shadow-sm focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
          />
        </div>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-sage-500 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-sage-600 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2 transition"
      >
        枠を作成
      </button>
    </form>
      ) : (
        <RecurringSlotsForm />
      )}
    </div>
  );
}
