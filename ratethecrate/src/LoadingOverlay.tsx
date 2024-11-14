import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay: React.FC = () => (
  <div className="loadingOverlay">
    <div className="spinner" />
  </div>
);

export default LoadingOverlay;