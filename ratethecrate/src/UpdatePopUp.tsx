import React, { useState, useEffect } from 'react';
import './styles/PopUp.css';
import * as types from '../../src/apis/types.js';

interface UpdatePopUpProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  currPackage: types.Package;
  onSubmit?: (updatePackage: types.Package) => void; // Optional callback for input submission
}

const UpdatePopUp: React.FC<UpdatePopUpProps> = ({
  isVisible,
  onClose,
  title,
  currPackage,
  onSubmit,
}) => {
  // State variables initialized with currPackage
  const [name, setName] = useState(currPackage?.data?.Name ?? '');
  const [version, setVersion] = useState(currPackage.metadata.Version ?? '');
  const [id, setId] = useState(currPackage.metadata.ID ?? '');
  const [content, setContent] = useState(currPackage.data.Content ?? '');
  const [url, setUrl] = useState(currPackage.data.URL ?? '');
  const [debloat, setDebloat] = useState(currPackage.data.debloat ?? false);
  const [jsprogram, setJsProgram] = useState(currPackage.data.JSProgram ?? '');

  // Sync state with currPackage when it changes
  useEffect(() => {
    setName(currPackage?.metadata?.Name ?? '');
    setVersion(currPackage?.metadata?.Version ?? '');
    setId(currPackage?.metadata?.ID ?? '');
    setContent(currPackage?.data?.Content ?? '');
    setUrl(currPackage?.data?.URL ?? '');
    setDebloat(currPackage?.data?.debloat ?? false);
    setJsProgram(currPackage?.data?.JSProgram ?? '');
  }, [currPackage]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    if (onSubmit) {
      // Construct the updatedPackage dynamically
      const updatedPackage: types.Package = {
        data: {
          Name: name,
          Content: content,
          URL: url,
          debloat: debloat,
          JSProgram: jsprogram,
        },
        metadata: {
          Name: name,
          Version: version,
          ID: id,
        },
      };
      onSubmit(updatedPackage);
    }
    onClose(); // Close the popup
  };

  if (!isVisible) return null;

  return (
    <div className="UpdatePopUpOverlay">
      <div className="UpdatePopUpContent">
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
            <label htmlFor="version">Version:</label>
            <input
              id="version"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="PopUpInput"
            />
          </div>
          <div className="InputRow">
            <label htmlFor="id">ID:</label>
            <input
              id="id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
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

export default UpdatePopUp;