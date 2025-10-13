import React, { useState } from 'react';
import './styles/AuthScreen.css';

import Select from 'react-select';
import selectStyles from './styles/selectStyles.js';
import flags from '../data/countries_with_flags.json';

import UserErrorModal from './UserErrorModal.jsx';

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // common
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  // register extras
  const [gender, setGender] = useState(''); // 'Male' | 'Female'
  const [age, setAge] = useState('');
  const [country, setCountry] = useState(null); // { value, label, flagUrl }
  const [phone, setPhone] = useState('');

  // modal errors (как в анкете)
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

      if (!gender) errs.push('Gender');
      if (!age) {
        errs.push('Age');
      } else if (Number.isNaN(ageNum) || ageNum <= 7 || ageNum >= 90) {
        setInvalidAgeError(true);
        return;
      }
      if (!country) errs.push('Country');

      if (errs.length) {
        setMissingFields(errs);
        setShowError(true);
        return;
      }
    }

    setBusy(true);
    try {
      const auth = getAuth();

      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
        onAuthed?.();
        return;
      }

      // register
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);

      await setDoc(doc(db, 'users', cred.user.uid), {
        email: email.trim(),
        gender,
        age: Number(age),
        country: {
          code: country.value,
          name: country.label,
          flagUrl: country.flagUrl || null,
        },
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
      <div className="auth-card compact">
        <div className="auth-head">
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
              Register
            </button>
          </div>
        </div>

        <form className="auth-form form-grid" onSubmit={handleSubmit}>
          {/* Row: Email + Password */}
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
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {/* Registration-only */}
          {mode === 'register' && (
            <>
              {/* Row: Gender (spans 2) */}
              <div className="auth-field span-2">
                <label>Sex</label>
                <div className="gender-row tight">
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

              {/* Row: Age + Phone */}
              <div className="auth-field">
                <label>Age</label>
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
                <label>Phone (optional)</label>
                <input
                  type="tel"
                  placeholder="+421 900 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>

              {/* Row: Country (spans 2) */}
              <div className="auth-field span-2">
                <label>Country</label>
                <Select
                  options={countryOptions}
                  value={country}
                  onChange={(selected) => setCountry(selected)}
                  placeholder="Select your country..."
                  isSearchable
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  formatOptionLabel={({ label, flagUrl, value }) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {flagUrl ? (
                        <img
                          src={flagUrl}
                          alt=""
                          style={{ width: 18, height: 13, borderRadius: 2 }}
                        />
                      ) : null}
                      <span>{label}</span>
                      {value ? (
                        <span style={{ marginLeft: 'auto', opacity: 0.7, fontSize: 12 }}>
                          {value}
                        </span>
                      ) : null}
                    </div>
                  )}
                  // search by name and code (RU/UA/SK…)
                  filterOption={(opt, raw) => {
                    const q = (raw || '').trim().toLowerCase();
                    if (!q) return true;
                    const name = (opt.label || '').toLowerCase();
                    const code = (opt.data?.value || opt.value || '').toString().toLowerCase();
                    return name.includes(q) || code.includes(q);
                  }}
                />
              </div>

              {/* Row: tiny note (spans 2) */}
              <p className="auth-note span-2">
                This information will be used solely for research purposes and will remain anonymous.
              </p>
            </>
          )}

          {authError && <div className="auth-error span-2">{authError}</div>}

          <div className="auth-actions span-2">
            <button className="auth-button" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </form>
      </div>

      {/* error modals like in your form */}
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
