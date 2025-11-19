import React, { useState, useEffect } from "react";
import "../components/styles/DoctorDashboard.css";

import PatientTests from "./PatientTests.jsx";
import PatientView from "./PatientView.jsx";
import searchIcon from "./assets/search_icon.png";
import patientsIcon from "./assets/Patients.png";
import statisticsIcon from "./assets/Statistics.png";
import newTestsIcon from "./assets/new_test.png";
import oldPatientsIcon from "./assets/old_patients.png";
import settingsIcon from "./assets/settings_icon.png";

import UserSettings from "../components/UserSettings.jsx";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default function Doctor({ user }) {
  const [tab, setTab] = useState("patients");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [search, setSearch] = useState("");
  const [testPage, setTestPage] = useState(null); // null | "ad"

  const doctorName = user?.displayName || user?.email;

  // Загрузка пользователей
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPatients(list);
      setFiltered(list);
    }
    load();
  }, []);

  // Поиск
  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(
      patients.filter(
        p =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(s) ||
          p.email.toLowerCase().includes(s) ||
          (p.phone ?? "").includes(s)
      )
    );
  }, [search, patients]);

  // Компонент истории AD тестов — встроенный
  function ADHistory({ patient, onBack }) {
    const [tests, setTests] = useState([]);

    useEffect(() => {
      async function load() {
        const snap = await getDocs(
        query(
          collection(db, "users", patient.id, "tests"),
          where("type", "==", "AD")
        )
      );
        setTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      load();
    }, [patient]);

    return (
      <div>
        <button className="back-btn" onClick={onBack}>← Back</button>

        <h2>AD assessment history</h2>

        {tests.length === 0 ? (
          <p>No AD tests found.</p>
        ) : (
          <div className="patients-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(t => (
                  <tr key={t.id}>
                  <td>{t.createdAt?.toDate().toLocaleString() ?? "—"}</td>
                    <td>{t.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <nav className="dash-menu">

          <button
            className="dash-item"
            data-active={tab === "patients"}
            onClick={() => { setTab("patients"); setSelectedPatient(null); setTestPage(null); }}
          >
            <span className="dash-ico">
              <img src={patientsIcon} alt="" />
            </span>
            <span>Patients</span>
          </button>

          <button className="dash-item" data-active={tab === "statistics"}>
            <span className="dash-ico"><img src={statisticsIcon} /></span>
            <span>Statistics</span>
          </button>

          <button className="dash-item">
            <span className="dash-ico"><img src={newTestsIcon} /></span>
            <span>New tests</span>
          </button>

          <button className="dash-item">
            <span className="dash-ico"><img src={oldPatientsIcon} /></span>
            <span>Old patients</span>
          </button>

        </nav>

        <div className="dash-user">
          <span className="dash-user-name">Doctor: {doctorName}</span>
          <button className="user-gear" onClick={() => setSettingsOpen(!settingsOpen)}>
            <img src={settingsIcon} className="user-gear-icon" alt="" />
          </button>
        </div>

        {settingsOpen && <UserSettings user={user} onClose={() => setSettingsOpen(false)} />}
      </aside>

      {/* MAIN AREA */}
      <main className="dash-content">
        <div className="tab-wrap">

          {/* Patients list */}
          {tab === "patients" && !selectedPatient && !testPage && (
            <div>

              <h2>Patients list</h2>

              <div className="search-bar">
                <img src={searchIcon} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="patients-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} onClick={() => setSelectedPatient(p)}>
                        <td>{p.firstName} {p.lastName}</td>
                        <td>{p.email}</td>
                        <td>{p.phone || "—"}</td>
                        <td>{p.createdAt?.toDate().toLocaleDateString() || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Patient details */}
          {selectedPatient && !testPage && (
            <PatientView
              patient={selectedPatient}
              onBack={() => setSelectedPatient(null)}
              onOpenAd={() => setTestPage("ad")}
            />
          )}

         {selectedPatient && testPage === "ad" && (
    <PatientTests
        patientId={selectedPatient.id}
        onBack={() => setTestPage(null)}
    />
      )}

        </div>
      </main>
    </div>
  );
}
