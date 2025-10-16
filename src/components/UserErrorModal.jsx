import React from 'react';
import '../components/styles/Modal.css';
import { useTranslation } from 'react-i18next';

export default function UserErrorModal({ onClose, missingFields }) {
  const {i18n,t } = useTranslation();
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-window is-error">
        <h2 className="modal-title">{t('user_error.title')}</h2>
        <p className="modal-text">{t('user_error.subtitle')}</p>
        <ul className="modal-list">
           {missingFields.map((field, index) => (
             <li key={index} style={{ color: '#00ffffff', marginBottom: '4px' }}>{field}</li>
           ))}
         </ul>

         <button className="btn btn-primary" onClick={onClose}>
          {t('user_error.ok')}
        </button>
       </div>
     </div>
   );
 }