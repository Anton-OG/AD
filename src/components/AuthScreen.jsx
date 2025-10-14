import React, { useMemo, useState } from 'react';
import './styles/AuthScreen.css';

import UserErrorModal from './UserErrorModal.jsx';

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

const DOCTOR_CODE = 'YOUR_SECRET_DOCTOR_CODE';

// Human-readable (EN) Firebase auth errors
const humanizeAuthError = (err) => {
  const code =
    err?.code || (String(err?.message || '').match(/auth\/[a-z-]+/i) || [])[0];
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Weak password (minimum 6 characters).';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Authentication error. Please try again.';
  }
};

export default function AuthScreen({ onAuthed }) {
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
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // modals
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
    setIsDoctor(false);
    setDoctorCode('');
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

  // helper: force sign-out and show message
  const blockAndExplain = async (msg) => {
    try {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (mode === 'register') {
      // 1) collect missing fields (show modal first)
      const first = firstName.trim();
      const last = lastName.trim();
      const em = email.trim();
      const ph = phone.trim();
      const ageRaw = age; // '' or string number

      const errs = [];
      if (!first) errs.push('First name');
      if (!last) errs.push('Last name');
      if (!gender) errs.push('Sex');
      if (ageRaw === '') errs.push('Age'); // check emptiness before numeric checks
      if (!em) errs.push('Email');
      if (!password) errs.push('Password');
      if (!confirmPassword) errs.push('Confirm password');

      if (errs.length) {
        setMissingFields(errs);
        setShowError(true);
        return;
      }

      // 2) specific validation (age range, passwords match)
      const ageNum = Number(ageRaw);
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
        await blockAndExplain(`We sent a verification link to ${em}. Please verify your email, then sign in.`);
        return;
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

      // Try to sign in first (avoid false negatives)
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // block if email is not verified
      try { await reload(cred.user); } catch {}
      if (!cred.user.emailVerified) {
        try {
          auth.useDeviceLanguage?.();
          await sendEmailVerification(cred.user, {
            url: `${window.location.origin}/`,
            handleCodeInApp: false,
          });
        } catch {}
        await blockAndExplain('Please verify your email. We just re-sent the verification link.');
        return;
      }

      // allow only if profile document exists
      const exists = await userDocExists(cred.user.uid);
      if (!exists) {
        await blockAndExplain(
          'This account is no longer available. Please contact support.'
        );
        return;
      }

      // Doctor verification (only when checkbox is ticked)
      if (isDoctor) {
        try {
          const dref = doc(db, 'doctorCodes', cred.user.uid);
          const dsnap = await getDoc(dref);
          if (!dsnap.exists() || dsnap.data()?.active === false) {
            await blockAndExplain('Doctor account is not configured. Contact admin.');
            return;
          }
          const expected = dsnap.data().codeHash;
          const actual = await sha256Hex(doctorCode.trim());
          if (!doctorCode.trim() || expected !== actual) {
            await blockAndExplain('Invalid doctor code.');
            return;
          }
          // Mark role as doctor on successful verification
          await setDoc(doc(db, 'users', cred.user.uid), { role: 'doctor' }, { merge: true });
        } catch (e) {
          console.error(e);
          await blockAndExplain('Doctor verification failed. Try again later.');
          return;
        }
      }

      onAuthed?.(cred.user);
    } catch (err) {
      console.error(err);
      // Disambiguate after failure: does this email exist?
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email.trim());
        if (methods.length === 0) {
          setAuthError('No account found with this email.');
        } else if (
          err?.code === 'auth/wrong-password' ||
          err?.code === 'auth/invalid-credential' ||
          err?.code === 'auth/invalid-login-credentials'
        ) {
          setAuthError('Incorrect password.');
        } else {
          setAuthError(humanizeAuthError(err));
        }
      } catch {
        setAuthError(humanizeAuthError(err));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap fade-in">
      <div className={`auth-card ${mode === 'login' ? 'is-login' : 'is-register'}`}>
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

              {/* Doctor portal */}
             
                    <div className="auth-field doctor-row">
                      <label className="doctor-toggle">
                        <input
                          type="checkbox"
                          checked={isDoctor}
                          onChange={(e)=>setIsDoctor(e.target.checked)}
                          disabled={busy}
                        />
                        <span className="doctor-badge">I am a doctor</span>
                      </label>
                    </div>
              {isDoctor && (
                <div className="auth-field">
                  <label htmlFor={`doc-code-${nonce}`}>Doctor code</label>
                  <input
                    id={`doc-code-${nonce}`}
                    type="password"
                    placeholder="Enter your doctor code"
                    value={doctorCode}
                    onChange={(e)=>setDoctorCode(e.target.value)}
                    disabled={busy}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                </div>
              )}

              {/* Error stays inside .auth-field to avoid layout shift */}
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

              {/* two password fields: left = password, right = confirmation */}
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

              {/* Error stays inside .auth-field to avoid layout shift */}
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
