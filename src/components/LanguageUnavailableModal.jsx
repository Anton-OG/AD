import React from 'react';
import '../components/styles/LanguageModal.css';

export default function LanguageUnavailableModal({ onClose }) {
  return (
    <div className="language-overlay">
      <div className="language-window">
        <h2 className="language-title">Slovak version is not available yet</h2>
        <p style={{ color: '#dddddd', margin: '1rem 0' }}>
          The Slovak version of this test is currently under development.
          <br />
          Please continue using the English version for now.
        </p>
        <button
          className="language-button"
          style={{
            backgroundColor: '#ffcc00',
            color: '#000',
            padding: '0.5rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            border: 'none',
            marginTop: '1rem',
            cursor: 'pointer'
          }}
          onClick={onClose}
        >
          Continue in English
        </button>
      </div>
    </div>
  );
}
