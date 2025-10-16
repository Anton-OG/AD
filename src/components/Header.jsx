// Header.jsx
import React from 'react';
import './styles/Header.css';
import logo from '../assets/2.png';
import { useTranslation } from 'react-i18next';

function LangSwitch() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0,2) === 'sk' ? 'sk' : 'en';
  const setLang = (code) => { i18n.changeLanguage(code); localStorage.setItem('lang', code); };

  const onKey = (e, code) => {
    if (e.key === 'Enter' || e.key === ' ') setLang(code);
    if (e.key === 'ArrowLeft') setLang('en');
    if (e.key === 'ArrowRight') setLang('sk');
  };

  return (
    <div className="hdr-lang" role="radiogroup" aria-label="Language">
      {['en','sk'].map(code => (
        <button
          key={code}
          type="button"
          className="hdr-lang-opt"
          role="radio"
          aria-checked={current === code}
          data-active={current === code}
          onClick={() => setLang(code)}
          onKeyDown={(e) => onKey(e, code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
      <span className="hdr-lang-knob" data-pos={current} aria-hidden="true" />
    </div>
  );
}

export default function Header({ user, onLogout }) {
  const { t } = useTranslation();
  const name = user?.displayName || user?.email || 'User';

  return (
    <header className="site-header-top">
      <div className="hdr-inner">
        <div className="hdr-brand">
          <img src={logo} alt="CPT Logo" className="hdr-logo" />
          <div className="hdr-title">{t('brand')}</div>
        </div>
        <div className="hdr-actions">
          <LangSwitch />
         
          <button className="hdr-logout" onClick={onLogout}>{t('logout')}</button>
        </div>
      </div>
    </header>
  );
}
