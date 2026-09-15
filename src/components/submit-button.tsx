'use client';

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  disabled?: boolean;
};

export function SubmitButton({
  label,
  pendingLabel = "Saving...",
  disabled,
}: SubmitButtonProps) {
  const status = useFormStatus();
  const isDisabled = disabled || status.pending;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
    >
      {status.pending ? pendingLabel : label}
    </button>
  );
}
