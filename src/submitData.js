// src/submitData.js
import { auth, db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  increment,
} from 'firebase/firestore';


export async function submitUserData({ description, time }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const testDoc = {
    uid: user.uid,
    description: String(description ?? ''),
    time: Number.isFinite(Number(time)) ? Number(time) : null,
    createdAt: serverTimestamp(),
  };

  const testsCol = collection(db, 'users', user.uid, 'tests');
  const ref = await addDoc(testsCol, testDoc);

  
  await setDoc(
    doc(db, 'users', user.uid),
    {
      latestTestAt: serverTimestamp(),
      testsCount: increment(1),
    },
    { merge: true }
  );

  return ref.id;
}


export async function updateTestNumbers({ testId, numbersFound = [], numbersMissing = [] }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  if (!testId) throw new Error('testId is required');

  const sanitize = (arr) =>
    Array.from(new Set((arr || [])
      .map(v => Number(v))
      .filter(n => Number.isFinite(n))))
    .sort((a, b) => a - b);

  const payload = {
    numbersFound: sanitize(numbersFound),
    numbersMissing: sanitize(numbersMissing),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', user.uid, 'tests', testId), payload, { merge: true });
}
