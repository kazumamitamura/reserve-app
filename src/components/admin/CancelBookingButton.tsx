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
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
    >
      {pending ? "処理中…" : "キャンセル"}
    </button>
  );
}
