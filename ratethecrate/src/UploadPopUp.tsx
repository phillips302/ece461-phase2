import React, { useState } from 'react';
import './styles/PopUp.css';
import * as types from '../../src/apis/types.js';

interface UploadPopUpProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  onSubmit?: (uploadedPackageData: types.PackageData) => void; // Optional callback for input submission
}

const UploadPopUp: React.FC<UploadPopUpProps> = ({
  isVisible,
  onClose,
  title,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [debloat, setDebloat] = useState(false);
  const [inputMode, setInputMode] = useState(true);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const uploadedPackageData: types.PackageData = {
        Content: !inputMode ? content : undefined,
        URL: inputMode ? url : undefined,
        debloat: debloat,
      };
      onSubmit(uploadedPackageData);
    }
    onClose(); // Close the popup
  };

  if (!isVisible) return null;

  return (
    <div className="UploadPopUpOverlay">
      <div className="UploadPopUpContent">
        <button className="closeButton" onClick={handleClose}>
          &times;
        </button>
        <h2>{title}</h2>
        <div className="PopUpInputs">
          <div className="CombineRow">
          <label className="switch">
            <input
              type="checkbox"
              checked={inputMode}
              onChange={() => {
                setInputMode(!inputMode); // Toggle between Content and URL
                setContent(''); // Reset content
                setUrl(''); // Reset URL
              }} // Toggle between Content and URL
            />
            <span className="slider"></span>
          </label>
          {!inputMode && (
            <div className="InputRowContent">
              <label className='InputRow2Label' htmlFor="content">Content:</label>
              <input
                id="content"
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="PopUpInput"
              />
            </div>
          )}
          {inputMode && (
            <div className="InputRowUrl">
            <label className='InputRow2Label' htmlFor="url">URL:</label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="PopUpInput"
              />
            </div>
          )}
          </div>
          <div className="InputRow">
              <label htmlFor="debloat">Debloat:</label>
              <input
              id="debloat"
              type="text"
              value={String(debloat)}
              onChange={(e) => {
                if (e.target.value === "true") {
                  setDebloat(true);
                } else if (e.target.value === "false") {
                  setDebloat(false);
                }
              }}
              className="PopUpInput"
              />
          </div>
        </div>
        {/* Submit button */}
        <button className="SubmitButton" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default UploadPopUp;