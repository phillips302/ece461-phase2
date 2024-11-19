import React, { useState, useEffect } from 'react';
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
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [debloat, setDebloat] = useState(false);
  const [jsprogram, setJsProgram] = useState('');

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const uploadedPackageData: types.PackageData = {
        Name: name,
        Content: content,
        URL: url,
        debloat: debloat,
        JSProgram: jsprogram,
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
          <div className="InputRow">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="PopUpInput"
            />
          </div>
          <div className="InputRow">
            <label htmlFor="content">Content:</label>
            <input
              id="content"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="PopUpInput"
            />
          </div>
          <div className="InputRow">
            <label htmlFor="url">URL:</label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="PopUpInput"
            />
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
          <div className="InputRow">
            <label htmlFor="jsprogram">JSProgram:</label>
            <input
              id="jsprogram"
              type="text"
              value={jsprogram}
              onChange={(e) => setJsProgram(e.target.value)}
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