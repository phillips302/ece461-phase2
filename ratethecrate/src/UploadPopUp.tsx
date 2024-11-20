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
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [debloat, setDebloat] = useState(false);
  const [inputMode, setInputMode] = useState(true);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const uploadedPackageData: types.PackageData = {
        Name: name,
        Content: !inputMode ? content : undefined,
        URL: inputMode ? url : undefined,
        debloat: debloat,
      };
      onSubmit(uploadedPackageData);
    }
    onClose(); // Close the popup
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      return { message: "Invalid file type. Please upload a ZIP file."}
    }

    setFileName(file.name);
    setName(file.name.slice(0, -4))
  
    const result = await processZipFile(file);
    if (typeof result === 'string') {
      setContent(result); // Set the Base64 string
    } else {
      return { message: result.message}; // Log the error message
    }
  };

  const processZipFile = async (file: File): Promise<string | { message: string }> => {
    let binary = '';
    try {
      // Read the file as an ArrayBuffer
      const fileContent = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error("Failed to read the file"));
        reader.readAsArrayBuffer(file);
      });
  
      // Convert the ArrayBuffer to a Base64 string
      const bytes = new Uint8Array(fileContent);
      const length = bytes.byteLength;

      for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      const base64String = btoa(binary);

      return base64String; // Return the Base64-encoded string
    } catch (error) {
      return { message: `Error processing ZIP file: ${error instanceof Error ? error.message : String(error)}` };
    }
  };

  if (!isVisible) return null;

  return (
    <div className="UploadPopUpOverlay">
      <div className="UploadPopUpContent">
        <button className="closeButton" onClick={handleClose}>
          &times;
        </button>
        <h2>{title}</h2>
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
              {/* Upload Button */}
              <div className="file-upload">
                <input
                  id="fileUpload"
                  type="file"
                  accept=".zip"
                  style={{ display: "none" }} // Hide default input
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => document.getElementById("fileUpload")?.click()} // Trigger file input
                  className="uploadButton"
                >
                  <i className="fas fa-file-upload"></i>
                  {fileName && (
                    <p className="file-name">{fileName}</p>
                  )}
                </button>
              </div>
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