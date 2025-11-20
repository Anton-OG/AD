import { useState, useEffect } from "react";
import "../components/styles/PatientView.css";

import adIcon from "./assets/approval.png";

import PatientEditModal from "./PatientEditModal.jsx";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../firebase";

export default function PatientView({ patient, onBack, onOpenAd }) {
  const [editing, setEditing] = useState(false);
  const [localPatient, setLocalPatient] = useState(patient);

  const [lastAd, setLastAd] = useState(null);

  // Load last AD test from Firestore
  useEffect(() => {
    async function loadLastAD() {
      try {
        const q = query(
          collection(db, "users", localPatient.id, "tests"),
          where("type", "==", "AD"),
        //orderBy("createdAt", "desc"),
          limit(1)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          const t = snap.docs[0].data();

          // createdAt как timestamp
          const created =
            t.createdAt?.toDate
              ? t.createdAt.toDate().toLocaleString()
              : "—";

          setLastAd({
            score:
              typeof t.score === "number"
                ? t.score.toFixed(2)
                : "—",
            date: created
          });
        } else {
          setLastAd(null);
        }
      } catch (e) {
        console.error("Error loading last AD test:", e);
      }
    }

    if (localPatient?.id) loadLastAD();
  }, [localPatient.id]);

  if (!localPatient) return null;

  const handleSaved = (updated) => {
    setLocalPatient({ ...localPatient, ...updated });
    setEditing(false);
  };

  return (
    <div className="patient-page fade-in">
      <div className="patient-top">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div className="patient-container">
        <div className="patient-card">
          <h2 className="patient-name">
            {localPatient.firstName} {localPatient.lastName}
          </h2>

          <div className="patient-grid">
            <div className="labels">
              <p>Email</p>
              <p>Phone</p>
              <p>Gender</p>
              <p>Age</p>
              <p>Registration date</p>
              <p>Last AD test</p>
              <p>Last AD score</p>
              <p>Validation</p>
            </div>

            <div className="values">
              <p>{localPatient.email}</p>
              <p>{localPatient.phone || "—"}</p>
              <p>{localPatient.gender || "—"}</p>
              <p>{localPatient.age || "—"}</p>

              <p>
                {localPatient.createdAt?.toDate
                  ? localPatient.createdAt
                      .toDate()
                      .toISOString()
                      .split("T")[0]
                  : "—"}
              </p>

              {/* LAST AD TEST DATE */}
              <p>{lastAd?.date ?? "—"}</p>

              {/* LAST AD SCORE */}
              <p>{lastAd?.score ?? "—"}</p>

              <p>{localPatient.validated ? "✔ Active" : "—"}</p>
            </div>
          </div>

          <div className="edit-btn-area">
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
          </div>
        </div>

        <div className="patient-right-panel">
          <button className="right-btn" onClick={onOpenAd}>
            <span>AD assessment history</span>
            <img src={adIcon} className="right-img" alt="" />
          </button>

          <button className="right-btn-disabled">
            <span>MoCA assessment history</span>
          </button>

          <button className="right-btn-disabled">
            <span>Patient Statistics</span>
          </button>
        </div>
      </div>

      {editing && (
        <PatientEditModal
          patient={localPatient}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
