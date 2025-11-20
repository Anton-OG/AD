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
  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [postLoginDelay, setPostLoginDelay] = useState(true);

  // ⭐ NEW: Firestore profile
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // =============================
  // AUTH LISTENER
  // =============================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setProfile(null);
        setRoleLoading(false);
        setLoading(false);
        setPostLoginDelay(false);
        return;
      }

      setUser(u);

      setRoleLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const data = snap.data();
        setRole(data?.role || "user");
      } catch {
        setRole("user");
      }
      setRoleLoading(false);

      setLoading(false);
      setTimeout(() => setPostLoginDelay(false), 100);
    });

    return () => unsub();
  }, []);

  // =============================
  // LOAD FIRESTORE PROFILE
  // =============================
  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      const snap = await getDoc(doc(db, "users", user.uid));
      setProfile(snap.data());
      setProfileLoading(false);
    }

    loadProfile();
  }, [user]);

  // =============================
  // LOGOUT
  // =============================
  const handleLogout = async () => {
    try { await signOut(auth); } catch {}
    setUser(null);
    setRole(null);
    setProfile(null);
    setPostLoginDelay(false);
  };

  // =============================
  // GLOBAL SPLASH
  // =============================
if (loading || roleLoading || postLoginDelay || (user && profileLoading)) {
      console.log({
    loading,
    roleLoading,
    postLoginDelay,
    profileLoading,
    user,
    role,
    profile
  });
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
            <AuthScreen
              onAuthed={(user, extra) => {
                if (extra?.doctorSessionOk) {
                  sessionStorage.setItem("doctorSessionOk", "1");
                } else {
                  sessionStorage.removeItem("doctorSessionOk");
                }
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // =============================
  // FIRESTORE VALIDATION CHECK
  // =============================
// 1. Если доктор активировал — сразу пропускаем
if (profile?.validated === true) {
  // ничего не делаем — просто продолжаем вниз,
  // НО НЕ ПРОВЕРЯЕМ emailVerified
} 
// 2. Если профиль НЕ активирован доктором → требуем подтверждение email
else if (!auth.currentUser.emailVerified) {
  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="app-container">
          <AuthScreen forceMessage="Please verify your email to continue." />
        </div>
      </main>
      <Footer />
    </div>
  );
}


  // =============================
  // DOCTOR MODE PRIORITY LOGIC
  // =============================
  const doctorIntent = sessionStorage.getItem("doctorIntent") === "1";
  const doctorOk = sessionStorage.getItem("doctorSessionOk") === "1";

  if (doctorIntent) {
    if (doctorOk && role === "admin") {
      return (
        <div className="app-shell">
          <Header user={user} onLogout={handleLogout} />
          <main className="app-main">
            <div className="app-container">
              <Doctor user={user} />
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    return (
      <div className="splash">
        <div className="spinner" />
      </div>
    );
  }

  // =============================
  // NORMAL USER FLOW
  // =============================
  return (
    <div className="app-shell">
      <Header user={user} onLogout={handleLogout} />
      <main className="app-main">
        <div className="app-container">
          {role === "admin" && doctorOk
            ? <Doctor user={user} />
            : <Dashboard user={user} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
