import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import Header from './components/Header.jsx';
import Footer from './components/Footer';
import AuthScreen from './components/AuthScreen.jsx';
import Dashboard from './components/Dashboard.jsx';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  
  const inactivityRef = useRef(null);
  const IDLE_MS = 30 * 60 * 1000;
  const activityEvents = ['mousemove','keydown','click','scroll','touchstart','visibilitychange'];

  const resetIdleTimer = () => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(async () => { try { await signOut(auth); } catch {} }, IDLE_MS);
  };

  const startInactivityWatcher = () => {
    stopInactivityWatcher();
    activityEvents.forEach(ev => {
      const target = ev === 'visibilitychange' ? document : window;
      target.addEventListener(ev, resetIdleTimer, { passive: true });
    });
    resetIdleTimer();
  };

  const stopInactivityWatcher = () => {
    activityEvents.forEach(ev => {
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
    try { await signOut(auth); } catch {}
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && u.emailVerified) {
        setUser(u);
        startInactivityWatcher();
      } else {
        setUser(null);
        stopInactivityWatcher();
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  if (!authReady) {
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
            <AuthScreen onAuthed={() => {}} />
          ) : (
            <Dashboard user={user} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
