import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import './styles/Dashboard.css';

import WelcomeScreen from './WelcomeScreen.jsx';
import ResearchInfo from './ResearchInfo.jsx';
import DescriptionTest from './DescriptionTest.jsx';
import SemanticGraph from './SemanticGraph.jsx';
import CompletionModal from './CompletionModal.jsx';
import MyTests from './MyTests.jsx'
import { submitUserData, updateTestNumbers } from '../submitData.js';

export default function Dashboard({ user }) {
  const [tab, setTab] = useState('info');          // left: Info / New test / My test cases
  const [wizardStep, setWizardStep] = useState(0); // New test: 0=Info, 1=Describe, 2=Results
  const [description, setDescription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [testId, setTestId] = useState(null);
  const [pendingNumbers, setPendingNumbers] = useState(null); // {found, missing}

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
    if (tab === 'new') {
      setWizardStep(0);
      setDescription('');
      setElapsedTime(0);
      setTestId(null);
      setPendingNumbers(null);
      if (timerRef.current) {                         
             clearInterval(timerRef.current);
        timerRef.current = null;
        }
  }
  }, [tab]);

  return (
    <div className="dash">
      {/* Left menu */}
      <aside className="dash-sidebar">
        <nav className="dash-menu">
          <button className="dash-item" data-active={tab === 'info'} onClick={() => setTab('info')}>
            <span className="dash-ico">ℹ️</span><span>Info</span>
          </button>
          <button className="dash-item" data-active={tab === 'new'} onClick={() => setTab('new')}>
            <span className="dash-ico">🧬</span><span>New test</span>
          </button>
          <button className="dash-item" data-active={tab === 'cases'} onClick={() => setTab('cases')}>
            <span className="dash-ico">🗂️</span><span>My test cases</span>
          </button>
        </nav>
        <div className="dash-user">User: {name}</div>
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
                <MyTests />
            </div>
            )}
      </section>
    </div>
  );
}
