import React, { useEffect } from 'react';
import { X as XIcon } from 'lucide-react';
import { CrearOfertaForm } from './crear-oferta-form';

interface CrearOfertaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublished?: () => void;
}

export const CrearOfertaModal = ({
  isOpen,
  onClose,
  onPublished,
}: CrearOfertaModalProps): React.ReactElement | null => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  // Al desmontarse, el formulario se reinicia en cada apertura
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/55 md:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crear-oferta-title"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[480px] bg-white md:rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 px-5 md:px-6 py-4 border-b border-gray-100">
          <h2 id="crear-oferta-title" className="font-bold text-navy text-lg">
            Publicar oferta
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 flex items-center justify-center rounded text-[#757575] hover:bg-gray-100 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5">
          <CrearOfertaForm onPublished={onPublished} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
};