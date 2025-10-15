import React, { useEffect, useMemo, useState } from 'react';
import './styles/AuthScreen.css';
import logo from '../assets/2.png';
import UserErrorModal from './UserErrorModal.jsx';
import ResetPasswordModal from './ResetPasswordModal.jsx';

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
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // modals
  const [showError, setShowError] = useState(false);
  const [invalidAgeError, setInvalidAgeError] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [showReset, setShowReset] = useState(false);
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
          // запомним текст, чтобы он пережил размонтирование компонента
          sessionStorage.setItem('authLastError', msg);
          try {
            sessionStorage.removeItem('doctorIntent');
            await signOut(auth);
          } catch {}
          // если ещё не размонтировались — покажем и локально
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
     setAuthError('Doctor code is required.');
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
        await blockAndExplain(`We sent a verification link to ${em}. Please verify your email, then sign in.`);
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

      if (isDoctor) sessionStorage.setItem('doctorIntent', '1');
     const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
     
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
          const doctorOk = true;
        } catch (e) {
          console.error(e);
          await blockAndExplain('Doctor verification failed. Try again later.');
          return;
        }
      }

      onAuthed?.(cred.user, { doctorSessionOk: isDoctor ? true : false });
    } catch (err) {
      console.error(err);
      const code = err?.code || '';
          if (
            code === 'auth/wrong-password' ||
            code === 'auth/invalid-credential' ||
            code === 'auth/invalid-login-credentials'
          ) {
            setAuthError('Incorrect email or password.');
          } else if (code === 'auth/user-not-found') {
            setAuthError('No account found with this email.');
          } else {
            // Fallback: check if email exists to give better hint  
            try {
              const methods = await fetchSignInMethodsForEmail(
                auth,
                email.trim().toLowerCase()
              );
              setAuthError(methods.length === 0
                ? 'No account found with this email.'
                : humanizeAuthError(err));
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
                {/* БРЕНД-БЛОК */}
                <div className="brand-box">
                  <img src={logo} alt="UrsaCortex" className="brand-logo-xl" />
                  <div className="brand-name">UrsaCortex Labs</div>
                </div>

                {/* Email */}
                <div className="auth-field with-ico">
                  <label htmlFor={`login-email-${nonce}`}></label>
                  <span className="ico" aria-hidden>📧</span>
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

                {/* Password */}
                <div className="auth-field with-ico">
                  <label htmlFor={`login-pass-${nonce}`}></label>
                  <span className="ico" aria-hidden>🔒</span>
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
                  />
                </div>

                
               

                {/* Поле кода врача показываем ТОЛЬКО при включённом тумблере */}
                {isDoctor && (
                  <div className="auth-field with-ico">
                    <label htmlFor={`doc-code-${nonce}`}></label>
                    <span className="ico" aria-hidden>🗝️</span>
                    <input
                      id={`doc-code-${nonce}`}
                      type="password"
                      placeholder="Enter your doctor code"
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
                    {busy ? 'Signing in…' : 'Login'}
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
                      <span className="text">I am a Doctor</span>
                    </label>

                     <a
                        className="forgot-link"
                        href="#"
                        onClick={(e) => { e.preventDefault(); setShowReset(true); }}
                      >
                      Forgot Password?
                    </a>
                  </div>
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
                    placeholder="Enter your first name"
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
                    lang="en"
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
                    placeholder="+421 900 000 000"
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
                  <label htmlFor={`reg-pass-${nonce}`}></label>
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
                  <label htmlFor={`reg-pass2-${nonce}`}></label>
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

      
          {showReset && (
            <ResetPasswordModal
              initialEmail={email}
              onClose={() => setShowReset(false)}
            />
          )}
    </div>
  );
}

