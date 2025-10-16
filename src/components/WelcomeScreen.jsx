import React from 'react';
import { useTranslation } from 'react-i18next';
import '../components/styles/WelcomeScreen.css';
import t1 from '../assets/t2.png';

export default function WelcomeScreen({ onNext }) {
  const { i18n, t  } = useTranslation();
  return (
    <div className="welcome-block fade-in">
      <h1>{t('welcome_h1')}</h1>
       <p className="welcome-paragraph">{t('welcome_body')}</p>
      <img src={t1} alt={t('welcome_image_alt')} className="welcome-image" />
      <div className="welcome-button-container">
      </div>
    </div>
  );
}

