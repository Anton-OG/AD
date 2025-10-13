// src/components/AuthScreen.jsx
import React, { useState } from 'react';
import './styles/AuthScreen.css';

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// === reuse your country select exactly like in UserDetailsForm ===
import Select from 'react-select';
import selectStyles from './styles/selectStyles.js';  
import countries from '../data/countries.json';

function toOptions(list) {
  // robust transform: supports ["Slovakia", ...] or [{name:"Slovakia"}, ...] or [{label, value}]
  return (Array.isArray(list) ? list : [])
    .map((c) => {
      if (typeof c === 'string') return { value: c, label: c };
      const value = c?.value ?? c?.name ?? c?.label;
      const label = c?.label ?? c?.name ?? c?.value;
      return value ? { value, label } : null;
    })
    .filter(Boolean);
}
const countryOptions = toOptions(countries);

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // common
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // registration-only fields
  const [gender, setGender] = useState('');    // 'male' | 'female'
  const [age, setAge] = useState('');
  const [country, setCountry] = useState(null); // react-select option {value,label}
  const [phone, setPhone] = useState('');

  const switchMode = (m) => {
    setMode(m);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const auth = getAuth();

      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
        onAuthed?.();
      } else {
        // validate extra fields
        if (!gender) throw new Error('Please select your gender.');
        const nAge = Number(age);
        if (!nAge || nAge < 1 || nAge > 120) throw new Error('Please enter a valid age.');
        if (!country?.value) throw new Error('Please select your country.');

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);

        // save profile to Firestore
        const payload = {
          email: email.trim(),
          gender,
          age: nAge,
          country: country.value,
          phone: phone.trim() || null,
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', cred.user.uid), payload);

        onAuthed?.();
      }
    } catch (err) {
      setError(err?.message || 'Authentication error');
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
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
            disabled={busy}
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
            type="button"
            disabled={busy}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* email & password (both modes) */}
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

          {/* registration-only fields */}
          {mode === 'register' && (
            <>
              <div className="auth-field">
                <label>Gender</label>
                <div className="gender-row">
                  <button
                    type="button"
                    className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                    onClick={() => setGender('male')}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                    onClick={() => setGender('female')}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label>Age</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Enter age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={1}
                  max={120}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Country</label>
                <Select
                  options={countryOptions}
                  styles={selectStyles}
                  placeholder="Select your country..."
                  value={country}
                  onChange={(opt) => setCountry(opt)}
                  isSearchable
                />
              </div>

              <div className="auth-field">
                <label>Phone number (optional)</label>
                <input
                  type="tel"
                  placeholder="+421 900 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>

              <p className="auth-note">
                This information will be used solely for research purposes and will remain anonymous.
              </p>
            </>
          )}

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-actions">
            <button className="auth-button" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
