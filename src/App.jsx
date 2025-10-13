import React, { useState, useEffect, useRef } from 'react';

import ResearchInfo from './ResearchInfo.jsx';
import UserDetailsForm from './UserDetailsForm.jsx';
import DescriptionTest from './DescriptionTest.jsx';
import SemanticGraph from './SemanticGraph.jsx';
import CompletionModal from './CompletionModal.jsx';

// Экран логина/регистрации
import AuthScreen from './AuthScreen.jsx';

import { submitUserData } from './submitData.js';

function App() {
  // Язык фиксируем на английском
  const [language] = useState('en');

  // Шаги:
  // 1 — Авторизация/регистрация
  // 2 — Информация об исследовании
  // 3 — Анкета
  // 4 — Описание (таймер)
  // 5 — Семантический граф (результаты)
  const [step, setStep] = useState(1);

  const [description, setDescription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);

  const timerRef = useRef(null);
  const userDataRef = useRef({ gender: '', age: '', country: '' });

  const next = () => setStep((s) => s + 1);

  const handleUserDetailsSubmit = ({ gender, age, country }) => {
    userDataRef.current = { gender, age, country };
    next();
  };

  const handleFinishDescription = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowCompleted(true);

    submitUserData({
      gender: userDataRef.current.gender,
      age: userDataRef.current.age,
      country: userDataRef.current.country,
      description,
      time: elapsedTime,
      language,
    });
  };

  useEffect(() => {
    if (step === 4) {
      // Сброс перед началом описания
      setDescription('');
      setElapsedTime(0);
      timerRef.current = null;
    }
  }, [step]);

  return (
    <div className="app-container">
      {step === 1 && (
        <AuthScreen
          onAuthed={() => {
            next();
          }}
        />
      )}

      {step === 2 && <ResearchInfo onNext={next} />}

      {step === 3 && <UserDetailsForm onSubmit={handleUserDetailsSubmit} />}

      {step === 4 && (
        <DescriptionTest
          description={description}
          setDescription={setDescription}
          elapsedTime={elapsedTime}
          setElapsedTime={setElapsedTime}
          timerRef={timerRef}
          onSubmit={handleFinishDescription}
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

      {showCompleted && (
        <CompletionModal
          elapsedTime={elapsedTime}
          onClose={() => {
            setShowCompleted(false);
            setStep(5);
          }}
        />
      )}
    </div>
  );
}

export default App;
