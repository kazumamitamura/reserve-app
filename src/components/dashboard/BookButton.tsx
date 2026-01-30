"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { bookSlot } from "@/app/actions/slots";
import { toast } from "sonner";

export function BookButton({ slotId }: { slotId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await bookSlot(slotId);
            toast.success("予約が完了しました");
            router.refresh();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "予約に失敗しました");
          }
        });
      }}
      className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-700 disabled:opacity-50 transition"
    >
      {pending ? "処理中…" : "予約する"}
    </button>
  );
}
