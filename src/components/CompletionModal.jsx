// src/components/CompletionModal.jsx
import '../components/styles/Modal.css';
import { useTranslation } from 'react-i18next';

export default function CompletionModal({ elapsedTime, onClose }) {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-window is-completion">
        <h2 className="modal-title">{t('completion.title')}</h2>
        <p className="modal-text">{t('completion.success')}</p>
        <p className="modal-text">
          <strong>{t('completion.total_time', { seconds: elapsedTime })}</strong>
        </p>
        <button className="btn btn-primary" onClick={onClose}>
          {t('completion.done')}
        </button>
      </div>
    </div>
  );
}
