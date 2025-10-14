// Header.jsx
import React from 'react';
import './styles/Header.css';
import logo from '../assets/2.png'; // <— импорт

export default function Header({ user, onLogout }) {
  const name = user?.displayName || user?.email || 'User';
  return (
    <header className="site-header-top">
      <div className="hdr-inner">
        <div className="hdr-brand">
          <img src={logo} alt="CPT Logo" className="hdr-logo" />
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
