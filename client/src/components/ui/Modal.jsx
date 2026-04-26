import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={clsx(
        'w-full bg-white dark:bg-dark-700 rounded-2xl shadow-2xl animate-slide-up',
        'border border-gray-100 dark:border-dark-500',
        sizes[size]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-500">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
