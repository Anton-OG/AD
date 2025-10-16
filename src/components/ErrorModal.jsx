// src/components/ErrorModal.jsx
import React from 'react';
import '../components/styles/Modal.css';
import { useTranslation } from 'react-i18next';

export default function ErrorModal({ onClose }) {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-window is-error">
        <h2 className="modal-title">{t('desc.error_title')}</h2>
        <p className="modal-text">{t('desc.error_body')}</p>
        <button className="btn btn-primary" onClick={onClose}>
          {t('desc.ok')}
        </button>
      </div>
    </div>
  );
}
