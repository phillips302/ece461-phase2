import React from 'react';
import './styles/LoadingOverlay.css';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="loadingOverlay">
      <div className="spinner">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
