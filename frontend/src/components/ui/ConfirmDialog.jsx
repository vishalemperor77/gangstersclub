import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm this action',
  message,
  confirmLabel = 'Confirm',
  variant = 'primary',
  loading = false,
  danger = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        {danger && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-danger/30 bg-danger/10">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </span>
        )}
        <p className="text-sm leading-relaxed text-silver-300">{message}</p>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : variant} onClick={onConfirm} isLoading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
