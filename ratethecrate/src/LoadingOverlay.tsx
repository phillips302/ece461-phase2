import React from 'react';
import './LoadingOverlay.css'; // Add a separate CSS file for styling

const LoadingOverlay: React.FC = () => {
  return (
    <div className="loadingOverlay">
      <div className="spinner">
        <i className="fas fa-spinner fa-spin"></i>
      </div>
    </div>
  );
};

export default LoadingOverlay;