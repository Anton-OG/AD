import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import Footer from './components/Footer';
import ResearchInfo from './components/ResearchInfo.jsx';
import DescriptionTest from './components/DescriptionTest.jsx';
import CompletionModal from './components/CompletionModal.jsx';
import SemanticGraph from './components/SemanticGraph.jsx';
import AuthScreen from './components/AuthScreen.jsx';

import { submitUserData } from './submitData.js';

function App() {
  // язык фиксируем на английском
  const [language] = useState('en');

  // шаги:
  // 1 — AuthScreen
  // 2 — ResearchInfo
  // 3 — DescriptionTest
  // 4 — SemanticGraph
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const timerRef = useRef(null);
  const userDataRef = useRef({});

  const handleNext = () => setStep((prev) => prev + 1);

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowModal(true);

    submitUserData({
      gender: userDataRef.current.gender,
      age: userDataRef.current.age,
      country: userDataRef.current.country,
      description,
      time: elapsedTime,
      language,
    });
  };

  // сброс перед началом экрана описания (шаг 3)
  useEffect(() => {
    if (step === 3) {
      setDescription('');
      setElapsedTime(0);
      timerRef.current = null;
    }
  }, [step]);

  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="app-container">
          {step === 1 && <AuthScreen onAuthed={handleNext} />}

          {step === 2 && <ResearchInfo onNext={handleNext} />}

          {step === 3 && (
            <DescriptionTest
              description={description}
              setDescription={setDescription}
              elapsedTime={elapsedTime}
              setElapsedTime={setElapsedTime}
              timerRef={timerRef}
              onSubmit={handleFinish}
            />
          )}

          {step === 4 && (
            <SemanticGraph
              userText={description}
              gender={userDataRef.current.gender}
              age={userDataRef.current.age}
              country={userDataRef.current.country}
              time={elapsedTime}
            />
          )}

          {showModal && (
            <CompletionModal
              elapsedTime={elapsedTime}
              onClose={() => {
                setShowModal(false);
                handleNext();
              }}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
