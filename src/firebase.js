import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCZTYP_USocYLLKYEEySBbpmYvfokcplt4",
  authDomain: "alzheimer-s-disease-8b56c.firebaseapp.com",
  projectId: "alzheimer-s-disease-8b56c",
  storageBucket: "alzheimer-s-disease-8b56c.firebasestorage.app",
  messagingSenderId: "630468673764",
  appId: "1:630468673764:web:fcaa95e815917cd669acf1",
  measurementId: "G-PY85LYZMJM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// 🔒 сохраняем вход между перезагрузками
setPersistence(auth, browserLocalPersistence).catch(() => {});

export const db   = getFirestore(app);
