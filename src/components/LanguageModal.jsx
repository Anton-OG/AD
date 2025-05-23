import React from 'react';
import '../components/styles/LanguageModal.css';
import enFlag from '../assets/flags/en.png';
import skFlag from '../assets/flags/sk.png';

export default function LanguageModal({ onSelectLanguage }) {
  return (
    <div className="language-overlay">
      <div className="language-window">
        <h2 className="language-title">Choose Your Language</h2>
        <div className="language-options">
          <button className="language-button" onClick={() => onSelectLanguage('en')}>
            <img src={enFlag} alt="English" className="language-flag" />
            <p className="language-label">English</p>
          </button>
          <button className="language-button" onClick={() => onSelectLanguage('sk')}>
            <img src={skFlag} alt="Slovensky" className="language-flag" />
            <p className="language-label">Slovensky</p>
          </button>
        </div>
      </div>
    </div>
  );
}
