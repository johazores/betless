'use client';

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/class-names';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  className?: string;
  /** When true, closing prompts before discarding unsaved changes. */
  isDirty?: boolean;
  discardTitle?: string;
  discardDescription?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg',
  className,
  isDirty = false,
  discardTitle = 'Discard unsaved changes?',
  discardDescription = 'You have unsaved changes. Close without saving?',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  function handleDialogClose() {
    if (isDirty) {
      setDiscardOpen(true);
      const dialog = dialogRef.current;
      if (dialog?.open) dialog.showModal();
      return;
    }
    onClose();
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        className={cn(
          'fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none border-0 bg-transparent p-0 backdrop:bg-ink/50',
          className,
        )}
        aria-labelledby={titleId}
        onClose={handleDialogClose}
        onCancel={(event) => {
          event.preventDefault();
          requestClose();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) requestClose();
        }}
      >
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
          <div
            ref={panelRef}
            tabIndex={-1}
            className={cn(
              'flex max-h-[min(90vh,900px)] w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-elevated outline-none',
              sizeClasses[size],
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-black text-ink sm:text-xl">{title}</h2>
                {description ? <div className="mt-1 text-sm leading-6 text-ink-muted">{description}</div> : null}
              </div>
              <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={requestClose}>
                Close
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

            {footer ? (
              <div className="shrink-0 border-t border-line bg-surface-muted/50 px-5 py-4 sm:px-6">{footer}</div>
            ) : null}
          </div>
        </div>
      </dialog>

      <ConfirmDialog
        open={discardOpen}
        title={discardTitle}
        description={discardDescription}
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        tone="danger"
        onConfirm={() => {
          setDiscardOpen(false);
          onClose();
        }}
        onCancel={() => setDiscardOpen(false)}
      />
    </>
  );
}
