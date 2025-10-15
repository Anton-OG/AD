// src/components/ResetPasswordModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import './styles/ResetPasswordModal.css';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function ResetPasswordModal({ initialEmail = '', onClose }) {
  const [email, setEmail] = useState(initialEmail || '');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey, { passive: true });
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const humanize = (err) => {
    const code = err?.code || '';
    if (code.includes('invalid-email')) return 'Invalid email address.';
    if (code.includes('user-not-found')) {
      // Безопасно не раскрывать наличие аккаунта
      return 'If an account exists for this email, we\'ve sent a reset link.';
    }
    if (code.includes('too-many-requests')) return 'Too many attempts. Try again later.';
    return 'Could not send reset email. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const em = email.trim().toLowerCase();
    if (!em) { setError('Please enter your email.'); return; }

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
    <div className="reset-overlay" onMouseDown={overlayClick} role="dialog" aria-modal="true">
      <div className="reset-window" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="reset-title">{done ? 'Check your email' : 'Reset password'}</h2>

        {!done ? (
          <>
            <p className="reset-text">
              Enter the email you used to register. We’ll send you a link to create a new password.
            </p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="reset-email" className="sr-only">Email</label>
              <input
                id="reset-email"
                ref={inputRef}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="reset-input"
                autoComplete="email"
                inputMode="email"
                required
              />
              {error && <div className="reset-error" aria-live="polite">{error}</div>}

              <div className="reset-actions">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={busy}>
                  {busy ? 'Sending…' : 'Send reset link'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="reset-text">
              If an account exists for <strong>{email}</strong>, a password reset link has been sent.
            </p>
            <div className="reset-actions">
            <button className="btn-primary" onClick={onClose}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
