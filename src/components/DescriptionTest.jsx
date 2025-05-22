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

  // Фокусировка на поле
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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
      <h1>Picture Description Task</h1>

      {/* 🖼 Сначала изображение */}
      <img src={t1} alt="Cognitive test" className="description-image" />

      {/* 📄 Потом пояснение */}
      <p className="description-text">
        Look closely at the image above. Please describe everything you see — actions, people, objects, and interactions.
        Use full sentences. The more detailed your description, the better.
      </p>

      {/* ✍ Поле ввода */}
      <textarea
        ref={textareaRef}
        className="description-textarea"
        rows="6"
        placeholder="Start typing your description here..."
        value={description}
        onChange={handleChange}
      />

      {/* ⏱ Таймер */}
      {elapsedTime > 0 && (
        <p className="description-timer">Elapsed time: {elapsedTime} seconds</p>
      )}

      {/* 🟡 Кнопка */}
      <div className="description-button-container">
        <button onClick={handleSubmit} className="description-button">
          Submit my description
        </button>
      </div>

      {/* ❗ Модальное окно ошибки */}
      {showErrorModal && (
        <ErrorModal onClose={() => setShowErrorModal(false)} />
      )}
    </div>
  );
}
