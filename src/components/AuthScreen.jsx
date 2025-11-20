import React, { useEffect, useMemo, useState } from 'react';
import './styles/AuthScreen.css';
import logo from '../assets/2.png';
import eyeOpen from '../assets/eye-open.png';
import eyeClosed from '../assets/eye-closed.png';
import UserErrorModal from './UserErrorModal.jsx';
import codeIco  from '../assets/key.png';
import mailIco  from '../assets/arroba.png';
import lockIco  from '../assets/padlock.png';

import ResetPasswordModal from './ResetPasswordModal.jsx';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
  deleteUser,
  signOut,
  sendEmailVerification,
  reload,
} from 'firebase/auth';

import { auth, db } from '../firebase.js';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

function LangSwitchAuth() {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.slice(0,2) === 'sk' ? 'sk' : 'en';
  const setLang = (code) => { i18n.changeLanguage(code); localStorage.setItem('lang', code); };
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') setLang(current === 'en' ? 'sk' : 'en');
    if (e.key === 'ArrowLeft') setLang('en');
    if (e.key === 'ArrowRight') setLang('sk');
  };
  return (
    <div className="auth-lang" role="radiogroup" aria-label={t('language')}>
      {['en','sk'].map(code => (
        <button
         key={code}
          type="button"
          className="auth-lang-opt"
          role="radio"
          aria-checked={current === code}
          data-active={current === code}
          onClick={() => setLang(code)}
          onKeyDown={onKey}
        >
          {code.toUpperCase()}
        </button>
      ))}
      <span className="auth-lang-knob" data-pos={current} aria-hidden="true" />
   </div>
  );
}



const DOCTOR_CODE = 'YOUR_SECRET_DOCTOR_CODE';

// Human-readable (EN) Firebase auth errors
const humanizeAuthError = (err) => {
   const code = err?.code || (String(err?.message || '').match(/auth\/[a-z-]+/i) || [])[0];
    switch (code) {
    // Логин неправильный
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return i18n.t('auth.incorrect_credentials');

    // Пользователь не найден
    case 'auth/user-not-found':
      return i18n.t('auth.no_account');

    // Слишком слабый пароль на регистрации (<6)
    case 'auth/weak-password':
      return i18n.t('auth.weak_password');

    // Уже существует email
    case 'auth/email-already-in-use':
      return i18n.t('auth.email_in_use');

    // Неверный формат email
    case 'auth/invalid-email':
      return i18n.t('auth.invalid_email');

    // Много попыток входа
    case 'auth/too-many-requests':
      return i18n.t('auth.too_many_requests');

    // Проблема с интернетом
    case 'auth/network-request-failed':
      return i18n.t('auth.network_error');

    // fallback
    default:
      return i18n.t('auth.generic_error');
  }
};

