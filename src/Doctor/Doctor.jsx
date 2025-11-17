import React, { useState, useEffect } from "react";
import "../components/styles/DoctorDashboard.css";
import PatientInfo from "./PatientInfo.jsx";
import settingsIcon from "./assets/settings_icon.png";
import patientsIcon from "./assets/Patients.png";
import statisticsIcon from "./assets/Statistics.png";
import newTestsIcon from "./assets/new_test.png";
import oldPatientsIcon from "./assets/old_patients.png";
import UserSettings from "../components/UserSettings.jsx";
import searchIcon from "./assets/search_icon.png";


// ⬇️ якщо плануєш Firebase — раскоментуй та налаштуй:
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // твій експорт Firestore


export default function Doctor({ user }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState("patients");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");

  const name = user?.displayName || user?.email || "A";

  // 🧠 Приклад отримання пацієнтів з бази
  useEffect(() => {
  async function fetchPatients() {
    const snap = await getDocs(collection(db, "users"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setPatients(data);
    setFilteredPatients(data);
  }

  fetchPatients();
}, []);

useEffect(() => {
  const filtered = patients.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone ?? "").includes(search)
  );

  setFilteredPatients(filtered);
}, [search, patients]);

  return (
    <div className="doctor-dashboard">
      {/* --- sidebar --- */}
      <aside className="dash-sidebar">
        <nav className="dash-menu">
          <button className="dash-item" data-active={tab === "patients"} onClick={() => setTab("patients")}>
            <span className="dash-ico"><img src={patientsIcon} alt="" /></span><span>Patients</span>
          </button>
          <button className="dash-item" data-active={tab === "statistics"} onClick={() => setTab("statistics")}>
            <span className="dash-ico"><img src={statisticsIcon} alt="" /></span><span>Statistics</span>
          </button>
          <button className="dash-item" data-active={tab === "new-tests"} onClick={() => setTab("new-tests")}>
            <span className="dash-ico"><img src={newTestsIcon} alt="" /></span><span>New tests</span>
          </button>
          <button className="dash-item" data-active={tab === "old-patients"} onClick={() => setTab("old-patients")}>
            <span className="dash-ico"><img src={oldPatientsIcon} alt="" /></span><span>Old patients</span>
          </button>
        </nav>

        <div className="dash-user">
          <span className="dash-user-name">Doctor: {name}</span>
          <button className="user-gear" onClick={() => setSettingsOpen((v) => !v)}>
            <img src={settingsIcon} alt="" className="user-gear-icon" />
          </button>
        </div>

        {settingsOpen && <UserSettings user={user} onClose={() => setSettingsOpen(false)} />}
      </aside>

      {/* --- main content --- */}
      <main className="dash-content">
        <div className="tab-wrap">
          {tab === "patients" && (
            <div>
              <h2>Patients list</h2>

              {/* 🔍 Пошук */}
            <div className="search-bar">
              <img
              src={searchIcon}
              alt="search"
              className="search-icon"
              />

            <input
              type="text"
              placeholder="Search patient by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            </div>


              <div className="patients-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Registration date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((u) => (
    <tr key={u.email} onClick={() => setSelectedPatient(u)}>
    <td>{u.firstName} {u.lastName}</td>
    <td>{u.email}</td>
    <td>{u.phone || "—"}</td>
    <td>{u.createdAt?.toDate().toLocaleDateString() ?? "—"}</td>
  </tr>
))}

                    
                  </tbody>
                </table>
              </div>

              <PatientInfo patientId={selectedPatient?.id} />
            </div>
          )}

          {tab === "statistics" && <p>Statistics</p>}
          {tab === "new-tests" && <p>New tests</p>}
          {tab === "old-patients" && <p>Old patients</p>}
        </div>
      </main>
    </div>
  );
}
