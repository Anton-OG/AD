import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function PatientInfo({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    async function load() {
      setLoading(true);
      const snap = await getDoc(doc(db, 'users', patientId));
      if (snap.exists()) {
        setPatient(snap.data());
      }
      setLoading(false);
    }

    load();
  }, [patientId]);

  if (!patientId) return null;
  if (loading) return <div className="patient-info">Loading...</div>;
  if (!patient) return <div className="patient-info">User not found.</div>;

  return (
    <div className="patient-info">
      <h3>Patient details</h3>

      <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
      <p><strong>Email:</strong> {patient.email}</p>
      <p><strong>Phone:</strong> {patient.phone || "—"}</p>
      <p><strong>Gender:</strong> {patient.gender}</p>
      <p><strong>Age:</strong> {patient.age}</p>
      <p><strong>Registered:</strong> {patient.createdAt?.toDate().toLocaleString() ?? "—"}</p>
    </div>
  );
}
