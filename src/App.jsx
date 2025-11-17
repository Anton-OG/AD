// App.jsx
import React, { useEffect, useState } from 'react';
import './App.css';
import './i18n';

import Header from './components/Header.jsx';
import Footer from './components/Footer';
import AuthScreen from './components/AuthScreen.jsx';
import Dashboard from './components/Dashboard.jsx';
import Doctor from './Doctor/Doctor.jsx';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase.js';
import { doc, getDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [isDoctor, setIsDoctor] = useState(false);

  const [loading, setLoading] = useState(true);       // firebase init
  const [roleLoading, setRoleLoading] = useState(true); // check doctor role

  // 💀 КОСТЫЛЬ: задержка рендера после логина
  const [postLoginDelay, setPostLoginDelay] = useState(true);

  // =============================
  // AUTH LISTENER
  // =============================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setIsDoctor(false);
        setLoading(false);
        setRoleLoading(false);
        setPostLoginDelay(false);
        return;
      }

      setUser(u);
      setRoleLoading(true);

      try {
        const snap = await getDoc(doc(db, "doctorCodes", u.uid));
        setIsDoctor(snap.exists());
      } catch {
        setIsDoctor(false);
      }

      setRoleLoading(false);
      setLoading(false);

      
      setTimeout(() => {
        setPostLoginDelay(false);
      }, 100);  
    });

    return () => unsub();
  }, []);

  // =============================
  // LOGOUT
  // =============================
  const handleLogout = async () => {
    try { await signOut(auth); } catch {}
    setUser(null);
    setIsDoctor(false);
    setPostLoginDelay(false);
  };

  // =============================
  // СПЛЭШ ПОКА ЗАДЕРЖКА ИЛИ ЛОАДИНГ
  // =============================
  if (loading || roleLoading || postLoginDelay) {
    return (
      <div className="splash">
        <div className="spinner" />
      </div>
    );
  }

  // =============================
  // AUTH SCREEN
  // =============================
  if (!user) {
    return (
      <div className="app-shell">
        <main className="app-main">
          <div className="app-container">
            <AuthScreen />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // =============================
  // LOGGED IN
  // =============================
  return (
    <div className="app-shell">
      <Header user={user} onLogout={handleLogout} />

      <main className="app-main">
        <div className="app-container">
          {isDoctor ? <Doctor user={user} /> : <Dashboard user={user} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
