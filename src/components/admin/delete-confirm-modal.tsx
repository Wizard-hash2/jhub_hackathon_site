"use client";

import { useEffect, useRef } from "react";
import { TrashIcon, CloseIcon } from "../icons";

export function DeleteConfirmModal({
  open,
  title,
  onCancel,
  onConfirm,
  busy,
}: {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  const cancelBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelBtn.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Delete hackathon"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-edge bg-card p-6 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">Delete hackathon?</h3>
            <p className="mt-1 text-sm text-mist">
              This will permanently remove <span className="font-medium text-white">{title}</span>.
              This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1 text-fog hover:text-white"
            onClick={onCancel}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelBtn}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-edge px-4 py-2 text-sm text-mist transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <TrashIcon className="h-4 w-4" />
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
