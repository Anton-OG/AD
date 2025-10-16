// Header.jsx
import React, { useEffect, useState } from 'react';
import './styles/Header.css';
import logo from '../assets/2.png';
import { useTranslation } from 'react-i18next';

function LangSwitch() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0,2) === 'sk' ? 'sk' : 'en';
  const setLang = (code) => { i18n.changeLanguage(code); localStorage.setItem('lang', code); };
  const toggle = () => setLang(current === 'en' ? 'sk' : 'en');

  // Отслеживаем мобильный брейкпоинт
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(max-width: 520px)').matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 520px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else mq.addListener(apply);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply);
      else mq.removeListener(apply);
    };
  }, []);

  // Мобильный вид: одна кнопка EN/SK — просто переключает язык
  if (isMobile) {
    const label = current.toUpperCase();
    const onKeyToggle = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    };
    return (
      <button
        type="button"
        className="hdr-lang-toggle"
        aria-label={`Switch language (current: ${label})`}
        onClick={toggle}
        onKeyDown={onKeyToggle}
      >
        {label}
      </button>
    );
  }

  // Десктоп: твоя «пилюля»
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
          <div className="hdr-title" aria-label={t('brand')}>
          <span className="brand-full">{t('brand')}</span>
          <span className="brand-short">UC Diagnostics</span>
        </div>
        </div>
        <div className="hdr-actions">
          <LangSwitch />
          <button className="hdr-logout" onClick={onLogout}>{t('logout')}</button>
        </div>
      </div>
    </header>
  );
}
