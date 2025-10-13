import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import ResearchInfo from './components/ResearchInfo.jsx';
import UserDetailsForm from './components/UserDetailsForm.jsx';
import DescriptionTest from './components/DescriptionTest.jsx';
import CompletionModal from './components/CompletionModal.jsx';
import SemanticGraph from './components/SemanticGraph.jsx';

// новый экран авторизации/регистрации
import AuthScreen from './components/AuthScreen.jsx';

import { submitUserData } from './submitData.js';

function App() {
  // язык фиксируем на английском, без выбора
  const [language] = useState('en');

  // шаги:
  // 1 — AuthScreen
  // 2 — ResearchInfo
  // 3 — UserDetailsForm
  // 4 — DescriptionTest
  // 5 — SemanticGraph
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const timerRef = useRef(null);
  const userDataRef = useRef({});

  const handleNext = () => setStep((prev) => prev + 1);

  const handleUserDetailsSubmit = ({ gender, age, country }) => {
    userDataRef.current = { gender, age, country };
    handleNext();
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowModal(true);

    submitUserData({
      gender: userDataRef.current.gender,
      age: userDataRef.current.age,
      country: userDataRef.current.country,
      description,
      time: elapsedTime,
      language
    });
  };

  useEffect(() => {
    if (step === 4) {
      setDescription('');
      setElapsedTime(0);
      timerRef.current = null;
    }
  }, [step]);

  return (
    <div className="app-container">
      {step === 1 && <AuthScreen onAuthed={handleNext} />}

      {step === 2 && <ResearchInfo onNext={handleNext} />}

      {step === 3 && <UserDetailsForm onSubmit={handleUserDetailsSubmit} />}

      {step === 4 && (
        <DescriptionTest
          description={description}
          setDescription={setDescription}
          elapsedTime={elapsedTime}
          setElapsedTime={setElapsedTime}
          timerRef={timerRef}
          onSubmit={handleFinish}
        />
      )}

      {step === 5 && (
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
  );
}

export default App;
