import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import WelcomeScreen from './components/WelcomeScreen';
import ResearchInfo from './components/ResearchInfo';
import UserDetailsForm from './components/UserDetailsForm';
import DescriptionTest from './components/DescriptionTest';
import CompletionModal from './components/CompletionModal';
import SemanticGraph from './components/SemanticGraph';

import LanguageModal from './components/LanguageModal';
import LanguageUnavailableModal from './components/LanguageUnavailableModal';

import { submitUserData } from './submitData';

function App() {
  const [language, setLanguage] = useState(null);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const timerRef = useRef(null);
  const userDataRef = useRef({});

  const handleLanguageSelect = (lang) => {
  setLanguage(lang);
};

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
      language: language || 'en'
    });
  };

  useEffect(() => {
    if (step === 4) {
      setDescription('');
      setElapsedTime(0);
      timerRef.current = null;
    }
  }, [step]);

  // Показываем сообщение, если выбран словацкий язык
  if (showUnavailableModal) {
    return (
      <LanguageUnavailableModal
        onClose={() => {
          setShowUnavailableModal(false);
          setLanguage('en'); // продолжить на английском
        }}
      />
    );
  }

  // Показываем выбор языка
  if (!language) {
    return <LanguageModal onSelectLanguage={handleLanguageSelect} />;
  }

  return (
    <div className="app-container">
      {step === 1 && <WelcomeScreen onNext={handleNext} />}
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
