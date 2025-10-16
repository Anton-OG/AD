import React, { useEffect, useRef, useState } from 'react';
import './styles/Dashboard.css';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  updateProfile,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { useTranslation } from 'react-i18next';

export default function UserSettings({ user, onClose }) {
  const { t } = useTranslation();

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [newEmail, setNewEmail]   = useState('');

  const wrapRef = useRef(null);

  // preload profile data from Firestore
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!mounted) return;
        const d = snap.exists() ? snap.data() : {};
        const [fn, ...ln] = (user.displayName || '').split(' ').filter(Boolean);
        setFirstName(d.firstName ?? fn ?? '');
        setLastName(d.lastName ?? (ln.join(' ') || ''));
        setPhone(d.phone ?? '');
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  // close on Esc
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey, { passive: true });
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // block page scrolling while the menu is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPR = document.body.style.paddingRight;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;

    const stop = (e) => e.preventDefault();
    document.addEventListener('wheel', stop, { passive: false });
    document.addEventListener('touchmove', stop, { passive: false });

    setTimeout(() => {
      const first = wrapRef.current?.querySelector('input,button');
      first && first.focus && first.focus();
    }, 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPR;
      document.removeEventListener('wheel', stop);
      document.removeEventListener('touchmove', stop);
    };
  }, []);

  const stop = (e) => e.stopPropagation();

  const saveProfile = async () => {
    setErr(''); setMsg('');
    try {
      setBusy(true);
      const displayName = `${firstName || ''} ${lastName || ''}`.trim() || user.displayName || '';
      if (displayName && displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }
      await setDoc(
        doc(db, 'users', user.uid),
        { firstName: firstName || null, lastName: lastName || null, phone: phone || null },
        { merge: true }
      );
      setMsg(t('settings.saved'));
    } catch (e) {
      console.error(e);
      setErr(t('settings.error_save'));
    } finally {
      setBusy(false);
    }
  };

  const changeEmail = async () => {
    setErr(''); setMsg('');
    const em = (newEmail || '').trim().toLowerCase();
    if (!em) { setErr(t('settings.email_enter')); return; }
    try {
      setBusy(true);
      auth.useDeviceLanguage?.();
      await verifyBeforeUpdateEmail(auth.currentUser, em);
      setMsg(t('settings.email_sent'));
      setNewEmail('');
    } catch (e) {
      console.error(e);
      const code = String(e?.code || '');
      if (code.includes('requires-recent-login')) {
        setErr(t('settings.email_requires_recent_login'));
      } else if (code.includes('invalid-email')) {
        setErr(t('settings.email_invalid'));
      } else if (code.includes('email-already-in-use')) {
        setErr(t('settings.email_in_use'));
      } else {
        setErr(t('settings.email_change_error'));
      }
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    setErr(''); setMsg('');
    try {
      setBusy(true);
      await sendPasswordResetEmail(auth, (user.email || '').toLowerCase());
      setMsg(t('settings.pass_sent'));
    } catch (e) {
      console.error(e);
      setErr(t('settings.pass_error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="user-menu-overlay" onMouseDown={onClose}>
      <div
        className="user-menu"
        ref={wrapRef}
        onMouseDown={stop}
        role="dialog"
        aria-modal="true"
        aria-label={t('settings.title')}
      >
        <div className="user-menu-head">
          <div className="user-menu-title">{t('settings.title')}</div>
          <button className="user-menu-close" onClick={onClose} aria-label={t('settings.close_aria')}>×</button>
        </div>

        <div className="user-menu-section">
          <div className="user-menu-label">{t('settings.first_name')}</div>
          <input className="user-menu-input" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
          <div className="user-menu-label">{t('settings.last_name')}</div>
          <input className="user-menu-input" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
          <div className="user-menu-label">{t('settings.phone')}</div>
          <input className="user-menu-input" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          <button className="user-menu-btn primary" onClick={saveProfile} disabled={busy}>
            {t('settings.save_profile')}
          </button>
        </div>

        <div className="user-menu-section">
          <div className="user-menu-label">{t('settings.email_section')}</div>
          <input
            className="user-menu-input"
            type="email"
            placeholder={t('settings.email_placeholder')}
            value={newEmail}
            onChange={(e)=>setNewEmail(e.target.value)}
          />
          <button className="user-menu-btn" onClick={changeEmail} disabled={busy}>
            {t('settings.send_email_change')}
          </button>
        </div>

        <div className="user-menu-section">
          <div className="user-menu-label">{t('settings.password_section')}</div>
          <button className="user-menu-btn" onClick={changePassword} disabled={busy}>
            {t('settings.send_password_reset')}
          </button>
        </div>

        {(msg || err) && (
          <div className={`user-menu-note ${err ? 'is-error' : ''}`} aria-live="polite">
            {err || msg}
          </div>
        )}
      </div>
    </div>
  );
}
// src/components/Dashboard.jsx