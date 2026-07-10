'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/class-names';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  isLoading?: boolean;
  confirmationText?: string;
  confirmationValue?: string;
  onConfirmationValueChange?: (value: string) => void;
  confirmationPlaceholder?: string;
  reasonLabel?: string;
  reason?: string;
  onReasonChange?: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  isLoading = false,
  confirmationText,
  confirmationValue = '',
  onConfirmationValueChange,
  confirmationPlaceholder,
  reasonLabel,
  reason = '',
  onReasonChange,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const confirmationRequired = confirmationText ? confirmationValue !== confirmationText : false;
  const reasonRequired = onReasonChange ? !reason.trim() : false;
  const disabled = isLoading || confirmationRequired || reasonRequired;

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'fixed inset-0 z-[60] m-auto w-full max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-elevated backdrop:bg-ink/40',
      )}
      onClose={onCancel}
    >
      <form
        method="dialog"
        className="p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!disabled) onConfirm();
        }}
      >
        <h2 className="text-lg font-black text-ink">{title}</h2>
        {description ? <div className="mt-2 text-sm leading-6 text-ink-muted">{description}</div> : null}

        {confirmationText && onConfirmationValueChange ? (
          <div className="mt-4">
            <Input
              label={`Type "${confirmationText}" to confirm`}
              value={confirmationValue}
              onChange={(event) => onConfirmationValueChange(event.target.value)}
              placeholder={confirmationPlaceholder ?? confirmationText}
            />
          </div>
        ) : null}

        {onReasonChange ? (
          <div className="mt-4">
            <Input
              label={reasonLabel ?? 'Reason'}
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Reason for this action"
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant={tone === 'danger' ? 'primary' : 'primary'}
            className={tone === 'danger' ? 'bg-danger hover:bg-danger/90 focus-visible:ring-danger/60' : undefined}
            isLoading={isLoading}
            disabled={disabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
