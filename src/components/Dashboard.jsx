import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import './styles/Dashboard.css';

import infoIco from '../assets/info.png';
import newTestIco from '../assets/new-test.png';
import casesIco from '../assets/cases.png';



import WelcomeScreen from './WelcomeScreen.jsx';
import ResearchInfo from './ResearchInfo.jsx';
import DescriptionTest from './DescriptionTest.jsx';
import SemanticGraph from './SemanticGraph.jsx';
import CompletionModal from './CompletionModal.jsx';
import MyTests from './MyTests.jsx'
import { submitUserData, updateTestNumbers } from '../submitData.js';
import { useTranslation } from 'react-i18next';


export default function Dashboard({ user }) {
  const {i18n, t } = useTranslation();
  const [tab, setTab] = useState('info');  
  const [casesKey, setCasesKey] = useState(0);        // left: Info / New test / My test cases
  const [wizardStep, setWizardStep] = useState(0); // New test: 0=Info, 1=Describe, 2=Results
  const [description, setDescription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [testId, setTestId] = useState(null);
  const [pendingNumbers, setPendingNumbers] = useState(null); // {found, missing}

 const resetNewFlow = useCallback(() => { setWizardStep(0); setDescription(''); setElapsedTime(0);setTestId(null); setPendingNumbers(null);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);


  const name = useMemo(() => user?.displayName || user?.email || 'User', [user]);

  const handleFinish = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const id = await submitUserData({ description, time: elapsedTime });
      setTestId(id);
      setShowModal(true);
    } catch (e) { console.error(e); }
  };

  const handleNumbersExtracted = useCallback(({ found, missing }) => {
    setPendingNumbers(prev => {
      const same =
        Array.isArray(prev?.found) &&
        Array.isArray(prev?.missing) &&
        prev.found.join(',') === (found || []).join(',') &&
        prev.missing.join(',') === (missing || []).join(',');
      return same ? prev : { found, missing };
    });
  }, []);

  useEffect(() => {
    if (testId && pendingNumbers) {
      updateTestNumbers({
        testId,
        numbersFound: pendingNumbers.found,
        numbersMissing: pendingNumbers.missing,
      })
        .catch(console.error)
        .finally(() => setPendingNumbers(null));
    }
  }, [testId, pendingNumbers]);

   useEffect(() => {
    if (tab === 'new') resetNewFlow();
  }, [tab, resetNewFlow]);

  return (
    <div className="dash">
      {/* Left menu */}
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
        <div className="dash-user"> {name}</div>
      </aside>

      {/* Central area */}
      <section className="dash-content">
        {tab === 'info' && (
          <div className="tab-wrap">
            {/* WelcomeScreen as Info; Continue button is hidden by style in Dashboard.css */}
            <WelcomeScreen onNext={() => {}} />
          </div>
        )}

        {tab === 'new' && (
          <div className="tab-wrap">
            {wizardStep === 0 && <ResearchInfo onNext={() => setWizardStep(1)} />}

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
                  setWizardStep(2); // go to results
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
