import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../components/styles/PatientEditModal.css";

export default function PatientEditModal({ patient, onClose, onSaved }) {
  const [firstName, setFirstName] = useState(patient.firstName || "");
  const [lastName, setLastName] = useState(patient.lastName || "");
  const [email, setEmail] = useState(patient.email || "");
  const [phone, setPhone] = useState(patient.phone || "");
  const [validated, setValidated] = useState(patient.validated || false);

  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", patient.id), {
        firstName,
        lastName,
        email,
        phone,
        validated,
        emailVerified: validated ? true : false // ручная активация
      });

      onSaved({
        firstName,
        lastName,
        email,
        phone,
        validated,
        emailVerified: validated
      });

      onClose();
    } catch (e) {
      console.error(e);
      alert("Error saving user data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="patient-modal-overlay" onMouseDown={onClose}>
      <div className="patient-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="pm-title">Edit Patient</h2>

        <div className="pm-field">
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="pm-field">
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="pm-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="pm-field">
          <label>Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="pm-checkbox">
          <input
            type="checkbox"
            checked={validated}
            onChange={() => setValidated((v) => !v)}
          />
          <span>Activate account (emailVerified)</span>
        </div>

        <div className="pm-buttons">
          <button className="pm-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="pm-btn save" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
