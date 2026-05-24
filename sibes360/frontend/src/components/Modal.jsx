import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background Overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
          onClick={onClose}
        />

        {/* Center the modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom rounded-xl text-left overflow-hidden border border-slate-200 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full shadow-2xl" 
          style={{ backgroundColor: '#ffffff', opacity: 1, position: 'relative' }}
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100" style={{ backgroundColor: '#f8fafc', opacity: 1 }}>
            <h3 className="text-base font-bold text-[#1a1f36]">
              {title}
            </h3>
            <button 
              onClick={onClose}
              className="text-[#8898aa] hover:text-[#1a1f36] p-1.5 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-6 py-5" style={{ backgroundColor: '#ffffff', opacity: 1 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
