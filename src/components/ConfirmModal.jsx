import { Modal, Button } from './ui'
import { Trash2 } from 'lucide-react'

export function ConfirmModal({ isOpen, onClose, onConfirm, title, description, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-5">
        {/* Ícono de advertencia */}
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <Trash2 size={20} className="text-[var(--color-accent-red)]" />
        </div>

        <p className="text-sm text-center text-[var(--color-txt-secondary)]">
          {description}
        </p>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}