import type { ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  onClose: () => void
  position?: 'center' | 'bottom'
}

function Modal({ children, onClose, position = 'center' }: ModalProps) {
  const align = position === 'bottom'
    ? 'items-end sm:items-center'
    : 'items-center'

  return (
    <div
      className={`fixed inset-0 bg-black/40 flex justify-center z-50 p-0 sm:p-4 ${align}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}

export default Modal
