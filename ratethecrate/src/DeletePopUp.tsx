import React, { useEffect, useRef } from 'react';
import './styles/PopUp.css';

interface DeletePopUpProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: () => void; // Callback for confirming the action
  title?: string; // Optional title for the popup
}

const DeletePopUp: React.FC<DeletePopUpProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (isVisible) {
      closeButtonRef.current?.focus();
    }
  }, [isVisible]);

  useEffect(() => {
    const handleFocusTrap = (e: FocusEvent) => {
      if (!modalRef.current?.contains(e.target as Node)) {
        closeButtonRef.current?.focus();
      }
    };

    if (isVisible) {
      document.addEventListener('focus', handleFocusTrap, true);
    }

    return () => {
      document.removeEventListener('focus', handleFocusTrap, true);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="UploadPopUpOverlay"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      <div className="UploadPopUpContent" ref={modalRef}>
        <button
          className="closeButton"
          onClick={handleClose}
          ref={closeButtonRef}
          aria-label="Close popup"
        >
          &times;
        </button>

        {/* Title */}
        <h2>Are you sure you want to proceed?</h2>

        {/* Confirm Button */}
        <button
          className="DeleteButtons"
          onClick={() => {
            onSubmit(); // Call the confirm action
            onClose(); // Close the popup
          }}
          aria-label="Yes, confirm"
        >
          Yes
        </button>

        {/* Cancel Button */}
        <button
          className="DeleteButtons"
          onClick={handleClose}
          aria-label="Cancel"
        >
          No
        </button>
      </div>
    </div>
  );
};

export default DeletePopUp;
