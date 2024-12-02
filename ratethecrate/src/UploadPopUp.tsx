import React, { useState, useEffect, useRef } from 'react';
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
    <div
      className="UploadPopUpOverlay"
      role="dialog"
      aria-labelledby="popup-title"
      aria-describedby="popup-description"
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
        <h2 id="upload-popup-title">{title}</h2>
  
        {/* Name Input */}
        <div className="InputRow">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="PopUpInput"
            aria-required="true"
          />
        </div>
  
        {/* Inputs Section */}
        <div className="PopUpInputs">
          <div className="CombineRow">
            {/* Toggle Switch */}
            <label htmlFor="content-or-url-toggle" className="switch">
              <input
                id="content-or-url-toggle"
                type="checkbox"
                checked={inputMode}
                onChange={() => {
                  setInputMode(!inputMode);
                }}
                aria-checked={inputMode}
                aria-label="Switch between content upload and URL input"
                onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setInputMode(!inputMode);
                  setContent('');
                  setUrl('');
                }
                }}
              />
              <span className="slider"></span>
            </label>
  
            {/* Content Upload */}
            {!inputMode && (
              <div className="InputRowContent">
                <label className="InputRow2Label" htmlFor="fileUpload">
                  Content:
                </label>
                <div className="file-upload">
                  <input
                    id="fileUpload"
                    type="file"
                    accept=".zip"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    aria-label="Upload a ZIP file"
                  />
                  <button
                    onClick={() => document.getElementById('fileUpload')?.click()}
                    className="uploadButton"
                    aria-label="Upload"
                  >
                    <i className="fas fa-file-upload" aria-hidden="true"></i>
                    {fileName && <p className="file-name">{fileName}</p>}
                  </button>
                </div>
              </div>
            )}
  
            {/* URL Input */}
            {inputMode && (
              <div className="InputRowUrl">
                <label className="InputRow2Label" htmlFor="url">
                  URL:
                </label>
                <input
                  id="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="PopUpInput"
                  aria-required="true"
                />
              </div>
            )}
          </div>
  
          {/* Debloat Input */}
          <div className="InputRow">
            <label htmlFor="debloat">Debloat:</label>
            <input
              id="debloat"
              type="text"
              value={String(debloat)}
              onChange={(e) => {
                if (e.target.value === 'true') {
                  setDebloat(true);
                } else if (e.target.value === 'false') {
                  setDebloat(false);
                }
              }}
              className="PopUpInput"
              aria-required="true"
            />
          </div>
        </div>
  
        {/* Submit Button */}
        <button
          className="SubmitButton"
          onClick={handleSubmit}
          aria-label="Submit"
        >
          Submit
        </button>
      </div>
    </div>
  ); 
}; 

export default UploadPopUp;