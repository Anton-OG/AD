import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import SemanticGraph from "../components/SemanticGraph.jsx";
import "../components/styles/MyTests.css";

export default function PatientTests({ patientId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "users", patientId, "tests"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setTests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
        setTests([]);
      }
      setLoading(false);
    }
    load();
  }, [patientId]);

  if (loading)
    return <div className="cases-wrap"><h2>Loading...</h2></div>;

  if (selected)
    return (
      <div className="case-details">
        <button className="back-btn" onClick={() => setSelected(null)}>← Back</button>

        <SemanticGraph userText={selected.description} time={selected.time} />
      </div>
    );

  return (
    <div className="cases-wrap">
      <button className="back-btn" onClick={onBack}>← Back</button>

      <h2>AD Tests</h2>

      <div className="cases-grid">
        {tests.map((test) => (
          <button
            key={test.id}
            className="case-card"
            onClick={() => setSelected(test)}
          >
            <div className="case-title">Test</div>
            <div className="case-date">{test.createdAt?.toDate().toLocaleString()}</div>

            <div className="case-meta-line">
              <span className="meta-chip time"> {test.time ?? "—"} s</span>
              <span className="meta-chip ok">✔ {test.numbersFound?.length ?? 0}</span>
              <span className="meta-chip bad">✕ {test.numbersMissing?.length ?? 0}</span>
              <span className="meta-chip score">★ {test.score != null ? test.score.toFixed(2) : "—"}</span> 
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
