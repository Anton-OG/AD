import React, { useMemo, useState } from 'react';
import './styles/AuthScreen.css';

import UserErrorModal from './UserErrorModal.jsx';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../firebase.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Читабельные тексты ошибок Firebase
const humanizeAuthError = (err) => {
  const code = err?.code || (String(err?.message || '').match(/auth\/[a-z-]+/i) || [])[0];
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Неверный email или пароль.';
    case 'auth/invalid-email':
      return 'Некорректный адрес email.';
    case 'auth/email-already-in-use':
      return 'Этот email уже используется.';
    case 'auth/weak-password':
      return 'Слабый пароль (минимум 6 символов).';
    case 'auth/too-many-requests':
      return 'Слишком много попыток. Попробуйте позже.';
    case 'auth/network-request-failed':
      return 'Проблема с сетью. Проверьте подключение.';
    default:
      return 'Ошибка авторизации. Попробуйте ещё раз.';
  }
};

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  // shared
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // register-only
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [gender, setGender]       = useState(''); // 'male' | 'female'
  const [age, setAge]             = useState('');
  const [phone, setPhone]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // модалки
  const [showError, setShowError] = useState(false);
  const [invalidAgeError, setInvalidAgeError] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (mode === 'register') {
      const errs = [];
      if (!firstName.trim()) errs.push('First name');
      if (!lastName.trim())  errs.push('Last name');
      if (!gender)           errs.push('Sex');
      if (!age)              errs.push('Age');
      if (!email.trim())     errs.push('Email');
      if (!password)         errs.push('Password');
      if (!confirmPassword)  errs.push('Confirm password');

      const ageNum = Number(age);
      if (!Number.isFinite(ageNum) || ageNum < 8 || ageNum > 89) {
        setInvalidAgeError(true);
        return;
      }
      if (password && confirmPassword && password !== confirmPassword) {
        setAuthError('Пароли не совпадают.');
        return;
      }
      if (errs.length) {
        setMissingFields(errs);
        setShowError(true);
        return;
      }

      try {
        setBusy(true);
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, {
          displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        });

        const userRef = doc(db, 'users', cred.user.uid);
        await setDoc(userRef, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender,
          age: ageNum,
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          createdAt: serverTimestamp(),
        });

        onAuthed?.(cred.user);
      } catch (err) {
        console.error(err);
        setAuthError(humanizeAuthError(err));
      } finally {
        setBusy(false);
      }
      return;
    }

    // login
    try {
      setBusy(true);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      onAuthed?.(cred.user);
    } catch (err) {
      console.error(err);
      setAuthError(humanizeAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap fade-in">
      <div className="auth-card">
        <h1 className="auth-title">{mode === 'login' ? 'Sign in' : 'Create account'}</h1>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            disabled={busy}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
            disabled={busy}
          >
            Sign up
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
          {mode === 'login' && (
            <>
              <div className="auth-field">
                <label htmlFor={`login-email-${nonce}`}>Email</label>
                <input
                  id={`login-email-${nonce}`}
                  name={fieldName('email')}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  required
                  autoComplete="username"
                  inputMode="email"
                />
              </div>

              <div className="auth-field">
                <label htmlFor={`login-pass-${nonce}`}>Password</label>
                <input
                  id={`login-pass-${nonce}`}
                  name={fieldName('password')}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  required
                  autoComplete="current-password"
                  inputMode="text"
                />
              </div>

              {/* Ошибка — в .auth-field, чтобы не растягивалась */}
              {authError && (
                <div className="auth-field">
                  <div className="auth-error" aria-live="polite">{authError}</div>
                </div>
              )}

              <div className="auth-actions">
                <button type="submit" className="primary-btn" disabled={busy}>
                  {busy ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              <div className="two-cols">
                <div className="auth-field">
                  <label htmlFor={`reg-first-${nonce}`}>First name</label>
                  <input
                    id={`reg-first-${nonce}`}
                    name={fieldName('given-name')}
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={busy}
                    autoComplete="off"
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor={`reg-last-${nonce}`}>Last name</label>
                  <input
                    id={`reg-last-${nonce}`}
                    name={fieldName('family-name')}
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={busy}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="two-cols">
                <div className="auth-field">
                  <label>Sex:</label>
                  <div className="gender-row">
                    <button
                      type="button"
                      className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                      onClick={() => setGender('male')}
                      disabled={busy}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                      onClick={() => setGender('female')}
                      disabled={busy}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor={`reg-age-${nonce}`}>Enter your age:</label>
                  <input
                    id={`reg-age-${nonce}`}
                    name={fieldName('age')}
                    type="number"
                    inputMode="numeric"
                    min="8"
                    max="89"
                    placeholder="Enter age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={busy}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="two-cols">
                <div className="auth-field">
                  <label htmlFor={`reg-phone-${nonce}`}>Phone (optional)</label>
                  <input
                    id={`reg-phone-${nonce}`}
                    name={fieldName('tel')}
                    type="tel"
                    placeholder="+421 900 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={busy}
                    autoComplete="off"
                    inputMode="tel"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor={`reg-email-${nonce}`}>Email</label>
                  <input
                    id={`reg-email-${nonce}`}
                    name={fieldName('email')}
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={busy}
                    autoComplete="username"
                    inputMode="email"
                  />
                </div>
              </div>

              {/* два поля пароля: слева пароль, справа подтверждение */}
              <div className="two-cols">
                <div className="auth-field">
                  <label htmlFor={`reg-pass-${nonce}`}>Password</label>
                  <input
                    id={`reg-pass-${nonce}`}
                    name={fieldName('new-password')}
                    type="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                    required
                    autoComplete="new-password"
                    inputMode="text"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor={`reg-pass2-${nonce}`}>Confirm password</label>
                  <input
                    id={`reg-pass2-${nonce}`}
                    name={fieldName('confirm-password')}
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={busy}
                    required
                    autoComplete="new-password"
                    inputMode="text"
                  />
                </div>
              </div>

              {/* Ошибка — в .auth-field, чтобы не растягивалась */}
              {authError && (
                <div className="auth-field">
                  <div className="auth-error" aria-live="polite">{authError}</div>
                </div>
              )}

              <div className="auth-info">
                This information will be used solely for research purposes and will remain anonymous.
              </div>

              <div className="auth-actions">
                <button type="submit" className="primary-btn" disabled={busy}>
                  {busy ? 'Creating…' : 'Sign up'}
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
    </div>
  );
}
