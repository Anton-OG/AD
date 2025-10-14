// src/submitData.js
import { auth, db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from 'firebase/firestore';

export async function submitUserData({ gender, age, description, time, language }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const data = {
    uid: user.uid,
    language: language ?? null,
    gender: gender ?? null,
    age: Number.isFinite(Number(age)) ? Number(age) : null,
    description: (description ?? '').toString(),
    time: Number.isFinite(Number(time)) ? Number(time) : null,
    createdAt: serverTimestamp(),
  };

  // новая запись в историю тестов пользователя
  const testsCol = collection(db, 'users', user.uid, 'tests');
  const ref = await addDoc(testsCol, data);

  // (опционально) обновим счётчик/дату в профиле
  await setDoc(
    doc(db, 'users', user.uid),
    { latestTestAt: serverTimestamp(), testsCount: increment(1) },
    { merge: true }
  );

  return ref.id;
}
