"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking } from "@/app/actions/slots";
import { toast } from "sonner";

export function CancelBookingButton({ slotId }: { slotId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await cancelBooking(slotId);
            toast.success("予約をキャンセルしました");
            router.refresh();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "キャンセルに失敗しました");
          }
        });
      }}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
    >
      {pending ? "処理中…" : "キャンセル"}
    </button>
  );
}
