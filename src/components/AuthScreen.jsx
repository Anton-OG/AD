import React, { useState } from 'react';
import './styles/AuthScreen.css';

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (m) => {
    setMode(m);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !pass.trim() || (mode === 'register' && !name.trim())) {
      setError('Пожалуйста, заполните все обязательные поля.');
      return;
    }
    if (mode === 'register' && !agree) {
      setError('Поставьте галочку согласия на обработку данных.');
      return;
    }

    // здесь вызывайте вашу авторизацию/регистрацию (Firebase/бэкенд)
    onAuthed?.({ email, name: name || null });
  };

  return (
    <div className="auth-wrapper fade-in">
      <div className="auth-card">
        <h1 className="auth-title">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h1>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            Войти
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
            type="button"
          >
            Создать аккаунт
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label>Имя</label>
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="Минимум 6 символов"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          {mode === 'register' && (
            <label className="auth-check">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>Согласен(-на) с условиями обработки данных</span>
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-actions">
            <button className="auth-button" type="submit">
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
