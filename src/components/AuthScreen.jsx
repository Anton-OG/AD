import React, { useState } from 'react';
import './styles/AuthScreen.css';

import Select from 'react-select';
import selectStyles from './styles/selectStyles.js';
import flags from '../data/countries_with_flags.json';

import UserErrorModal from './UserErrorModal.jsx';

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {auth, db } from '../firebase.js';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login');

  // common
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  // sign up fields
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [gender,    setGender]    = useState('');
  const [age,       setAge]       = useState('');
  const [country,   setCountry]   = useState(null); // { value,label,flagUrl }
  const [phone,     setPhone]     = useState('');

  // modals
  const [showError, setShowError] = useState(false);
  const [invalidAgeError, setInvalidAgeError] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  const countryOptions = flags.map(({ name, code, flagUrl }) => ({
    value: String(code || '').toUpperCase(),
    label: name,
    flagUrl
  }));

  const switchMode = (m) => {
    setMode(m);
    setAuthError('');
    setShowError(false);
    setInvalidAgeError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (mode === 'register') {
      const errs = [];
      const ageNum = parseInt(age, 10);

      if (!firstName.trim()) errs.push('First name');
      if (!lastName.trim())  errs.push('Last name');
      if (!gender)           errs.push('Gender');

      if (!age) {
        errs.push('Age');
      } else if (Number.isNaN(ageNum) || ageNum <= 7 || ageNum >= 90) {
        setInvalidAgeError(true);
        return;
      }
      if (!country) errs.push('Country');

      if (!email)   errs.push('Email');
      if (!pass)    errs.push('Password');
      if (!confirm) errs.push('Confirm password');
      if (pass && confirm && pass !== confirm) {
        setAuthError('Passwords must match');
        return;
      }

      if (errs.length) {
        setMissingFields(errs);
        setShowError(true);
        return;
      }
    }

    setBusy(true);
    try {
     

      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
        onAuthed?.();
        return;
      }

      // sign up
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      try { await updateProfile(cred.user, { displayName }); } catch (_) {}

      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: email.trim(),
        displayName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        age: Number(age),
        country: { code: country.value, name: country.label, flagUrl: country.flagUrl || null },
        phone: phone.trim() || null,
        createdAt: serverTimestamp(),
      });

      onAuthed?.();
    } catch (err) {
      setAuthError(err?.message || 'Authentication error');
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

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'login' && (
            <>
              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="current-password"
                />
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              {/* First & Last */}
              <div className="two-cols">
                <div className="auth-field">
                  <label>First name</label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Last name</label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Sex */}
              <div className="auth-field">
                <label>Sex:</label>
                <div className="gender-row">
                  <button
                    type="button"
                    className={`gender-btn ${gender === 'Male' ? 'active' : ''}`}
                    onClick={() => setGender('Male')}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${gender === 'Female' ? 'active' : ''}`}
                    onClick={() => setGender('Female')}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Age & Country */}
              <div className="two-cols">
                <div className="auth-field">
                  <label>Enter your age:</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter age"
                  />
                </div>
                <div className="auth-field">
                  <label>Select your country:</label>
                  <Select
                    options={countryOptions}
                    value={country}
                    onChange={(selected) => setCountry(selected)}
                    placeholder="Select your country..."
                    isSearchable
                    styles={selectStyles}
                    className="select-field"
                    classNamePrefix="rs"
                    formatOptionLabel={({ label, flagUrl, value }) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {flagUrl ? (
                          <img src={flagUrl} alt="" style={{ width: 20, height: 14, borderRadius: 2 }} />
                        ) : null}
                        <span>{label}</span>
                        {value ? (
                          <span style={{ marginLeft: 'auto', opacity: 0.7, fontSize: 12 }}>{value}</span>
                        ) : null}
                      </div>
                    )}
                    filterOption={(opt, raw) => {
                      const q = (raw || '').trim().toLowerCase();
                      if (!q) return true;
                      const name = (opt.label || '').toLowerCase();
                      const code = (opt.data?.value || opt.value || '').toString().toLowerCase();
                      return name.includes(q) || code.includes(q);
                    }}
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="two-cols">
                <div className="auth-field">
                  <label>Phone (optional)</label>
                  <input
                    type="tel"
                    placeholder="+421 900 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="two-cols">
                <div className="auth-field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div className="auth-field">
                  <label>Confirm password</label>
                  <input
                    type="password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>

              <p className="auth-note">
                This information will be used solely for research purposes and will remain anonymous.
              </p>
            </>
          )}

          {authError && <div className="auth-error">{authError}</div>}

          <div className="auth-actions">
            <button className="auth-button" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          </div>
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
