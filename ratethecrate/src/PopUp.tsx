import React, { useEffect, useRef } from 'react';
import './styles/PopUp.css';

const PopUp: React.FC<{ isVisible: boolean, onClose: () => void, title: string, message: string }> = ({ isVisible, onClose, title, message }) => {
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
            // Set focus to the close button when the modal opens
            closeButtonRef.current?.focus();
        }
    }, [isVisible]);

    useEffect(() => {
        // Trap focus within the modal
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
            className="PopUpOverlay"
            role="dialog"
            aria-labelledby="popup-title"
            aria-describedby="popup-message"
            aria-modal="true"
            onKeyDown={handleKeyDown}
        >
            <div className="PopUpContent" ref={modalRef}>
                <button
                    className="closeButton"
                    onClick={handleClose}
                    ref={closeButtonRef}
                    aria-label="Close"
                >
                    &times;
                </button>
                <h2 id="popup-title">{title}</h2>
                {message ? (
                    <div id="popup-message">
                        <p dangerouslySetInnerHTML={{ __html: message }} />
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default PopUp;
