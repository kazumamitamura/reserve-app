"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { RefreshCw, X } from "lucide-react";
import { rescheduleBooking } from "@/app/actions/slots";
import { toast } from "sonner";

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

export function RescheduleButton({
  currentSlotId,
  currentStart,
  availableSlots,
}: {
  currentSlotId: string;
  currentStart: string;
  availableSlots: Slot[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  if (availableSlots.length === 0) return null;

  const handleReschedule = async (newSlotId: string) => {
    if (pending) return;
    setPending(true);
    try {
      await rescheduleBooking(currentSlotId, newSlotId);
      toast.success("予約を変更しました");
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "変更に失敗しました");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-sage-400 px-2 py-1 text-xs font-medium text-sage-700 transition hover:bg-sage-50"
      >
        <RefreshCw className="mr-1 inline h-3 w-3" />
        変更
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">予約を変更</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              新しい日時を選択してください
            </p>
            <ul className="space-y-2">
              {availableSlots.slice(0, 20).map((slot) => (
                <li key={slot.id}>
                  <button
                    type="button"
                    onClick={() => handleReschedule(slot.id)}
                    disabled={pending}
                    className="w-full rounded-lg border border-sage-200 bg-sage-50/50 px-4 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:border-sage-400 hover:bg-sage-100 disabled:opacity-50"
                  >
                    {format(new Date(slot.start_time), "M月d日(E) HH:mm", { locale: ja })}–
                    {format(new Date(slot.end_time), "HH:mm", { locale: ja })}
                  </button>
                </li>
              ))}
            </ul>
            {availableSlots.length > 20 && (
              <p className="mt-2 text-xs text-slate-500">
                他 {availableSlots.length - 20} 件の候補
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
