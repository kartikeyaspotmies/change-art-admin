import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@lib/utils';

type ConfirmTone = 'default' | 'destructive';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  tone?: ConfirmTone;
  confirmLabel?: string;
  cancelLabel?: string;
  /**
   * If set, the user must type this exact string in a text box before the
   * confirm button enables. Borrowed from the demo's destructive flow.
   */
  typeToConfirm?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Accessible confirmation dialog:
 *   - role="dialog" + aria-modal + labelled by the title id
 *   - focus moves into the modal on open, returns to the trigger on close
 *   - Esc key closes; Tab is trapped via the focusable elements inside
 *   - destructive tone uses a typed-confirmation gate (demo's QC reject UX)
 */
export function ConfirmModal({
  open,
  title,
  description,
  tone = 'default',
  confirmLabel,
  cancelLabel = 'Cancel',
  typeToConfirm,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = (document.activeElement as HTMLElement) ?? null;
      const t = window.setTimeout(() => confirmBtnRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
    triggerRef.current?.focus();
    setTyped('');
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const canConfirm = !typeToConfirm || typed === typeToConfirm;

  async function handleConfirm() {
    if (!canConfirm || pending) return;
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 anim-fade-in"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="glass-heavy rounded-2xl w-full max-w-[440px] p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 btn btn-outline !p-1.5"
          aria-label="Close dialog"
        >
          <X aria-hidden className="w-3.5 h-3.5" />
        </button>

        <h2 id="confirm-modal-title" className="text-[15px] font-bold mb-2">
          {title}
        </h2>

        {description ? (
          <div className="text-[13px] text-text-muted leading-relaxed mb-4">{description}</div>
        ) : null}

        {typeToConfirm ? (
          <label className="block mb-4">
            <span className="lbl">
              Type "{typeToConfirm}" to confirm
            </span>
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="inp"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              aria-required="true"
            />
          </label>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className={cn('btn', tone === 'destructive' ? 'btn-red' : 'btn-crimson')}
            disabled={!canConfirm || pending}
            onClick={handleConfirm}
            aria-busy={pending}
          >
            {pending ? 'Working…' : (confirmLabel ?? (tone === 'destructive' ? 'Confirm' : 'OK'))}
          </button>
        </div>
      </div>
    </div>
  );
}
