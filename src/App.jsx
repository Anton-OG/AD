// App.jsx
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import './i18n';

import Header from './components/Header.jsx';
import Footer from './components/Footer';
import AuthScreen from './components/AuthScreen.jsx';
import Dashboard from './components/Dashboard.jsx';
import Doctor from './Doctor/Doctor.jsx';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase.js';
import { doc, onSnapshot, collection, query, where, getDocs, limit } from 'firebase/firestore';
export default function App() {
 const doctorLoginIntent =
  typeof window !== 'undefined' && sessionStorage.getItem('doctorIntent') === '1';
  // Flag that doctor login was requested and is in progress  
  const [doctorSessionOk, setDoctorSessionOk] = useState(false);
  // Firebase user object (null when signed out or not verified)
  const [user, setUser] = useState(null);
  // Role loaded from Firestore: "doctor" | "user" | null (loading)
  const [role, setRole] = useState(null);
  // Flag that auth state initialization has completed
  const [authReady, setAuthReady] = useState(false);

  // unsubscribe ref for role snapshot
  const roleUnsubRef = useRef(null);

  // Inactivity auto-logout (30 minutes)
  const inactivityRef = useRef(null);
  const IDLE_MS = 30 * 60 * 1000;
  const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'visibilitychange'];

  const resetIdleTimer = () => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(async () => {
      try { await signOut(auth); } catch {}
    }, IDLE_MS);
  };

  const startInactivityWatcher = () => {
    stopInactivityWatcher();
    activityEvents.forEach((ev) => {
      const target = ev === 'visibilitychange' ? document : window;
      target.addEventListener(ev, resetIdleTimer, { passive: true });
    });
    resetIdleTimer();
  };

  const stopInactivityWatcher = () => {
    activityEvents.forEach((ev) => {
      const target = ev === 'visibilitychange' ? document : window;
      target.removeEventListener(ev, resetIdleTimer);
    });
    if (inactivityRef.current) {
      clearTimeout(inactivityRef.current);
      inactivityRef.current = null;
    }
  };

  const handleLogout = async () => {
    stopInactivityWatcher();
    setDoctorSessionOk(false);
    try { sessionStorage.removeItem('doctorIntent'); await signOut(auth); } catch {}
  };

  // Listen for Firebase auth state changes and SUBSCRIBE to users/{uid} for live role updates
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      // clean previous role subscription
      if (roleUnsubRef.current) {
        roleUnsubRef.current();
        roleUnsubRef.current = null;
      }

      if (u && u.emailVerified) {
        setUser(u);
        startInactivityWatcher();
        setRole(null); // show spinner until first role snapshot arrives

        // realtime role subscription — updates immediately after doctor verification
        const ref = doc(db, 'users', u.uid);
        roleUnsubRef.current = onSnapshot(
          ref,
          (snap) => {
            const r = snap.exists() ? snap.data()?.role : null;
            setRole(r || 'user'); // default to "user" if role not set
          },
          () => setRole('user')
        );
      } else {
        setUser(null);
        setRole(null);
        stopInactivityWatcher();
      }
      setAuthReady(true);
    });

    return () => {
      unsubAuth();
      if (roleUnsubRef.current) {
        roleUnsubRef.current();
        roleUnsubRef.current = null;
      }
    };
  }, []);

  // Initial splash while auth is initializing
  if (!authReady) {
    return (
      <div className="splash">
        <div className="spinner" />
      </div>
    );
  }

  // If we have a user but role hasn't loaded yet, keep showing the spinner
  if (user && role == null) {
    return (
      <div className="splash">
        <div className="spinner" />
      </div>
    );
  }

  if (user && doctorLoginIntent && !doctorSessionOk) {
  return (
    <div className="splash">
      <div className="spinner" />
    </div>
  );
  }
  return (
    <div className="app-shell">
      {user && <Header user={user} onLogout={handleLogout} />}

      <main className="app-main">
        <div className="app-container">
          {!user ? (
             <AuthScreen
              onAuthed={(_, meta) => {
                const ok = !!meta?.doctorSessionOk;
                setDoctorSessionOk(ok);
                if (ok) sessionStorage.removeItem('doctorIntent');
              }}
            />
          ) : (
            doctorSessionOk ? <Doctor user={user} /> : <Dashboard user={user} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
