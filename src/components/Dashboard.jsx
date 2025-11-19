import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import './styles/Dashboard.css';

import infoIco from '../assets/inco-1.png';
import newTestIco from '../assets/new-test.png';
import casesIco from '../assets/cases.png';
import gearIcon from '../assets/gear.png';

import WelcomeScreen from './WelcomeScreen.jsx';
import ResearchInfo from './ResearchInfo.jsx';
import DescriptionTest from './DescriptionTest.jsx';
import SemanticGraph from './SemanticGraph.jsx';
import CompletionModal from './CompletionModal.jsx';
import UserSettings from './UserSettings.jsx';
import MyTests from './MyTests.jsx';

import { useTranslation } from 'react-i18next';

// ⭐ FIREBASE IMPORTS — ЭТО ОЧЕНЬ ВАЖНО
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";


export default function Dashboard({ user }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation();

  const [tab, setTab] = useState('info');  
  const [casesKey, setCasesKey] = useState(0);

  const [wizardStep, setWizardStep] = useState(0);
  const [description, setDescription] = useState('');

  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [testId, setTestId] = useState(null);

  // теперь pendingNumbers содержит found, missing, index
  const [pendingNumbers, setPendingNumbers] = useState(null);

  // RESET FLOW
  const resetNewFlow = useCallback(() => {
    setWizardStep(0);
    setDescription('');
    setElapsedTime(0);
    setTestId(null);
    setPendingNumbers(null);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const name = useMemo(() => user?.displayName || user?.email || 'User', [user]);

  
  // ⭐ СОХРАНЕНИЕ ТЕСТА — ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ ВАРИАНТ
  const handleFinish = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "tests"),
        {
          description,
          time: elapsedTime,
          createdAt: serverTimestamp(),
          type: "AD",
          score: pendingNumbers?.index ?? null,
          numbersFound: pendingNumbers?.found ?? [],
          numbersMissing: pendingNumbers?.missing ?? []
        }
      );

      setTestId(docRef.id);
      setShowModal(true);

    } catch (e) {
      console.error("Error saving test:", e);
    }
  };


  // ⭐ Теперь SemanticGraph отдаёт index тоже
  const handleNumbersExtracted = useCallback(({ found, missing, index }) => {
  setPendingNumbers(prev => {
    const same =
      Array.isArray(prev?.found) &&
      Array.isArray(prev?.missing) &&
      prev.found.join(',') === (found || []).join(',') &&
      prev.missing.join(',') === (missing || []).join(',');

    return same ? prev : { found, missing, index };
  });
}, []);



 useEffect(() => {
  if (!testId || !pendingNumbers) return;

  import("../submitData.js").then(({ updateTestNumbers }) => {
    updateTestNumbers({
      testId,
      numbersFound: pendingNumbers.found,
      numbersMissing: pendingNumbers.missing,
      score: pendingNumbers.index, // ← ДОБАВИЛИ!
    }).finally(() => {
      setPendingNumbers(null);
    });
  });
}, [testId, pendingNumbers]);

  return (
    <div className="dash">
      
      {/* LEFT MENU */}
      <aside className="dash-sidebar">
        <nav className="dash-menu">
          <button className="dash-item" data-active={tab === 'info'} onClick={() => setTab('info')}>
            <span className="dash-ico"><img src={infoIco} alt="" /></span><span>{t('nav_info')}</span>
          </button>

          <button className="dash-item" data-active={tab === 'new'} onClick={() => { setTab('new'); resetNewFlow(); }}>
            <span className="dash-ico"><img src={newTestIco} alt="" /></span><span>{t('nav_new_test')}</span>
          </button>

          <button className="dash-item" data-active={tab === 'cases'} onClick={() => { setTab('cases'); setCasesKey(k => k + 1); }}>
            <span className="dash-ico"><img src={casesIco} alt="" /></span><span>{t('nav_cases')}</span>
          </button>
        </nav>

        <div className="dash-user">
          <span className="dash-user-name">{name}</span>
          <button
            className="user-gear"
            aria-label={t('settings.open_aria')}
            onClick={() => setSettingsOpen(v => !v)}
            title="Settings"
          >
            <img src={gearIcon} alt="" aria-hidden="true" className="user-gear-icon" draggable="false" />
          </button>
        </div>

        {settingsOpen && (
          <UserSettings user={user} onClose={() => setSettingsOpen(false)} />
        )}
      </aside>


      {/* CENTRAL CONTENT */}
      <section className="dash-content">
        
        {tab === 'info' && (
          <div className="tab-wrap">
            <WelcomeScreen onNext={() => {}} />
          </div>
        )}

        {tab === 'new' && (
          <div className="tab-wrap">

            {wizardStep === 0 && (
              <ResearchInfo onNext={() => setWizardStep(1)} />
            )}

            {wizardStep === 1 && (
              <DescriptionTest
                description={description}
                setDescription={setDescription}
                elapsedTime={elapsedTime}
                setElapsedTime={setElapsedTime}
                timerRef={timerRef}
                onSubmit={handleFinish}
              />
            )}

            {wizardStep === 2 && (
              <SemanticGraph
                userText={description}
                time={elapsedTime}
                onNumbersExtracted={handleNumbersExtracted}
              />
            )}

            {showModal && (
              <CompletionModal
                elapsedTime={elapsedTime}
                onClose={() => {
                  setShowModal(false);
                  setWizardStep(2);
                }}
              />
            )}

          </div>
        )}

        {tab === 'cases' && (
          <div className="tab-wrap">
            <MyTests key={casesKey} />
          </div>
        )}

      </section>
    </div>
  );
}
