import React from 'react';
import '../components/styles/UserErrorModal.css';

export default function UserErrorModal({ onClose, missingFields }) {
  return (
    <div className="error-modal">
      <div className="error-window">
        <h2>Oops!</h2>
        <p>Please complete the following fields:</p>
        <ul style={{ textAlign: 'left', margin: '0 auto 16px auto', maxWidth: '300px' }}>
          {missingFields.map((field, index) => (
            <li key={index} style={{ color: '#ffcc00', marginBottom: '4px' }}>{field}</li>
          ))}
        </ul>
        <button className="completion-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}