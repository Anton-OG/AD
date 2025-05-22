import React from 'react';
import '../components/styles/ErrorModal.css';

export default function ErrorModal({ onClose }) {
  return (
    <div className="error-overlay">
      <div className="error-window">
        <h2 className="error-title">Submission Error</h2>
        <p className="error-message">You must enter a description before submitting.</p>
        <button className="error-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
