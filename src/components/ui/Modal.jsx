import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  // Cerrar con la tecla Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    // Limpieza del event listener
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Si está cerrado, no renderizar nada en el DOM
  if (!isOpen) return null

  return (
    // Overlay: fondo semitransparente que cubre toda la pantalla
    // Al hacer click en el overlay (no en el modal) se cierra
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Contenedor del modal */}
      {/* stopPropagation evita que el click dentro del modal llegue al overlay */}
      <div
        className={cn(
          'w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)]',
          'rounded-2xl shadow-2xl',
          sizes[size]
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-default)]">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-txt-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-txt-primary)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}