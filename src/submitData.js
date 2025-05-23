  // src/submitData.js
  import { db } from './firebase';
  import { collection, addDoc, Timestamp } from 'firebase/firestore';

  export async function submitUserData({ gender, age, country, description, time, language }) {
  try {
    const groupPath = language === 'sk' ? 'group_sk' : 'group_en';
    await addDoc(collection(db, groupPath), {
      gender,
      age: Number(age),
      countryLabel: country.label,
      countryCode: country.value,
      description,
      time,
      createdAt: Timestamp.now()
    });
    console.log(`✅ Data written to ${groupPath}`);
  } catch (error) {
    console.error("❌ Firestore write error:", error);
  }
}