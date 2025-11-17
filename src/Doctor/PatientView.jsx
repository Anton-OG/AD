import "../components/styles/PatientView.css";
import mocaIcon from "./assets/approval.png";
import adIcon from "./assets/approval.png";
import statsIcon from "./assets/Statistics.png";
import { useState } from "react";
import PatientEditModal from "./PatientEditModal.jsx";

export default function PatientView({ patient, onBack, onOpenAd }) {
  const [editing, setEditing] = useState(false);
  const [localPatient, setLocalPatient] = useState(patient);

  if (!localPatient) return null;

  // Refresh local data after saving
  const handleSaved = (updated) => {
    setLocalPatient({ ...localPatient, ...updated });
    setEditing(false);
  };

  return (
    <div className="patient-page fade-in">

      <div className="patient-top">
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="patient-container">

        {/* Left card */}
        <div className="patient-card">
          <h2 className="patient-name">
            {localPatient.firstName} {localPatient.lastName}
          </h2>

          <div className="patient-grid">
            <div className="labels">
              <p>Email</p>
              <p>Phone</p>
              <p>Registration date</p>
              <p>Last AD test</p>
              <p>AD score</p>
              <p>Validation</p>
            </div>

            <div className="values">
              <p>{localPatient.email}</p>
              <p>{localPatient.phone || "—"}</p>
              <p>{localPatient.createdAt?.toDate().toISOString().split("T")[0]}</p>
              <p>{localPatient.lastAD || "—"}</p>
              <p>{localPatient.adScore || "—"}</p>
              <p>{localPatient.validated ? "✔ Active" : "—"}</p>
            </div>
          </div>

          <div className="edit-btn-area">
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
          </div>
        </div>

        {/* Right column */}
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

      {/* Edit modal */}
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