export default function AuthScreen({ onAuthed }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  // Doctor login
  const [isDoctor, setIsDoctor] = useState(false);
  const [doctorCode, setDoctorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // shared
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // register-only
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState(''); // 'male' | 'female'
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // modals
  const [showError, setShowError] = useState(false);
  const [invalidAgeError, setInvalidAgeError] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [showReset, setShowReset] = useState(false);
  const [showPass, setShowPass] = useState(false);
  useEffect(() => {
   const last = sessionStorage.getItem('authLastError');
    if (last) {
     setAuthError(last);
      sessionStorage.removeItem('authLastError');
    }
  }, []);
  const nonce = useMemo(() => Math.random().toString(36).slice(2), []);
  const fieldName = (base) => `${base}-${mode}-${nonce}`;

  const switchMode = (m) => {
    setMode(m);
    setAuthError('');
    setShowError(false);
    setInvalidAgeError(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsDoctor(false);
    setDoctorCode('');
    setDob('');
  };

  // helper: check if Firestore profile exists
  const userDocExists = async (uid) => {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists();
  };

  // helper: create users/{uid} if missing (set role optionally)
  const ensureUserDoc = async (user, role = 'user') => {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(
        ref,
        {
          email: (user.email || '').toLowerCase(),
          role,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else if (role && snap.data()?.role !== role) {
      // update role if needed
      await setDoc(ref, { role }, { merge: true });
    }
  };

          const blockAndExplain = async (msg) => {
          
          sessionStorage.setItem('authLastError', msg);
          try {
            sessionStorage.removeItem('doctorIntent');
            await signOut(auth);
          } catch {}
          
          setAuthError(msg);
        };

  const sha256Hex = async (str) => {
    const data = new TextEncoder().encode(String(str));
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };
      const calcAgeYears = (dobStr) => {
        const d = new Date(dobStr);
        if (Number.isNaN(d.getTime())) return NaN;
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
        return age;
      };
  // form submission handler (login or register)
        const handleSubmit = async (e) => {
   e.preventDefault();
   if (isDoctor && !doctorCode.trim()) {
     setAuthError(i18n.t('auth.doctor_code_required'));
     return;
   }
    setAuthError('');

    if (mode === 'register') {
      // 1) collect missing fields (show modal first)
      const first = firstName.trim();
      const last = lastName.trim();
      const em = email.trim();
      const ph = phone.trim();
     

      const errs = [];
      if (!first) errs.push('First name');
      if (!last) errs.push('Last name');
      if (!gender) errs.push('Sex');
      if (!dob) errs.push('Date of birth'); // check emptiness before numeric checks
      if (!em) errs.push('Email');
      if (!password) errs.push('Password');
      if (!confirmPassword) errs.push('Confirm password');

      if (errs.length) {
        setMissingFields(errs);
        setShowError(true);
        return;
      }

      // 2) specific validation (age range, passwords match)
      const ageNum = calcAgeYears(dob);
   if (!Number.isFinite(ageNum) || ageNum < 8 || ageNum > 89) {
        setInvalidAgeError(true);
        return;
      }
      if (password && confirmPassword && password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        return;
      }

      // 3) registration flow
      try {
        setBusy(true);

        // Pre-check: is email already registered?
        const methods = await fetchSignInMethodsForEmail(auth, em);
        if (methods.length > 0) {
          setAuthError('An account with this email already exists.');
          return;
        }

        // Create Auth user, then create Firestore profile
        let cred = null;
        try {
          cred = await createUserWithEmailAndPassword(auth, em, password);
          await updateProfile(cred.user, {
            displayName: `${first} ${last}`.trim(),
          });

          const userRef = doc(db, 'users', cred.user.uid);
          await setDoc(userRef, {
            firstName: first,
            lastName: last,
            gender,
            age: ageNum,
            phone: ph,
            email: em.toLowerCase(),
            createdAt: serverTimestamp(),
            role: 'user',
          });
        } catch (writeErr) {
          // rollback orphaned Auth user if Firestore write failed
          if (cred?.user) {
            try {
              await deleteUser(cred.user);
            } catch {}
          }
          throw writeErr;
        }

        // ✉️ send verification and block access until confirmed
        try {
          auth.useDeviceLanguage?.();
          await sendEmailVerification(cred.user, {
            url: `${window.location.origin}/`,
            handleCodeInApp: false,
          });
        } catch {}
        await blockAndExplain(i18n.t('auth.verify_email_resent'));
        return;
      } catch (err) {
        console.error(err);
        setAuthError(humanizeAuthError(err));
      } finally {
        setBusy(false);
        sessionStorage.removeItem('doctorIntent');
      }
      return;
    }

    // login
    try {
      setBusy(true);

     if (isDoctor) {
      sessionStorage.setItem('doctorIntent', '1');
    } else {
      sessionStorage.removeItem('doctorIntent');   // ← ДОБАВИТЬ ЭТО
    }
     const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
     const snap = await getDoc(doc(db, "users", cred.user.uid));
    const data = snap.data();
      // block if email is not verified
    if (!data?.validated) {
  try { await reload(cred.user); } catch {}
  if (!cred.user.emailVerified) {
    try {
      auth.useDeviceLanguage?.();
      await sendEmailVerification(cred.user, {
        url: `${window.location.origin}/`,
        handleCodeInApp: false,
      });
    } catch {}
    await blockAndExplain(i18n.t('auth.verify_email_resent'));
    return;
  }
}

      // allow only if profile document exists
      const exists = await userDocExists(cred.user.uid);
      if (!exists) {
        await blockAndExplain(i18n.t('auth.account_unavailable'));
        return;
      }

      // Doctor verification (only when checkbox is ticked)
      if (isDoctor) {
        try {
          const dref = doc(db, 'doctorCodes', cred.user.uid);
          const dsnap = await getDoc(dref);
          if (!dsnap.exists() || dsnap.data()?.active === false) {
            await blockAndExplain(i18n.t('auth.account_not_configured'));
            return;
          }
          const expected = dsnap.data().codeHash;
          const actual = await sha256Hex(doctorCode.trim());
          if (!doctorCode.trim() || expected !== actual) {
            await blockAndExplain(i18n.t('auth.invalid_doctor_code'));
            return;
          }
          // Mark role as doctor on successful verification
          const doctorOk = true;
        } catch (e) {
          console.error(e);
          await blockAndExplain(i18n.t('auth.doctor_verification_failed'));
          return;
        }
      }

      onAuthed?.(cred.user, { doctorSessionOk: isDoctor ? true : false });


          if (isDoctor) {
          sessionStorage.setItem("doctorSessionOk", "1");

          window.location.reload();
      } else {
          sessionStorage.removeItem("doctorSessionOk");
      }
    } catch (err) {
      console.error(err);
      const code = err?.code || '';
          if (
            code === 'auth/wrong-password' ||
            code === 'auth/invalid-credential' ||
            code === 'auth/invalid-login-credentials'
          ) {
            setAuthError(i18n.t('auth.incorrect_credentials'));
          } else if (code === 'auth/user-not-found') {
            setAuthError(i18n.t('auth.no_account'));
          } else {
            // Fallback: check if email exists to give better hint  
            try {
              const methods = await fetchSignInMethodsForEmail(
                auth,
                email.trim().toLowerCase()
              );
             setAuthError(methods.length === 0 ? i18n.t('auth.no_account') : humanizeAuthError(err));
            } catch {
              setAuthError(humanizeAuthError(err));
            }
          }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap fade-in">
      <div className={`auth-card ${mode === 'login' ? 'is-login' : 'is-register'}`}>
        <LangSwitchAuth />
        <h1 className="auth-title">{mode === 'login' ? t('sign_in') : t('sign_up')}</h1>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            disabled={busy}
          >
            {t('sign_in')}
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
            disabled={busy}
          >
            {t('sign_up')}
          </button>
        </div>

        <form
          className="auth-form"
          id={`auth-${mode}-${nonce}`}
          onSubmit={handleSubmit}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        >
          {mode === 'login' &&  (
  <>
                {/* Logo */}
                <div className="brand-box">
                  <img src={logo} alt="UrsaCortex" className="brand-logo-xl" />
                  <div className="brand-name">UC Diagnostics</div>
                </div>

                {/* Email */}
                <div className="auth-field with-ico">
                  <label htmlFor={`login-email-${nonce}`}></label>
                  <img className="ico" aria-hidden src={mailIco} alt="" />
                  <input
                    id={`login-email-${nonce}`}
                    name={fieldName('email')}
                    type="email"
                    placeholder={t('auth.email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={busy}
                    required
                    autoComplete="username"
                    inputMode="email"
                  />
                </div>

                {/* Password */}
                  <div className="auth-field with-ico">
                  <label htmlFor={`login-pass-${nonce}`}></label>
                  <img className="ico" aria-hidden src={lockIco} alt="" />
                  <input
                    id={`login-pass-${nonce}`}
                    name={fieldName('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder={t('auth.password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                    required
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="toggle-visibility"
                    aria-label={showPass ? t('auth.hide_password') : t('auth.show_password')}
                    aria-pressed={showPass}
                    onMouseDown={() => setShowPass(true)}
                    onMouseUp={() => setShowPass(false)}
                    onMouseLeave={() => setShowPass(false)}
                    onTouchStart={() => setShowPass(true)}
                    onTouchEnd={() => setShowPass(false)}
                  >
                    <img
                      src={showPass ? eyeOpen : eyeClosed}
                      alt=""
                      className="toggle-visibility-ico"
                      draggable="false"
                    />
                  </button>
                </div>

                
               

                
                {isDoctor && (
                  <div className="auth-field with-ico">
                    <label htmlFor={`doc-code-${nonce}`}></label>
                    <img className="ico" aria-hidden src={codeIco} alt="" />
                    <input
                      id={`doc-code-${nonce}`}
                      type="password"
                      placeholder={t('auth.doctor_code_placeholder')}
                      value={doctorCode}
                      onChange={(e)=>setDoctorCode(e.target.value)}
                      disabled={busy}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      required
                    />
                  </div>
                )}
                    <div className="auth-actions">
                  <button type="submit" className="primary-btn" disabled={busy}>
                    {busy ? t('signing_in') : t('login')}
                  </button>
                </div>
                <div className="doctor-and-forgot">
                    <label className="doctor-check">
                      <input
                        type="checkbox"
                        checked={isDoctor}
                        onChange={(e)=>setIsDoctor(e.target.checked)}
                        disabled={busy}
                      />
                      <span className="box" aria-hidden="true"></span>
                      <span className="text">{t('auth.im_doctor')}</span>
                    </label>

                     <a
                        className="forgot-link"
                        href="#"
                        onClick={(e) => { e.preventDefault(); setShowReset(true); }}
                      >
                      {t('forgot')}
                    </a>
                  </div> 
                  {authError && (
                <div className="auth-field">
                  <div className="auth-error" aria-live="polite">{authError}</div>
                </div>
              )}
              </>
              
            )}
                 

          {mode === 'register' && (
            <>
              <div className="two-cols">
                <div className="auth-field">
                  <label htmlFor={`reg-first-${nonce}`}></label>
                  <input
                    id={`reg-first-${nonce}`}
                    name={fieldName('given-name')}
                    type="text"
                    placeholder={t('reg.first_name_ph')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={busy}
                    autoComplete="off"
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor={`reg-last-${nonce}`}></label>
                  <input
                    id={`reg-last-${nonce}`}
                    name={fieldName('family-name')}
                    type="text"
                    placeholder={t('reg.last_name_ph')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={busy}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="two-cols">
                <div className="auth-field">
                  
                  <div className="gender-row">
                    <button
                      type="button"
                      className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                      onClick={() => setGender('male')}
                      disabled={busy}
                    >
                      {t('reg.male')}
                    </button>
                    <button
                      type="button"
                      className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                      onClick={() => setGender('female')}
                      disabled={busy}
                    >
                      {t('reg.female')}
                    </button>
                  </div>
                </div>

                 <div className="auth-field">
                  <label htmlFor={`reg-dob-${nonce}`}></label>
                  <input
                    id={`reg-dob-${nonce}`}
                    name={fieldName('bday')}
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    disabled={busy}
                    required
                    autoComplete="bday"
                    lang={i18n.language}
                  />
                </div>
              </div>

              <div className="two-cols">
                <div className="auth-field">
                  <label htmlFor={`reg-phone-${nonce}`}></label>
                  <input
                    id={`reg-phone-${nonce}`}
                    name={fieldName('tel')}
                    type="tel"
                    placeholder={t('reg.phone_ph')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={busy}
                    autoComplete="off"
                    inputMode="tel"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor={`reg-email-${nonce}`}></label>
                  <input
                    id={`reg-email-${nonce}`}
                    name={fieldName('email')}
                    type="email"
                    placeholder={t('auth.email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={busy}
                    autoComplete="username"
                    inputMode="email"
                  />
                </div>
              </div>

              {/* two password fields: left = password, right = confirmation */}
              <div className="two-cols">
                <div className="auth-field">
                  <label htmlFor={`reg-pass-${nonce}`}></label>
                  <input
                    id={`reg-pass-${nonce}`}
                    name={fieldName('new-password')}
                    type="password"
                    placeholder={t('reg.create_password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                    required
                    autoComplete="new-password"
                    inputMode="text"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor={`reg-pass2-${nonce}`}></label>
                  <input
                    id={`reg-pass2-${nonce}`}
                    name={fieldName('confirm-password')}
                    type="password"
                    placeholder={t('reg.repeat_password')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={busy}
                    required
                    autoComplete="new-password"
                    inputMode="text"
                  />
                </div>
              </div>

              {/* Error stays inside .auth-field to avoid layout shift */}
              {authError && (
                <div className="auth-field">
                  <div className="auth-error" aria-live="polite">{authError}</div>
                </div>
              )}

              <div className="auth-info">{t('reg.notice')}</div>

              <div className="auth-actions">
                <button type="submit" className="primary-btn" disabled={busy}>
                   {busy ? t('reg.creating') : t('sign_up')}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {showError && (
        <UserErrorModal onClose={() => setShowError(false)} missingFields={missingFields} />
      )}
      {invalidAgeError && (
        <UserErrorModal
          onClose={() => setInvalidAgeError(false)}
          missingFields={['Age must be between 8 and 89 years']}
        />
      )}

      
          {showReset && (
            <ResetPasswordModal
              initialEmail={email}
              onClose={() => setShowReset(false)}
            />
          )}
    </div>
  );
}
