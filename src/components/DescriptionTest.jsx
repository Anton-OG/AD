import React, { useEffect, useRef, useState } from 'react';
import '../components/styles/DescriptionTest.css';
import t1 from '../assets/t1.jpg';
import ErrorModal from './ErrorModal';
import { useTranslation } from 'react-i18next';

export default function DescriptionTest({
  description,
  setDescription,
  elapsedTime,
  setElapsedTime,
  timerRef,
  onSubmit
}) {
  const { i18n,t } = useTranslation();
  const textareaRef = useRef(null);
  const startTimeRef = useRef(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

 
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRef]);

  const handleChange = (e) => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(seconds);
      }, 1000);
    }
    setDescription(e.target.value);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      setShowErrorModal(true);
      return;
    }
    onSubmit();
  };

  return (
    <div className="description-block fade-in">
      <h1 className="description-title">{t('desc.title')}</h1>

   
      <div className="description-grid">
        <div className="description-text-col">
          <div className="instruction-card">
            <span className="instruction-badge">{t('desc.how_to_write')}</span>
            <ul className="instruction-list">
              <li>{t('desc.bullet1')}</li>
              <li>{t('desc.bullet2')}</li>

            </ul>
          </div>
        </div>

        <div className="description-media">
          <img src={t1} alt={t('desc.image_alt')} className="description-image" />
        </div>
      </div>

   
      <textarea
        ref={textareaRef}
        className="description-textarea"
        rows="6"
        placeholder={t('desc.placeholder')}
        value={description}
        onChange={handleChange}
      />

   
       {elapsedTime > 0 && (
        <p className="description-timer">{t('desc.elapsed', { seconds: elapsedTime })}</p>
      )}

      
      <div className="description-button-container">
        <button onClick={handleSubmit} className="description-button">
          {t('desc.submit')}
        </button>
      </div>

  
      {showErrorModal && <ErrorModal onClose={() => setShowErrorModal(false)} />}
    </div>
  );
}
