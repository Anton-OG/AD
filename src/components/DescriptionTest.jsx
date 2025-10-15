import React, { useEffect, useRef, useState } from 'react';
import '../components/styles/DescriptionTest.css';
import t1 from '../assets/t1.jpg';
import ErrorModal from './ErrorModal';

export default function DescriptionTest({
  description,
  setDescription,
  elapsedTime,
  setElapsedTime,
  timerRef,
  onSubmit
}) {
  const textareaRef = useRef(null);
  const startTimeRef = useRef(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Фокус на поле
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  // Очистка таймера
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
      <h1 className="description-title">Tell Us What You See</h1>

   
      <div className="description-grid">
        <div className="description-text-col">
          <div className="instruction-card">
            <span className="instruction-badge">How to write</span>
            <ul className="instruction-list">
              <li>
                Describe everything you see in the picture — people, actions, objects, and interactions. 
                Use full sentences. The more details, the better.
              </li>
              <li>
                There are no right or wrong answers. Just describe what you see as clearly as you can. 
                Your response will help us better understand how people perceive everyday situations.
              </li>
            </ul>
          </div>
        </div>

        <div className="description-media">
          <img src={t1} alt="Cognitive test" className="description-image" />
        </div>
      </div>

   
      <textarea
        ref={textareaRef}
        className="description-textarea"
        rows="6"
        placeholder="Start typing your description here..."
        value={description}
        onChange={handleChange}
      />

   
      {elapsedTime > 0 && (
        <p className="description-timer">Elapsed time: {elapsedTime} seconds</p>
      )}

      
      <div className="description-button-container">
        <button onClick={handleSubmit} className="description-button">
          Submit my description
        </button>
      </div>

  
      {showErrorModal && <ErrorModal onClose={() => setShowErrorModal(false)} />}
    </div>
  );
}
