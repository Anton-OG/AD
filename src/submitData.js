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

    console.log(`✅ Data successfully written to ${groupPath}`);
  } catch (error) {
    console.error("❌ Error when writing to Firestore:", error);
  }
}
