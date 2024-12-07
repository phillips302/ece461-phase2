import React, { useState, useEffect, useRef } from 'react';
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
  const [version, setVersion] = useState(currPackage.metadata.Version ?? '');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [debloat, setDebloat] = useState(currPackage.data.debloat ?? false);

  // States for toggling input mode and managing file name
  const [inputMode, setInputMode] = useState(currPackage.data.Content === undefined ? false : true); // False means upload file mode
  const [fileName, setFileName] = useState<string>('');

  // Sync state with currPackage when it changes
  useEffect(() => {
    setVersion(currPackage?.metadata?.Version ?? '');
    setDebloat(currPackage?.data?.debloat ?? false);
  }, [currPackage]);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    };

    const handleClose = () => {
        setContent('')
        setFileName('')
        setUrl('')
        setDebloat(false)
        setInputMode(true)
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
      // Construct the updatedPackage dynamically
      const updatedPackage: types.Package = {
        data: {
          Content: content,
          URL: url,
          debloat: debloat,
        },
        metadata: {
          Name: currPackage.metadata.Name,
          Version: version,
          ID: currPackage.metadata.ID,
        },
      };
      onSubmit(updatedPackage);
    }
    handleClose(); // Close the popup
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      return { message: "Invalid file type. Please upload a ZIP file."}
    }

    setFileName(file.name);
  
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
      className="UpdatePopUpOverlay"
      role="dialog"
      aria-labelledby="popup-title"
      aria-describedby="popup-description"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      <div className="UpdatePopUpContent" ref={modalRef}>
        <button
          className="closeButton"
          onClick={handleClose}
          ref={closeButtonRef}
          aria-label="Close popup"
        >
          &times;
        </button>
        <h2 id="popup-title">{title}</h2>
        <div id="popup-description" className="PopUpInputs">
          <div className="InputRow">
            <label htmlFor="version">Version:</label>
            <input
              id="version"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="PopUpInput"
              aria-required="true"
            />
          </div>
          <div className="CombineRow">
            <label htmlFor="content-or-url-toggle" className="switch">
              <input
                id="content-or-url-toggle"
                type="checkbox"
                checked={inputMode}
                onChange={() => setInputMode(!inputMode)}
                aria-checked={inputMode}
                aria-label="Switch between content upload and URL input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setInputMode(!inputMode);
                  }
                 }}
              />
              <span className="slider"></span>
            </label>
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
                  />
                  <button
                    onClick={() => document.getElementById('fileUpload')?.click()}
                    className="uploadButton"
                    aria-label="Upload"
                  >
                    <i className="fas fa-file-upload"></i>
                    {fileName && <p className="file-name">{fileName}</p>}
                  </button>
                </div>
              </div>
            )}
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
          <div className="InputRow">
            <label htmlFor="debloat">Debloat:</label>
            <input
              id="debloat"
              type="text"
              value={String(debloat)}
              onChange={(e) => setDebloat(e.target.value === 'true')}
              className="PopUpInput"
              aria-required="true"
            />
          </div>
        </div>
        <button className="SubmitButton" aria-label="Submit" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default UpdatePopUp;
