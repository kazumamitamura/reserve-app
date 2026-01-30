"use client";

import { useEffect } from "react";
import { useActionState } from "react-dom";
import { useFormStatus } from "react-dom";
import { bookSlotAction, type BookSlotResult } from "@/app/actions/slots";
import { toast } from "sonner";

function SubmitButton({ compact }: { compact?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        compact
          ? "rounded-lg bg-sage-600 px-3 py-2 text-sm font-medium text-white hover:bg-sage-700 disabled:opacity-50 transition min-w-[72px]"
          : "inline-flex items-center justify-center rounded-lg bg-sage-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-sage-700 disabled:opacity-50 transition"
      }
    >
      {pending ? "…" : compact ? "予約" : "予約する"}
    </button>
  );
}

export function BookButton({
  slotId,
  compact,
}: {
  slotId: string;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(bookSlotAction, null as BookSlotResult | null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success("予約が完了しました");
    } else {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="slotId" value={slotId} />
      <SubmitButton compact={compact} />
    </form>
  );
}
