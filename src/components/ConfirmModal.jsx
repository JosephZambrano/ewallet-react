import { Modal, Button } from './ui'
import { Trash2, LogOut } from 'lucide-react'

// Ahora acepta un 'variant' para cambiar el ícono y color
export function ConfirmModal({
  isOpen, onClose, onConfirm,
  title, description, loading,
  variant = 'delete'   // 'delete' | 'logout'
}) {
  const config = {
    delete: {
      icon:    <Trash2 size={20} className="text-[var(--color-accent-red)]" />,
      iconBg:  'bg-red-500/10',
      confirm: 'Eliminar',
    },
    logout: {
      icon:    <LogOut size={20} className="text-[var(--color-accent-red)]" />,
      iconBg:  'bg-red-500/10',
      confirm: 'Cerrar sesión',
    },
  }

  const { icon, iconBg, confirm } = config[variant]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-5">
        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto`}>
          {icon}
        </div>
        <p className="text-sm text-center text-[var(--color-txt-secondary)]">
          {description}
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} disabled={loading}>
            {loading ? 'Cargando…' : confirm}
          </Button>
        </div>
      </div>
    </Modal>
  )
}