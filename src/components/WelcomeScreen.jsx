import React from 'react';
import '../components/styles/WelcomeScreen.css';
import t1 from '../assets/t2.png';

export default function WelcomeScreen({ onNext }) {
  return (
    <div className="welcome-block fade-in">
      <h1>Welcome to the Cognitive Perception Test!</h1>
      <p className="welcome-paragraph">
        Thank you for taking part in this short test. It is part of a scientific project aimed at learning more about how people understand everyday situations.
        Your participation helps us explore new ways to support early brain health research. The test is simple and will only take a few minutes.
        When you're ready, click "Continue" to begin.
      </p>
      <img src={t1} alt="Intro" className="welcome-image" />
      <div className="welcome-button-container">
        <button onClick={onNext} className="welcome-button">Continue</button>
      </div>
    </div>
  );
}