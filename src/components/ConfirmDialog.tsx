import { cn } from '../utils/cn'
import { Loader } from './Loader'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  isBusy?: boolean
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Modal used for destructive confirmations (delete, cancel subscription, …). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  isBusy = false,
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isBusy}>
            Cancel
          </button>
          <button
            type="button"
            className={cn('btn', danger ? 'btn-danger' : 'btn-primary')}
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? <Loader size="sm" label="Working…" /> : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-zinc-300">{message}</p>
    </Modal>
  )
}