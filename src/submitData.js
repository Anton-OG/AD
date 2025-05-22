// src/submitData.js
import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function submitUserData({ gender, age, country, description, time }) {
  try {
    await addDoc(collection(db, "user_responses"), {
      gender,
      age: Number(age),
      countryLabel: country.label,
      countryCode: country.value,
      description,
      time,
      createdAt: Timestamp.now()
    });
    console.log("✅ Данные успешно записаны в Firestore");
  } catch (error) {
    console.error("❌ Ошибка при записи в Firestore:", error);
  }
}
