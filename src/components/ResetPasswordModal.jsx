// src/components/ResetPasswordModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import './styles/Modal.css';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useTranslation } from 'react-i18next';


export default function ResetPasswordModal({ initialEmail = '', onClose }) {
  const [email, setEmail] = useState(initialEmail || '');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const { i18n, t  } = useTranslation();

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey, { passive: true });
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const humanize = (err) => {
    const code = err?.code || '';
    if (code.includes('invalid-email'))  return t('auth.invalid_email');
    if (code.includes('user-not-found')) {
      
      return t('reset.sent_blind');
    }
    if (code.includes('too-many-requests')) return t('auth.too_many_requests');
    return t('reset.error_generic');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const em = email.trim().toLowerCase();
     if (!em) { setError(t('reset.enter_email')); return; }

    try {
      setBusy(true);
      await sendPasswordResetEmail(auth, em);
      setDone(true);
    } catch (err) {
      setError(humanize(err));
      if (String(err?.code || '').includes('user-not-found')) setDone(true);
    } finally {
      setBusy(false);
    }
  };

  const overlayClick = (e) => {
    if (e.target.classList.contains('reset-overlay')) onClose?.();
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-window is-reset" onMouseDown={(e) => e.stopPropagation()}>
         <h2 className="modal-title">{done ? t('reset.title_done') : t('reset.title')}</h2>

        {!done ? (
          <>
            <p className="reset-text">{t('reset.subtitle')}</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="reset-email" className="sr-only">{t('reg.email')}</label>
              <input
                id="reset-email"
                ref={inputRef}
                type="email"
                placeholder={t('reset.email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="modal-input"
                autoComplete="email"
                inputMode="email"
                required
              />
              {error && <div className="modal-error" aria-live="polite">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
                  {t('reset.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? t('reset.sending') : t('reset.send_link')}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
              <p className="modal-text">{t('reset.sent_blind_for', { email })}</p>
            <div className="modal-actions">
            <button className="btn-primary" onClick={onClose}>{t('reset.done')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}