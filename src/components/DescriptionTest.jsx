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

  // === Speech-to-Text ===
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const isSpeechApiSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const ensureTimerStarted = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(seconds);
      }, 1000);
    }
  };

  const initRecognition = () => {
    if (!isSpeechApiSupported) return null;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = navigator.language || 'en-US'; // при необходимости поменяйте на 'ru-RU' или 'sk-SK'
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      setIsRecording(true);
      ensureTimerStarted();
    };

    rec.onresult = (e) => {
      // Стартуем таймер при первом реальном результате
      ensureTimerStarted();

      let finalChunk = '';
      let interimTxt = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0]?.transcript || '';
        if (res.isFinal) finalChunk += text;
        else interimTxt += text;
      }

      if (finalChunk) {
        setDescription((prev) => {
          const base = prev && !/\s$/.test(prev) ? prev + ' ' : prev || '';
          return (base + finalChunk.trim() + ' ').replace(/\s+/g, ' ');
        });
      }
      setInterim(interimTxt);
    };

    rec.onerror = (e) => {
      console.error('Speech recognition error:', e);
      stopVoice();
    };

    rec.onend = () => {
      setIsRecording(false);
      setInterim('');
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    return rec;
  };

  const startVoice = () => {
    if (!isSpeechApiSupported) {
      setShowErrorModal(true);
      return;
    }
    const rec = recognitionRef.current || initRecognition();
    try {
      rec && rec.start();
    } catch (e) {
      // иногда бросает, если уже запущено
    }
  };

  const stopVoice = () => {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch {}
    }
    setIsRecording(false);
  };

  // Фокус на поле
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  // Очистки при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [timerRef]);

  const handleChange = (e) => {
    ensureTimerStarted();
    setDescription(e.target.value);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      setShowErrorModal(true);
      return;
    }
    // гарантированно останавливаем запись
    if (isRecording) stopVoice();
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

      {/* === Кнопка микрофона и статус === */}
      <div className="mic-row">
        <button
          type="button"
          className={`mic-btn ${isRecording ? 'is-recording' : ''}`}
          onClick={isRecording ? stopVoice : startVoice}
          aria-pressed={isRecording}
          aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
        >
          <span className="mic-ico" aria-hidden>🎤</span>
          <span>{isRecording ? 'Stop' : 'Speak'}</span>
          {isRecording && <span className="rec-dot" aria-hidden></span>}
        </button>

        {!isSpeechApiSupported && (
          <span className="mic-note">Speech-to-text is not supported in this browser.</span>
        )}
        {isSpeechApiSupported && (
          <span className="mic-note">
            Language: <code>{(typeof navigator !== 'undefined' && navigator.language) || 'en-US'}</code>
          </span>
        )}
      </div>

      {/* Поле ввода */}
      <textarea
        ref={textareaRef}
        className="description-textarea"
        rows="6"
        placeholder="Start typing your description here… or press 🎤 and speak"
        value={description}
        onChange={handleChange}
        spellCheck={true}
      />

      {/* Промежуточные подсказки распознавания */}
      {interim && (
        <div className="interim-box" aria-live="polite">
          {interim}
        </div>
      )}

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
