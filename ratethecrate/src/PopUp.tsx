import React from 'react';
import './PopUp.css';

const PopUp: React.FC<{ isVisible: boolean, onClose: () => void, title: string, message: string }> = ({ isVisible, onClose, title, message }) => {
    const handleClose = () => {
      onClose();
    };
  
    if (!isVisible) return null;
  
    return (
      <div className="PopUpOverlay">
        <div className="PopUpContent">
          <button className="closeButton" onClick={handleClose}>&times;</button>
          <h2>{title}</h2>
          {message ? (
            <div>
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