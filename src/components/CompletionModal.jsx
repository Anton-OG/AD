import React from 'react';
import '../components/styles/CompletionModal.css';

export default function CompletionModal({ elapsedTime, onClose }) {
  return (
    <div className="completion-overlay">
      <div className="completion-window">
        <h2>Thank you for your participation!</h2>
        <p>You have successfully completed the test.</p>
        <p><strong>Total time:</strong> {elapsedTime} seconds</p>
        <button className="completion-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
