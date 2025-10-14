import React from 'react';
import './styles/Header.css';

export default function Header({ user, onLogout, logoSrc = './src/assets/2.png' }) {
  const name = user?.displayName || user?.email || 'User';

  return (
    <header className="site-header-top">
      <div className="hdr-inner">
        <div className="hdr-brand">
          <img src={logoSrc} alt="CPT Logo" className="hdr-logo" />
          <div className="hdr-title">Cognitive Perception Test</div>
        </div>

        <div className="hdr-actions">
          <span className="hdr-user"><strong>{name}</strong></span>
          <button className="hdr-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
}
