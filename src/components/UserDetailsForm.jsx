import React, { useState } from 'react';
import Select from 'react-select';
import '../components/styles/UserDetailsForm.css';
import flags from '../data/countries_with_flags.json';
import selectStyles from '../components/styles/selectStyles';
import UserErrorModal from './UserErrorModal';

export default function UserDetailsForm({ onSubmit }) {
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState(null);
  const [showError, setShowError] = useState(false);
  const [invalidAgeError, setInvalidAgeError] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = [];
    const ageNum = parseInt(age);

    if (!gender) errors.push('Gender');
    if (!age) {
      errors.push('Age');
    } else if (ageNum <= 7 || ageNum >= 90) {
      setInvalidAgeError(true);
      return;
    }

    if (!country) errors.push('Country');

    if (errors.length > 0) {
      setMissingFields(errors);
      setShowError(true);
      return;
    }

    onSubmit({ gender, age, country }); // ← передаём весь объект: { label, value, flagUrl }

  };

  const countryOptions = flags.map(({ name, code, flagUrl }) => ({
    value: code,
    label: name,
    flagUrl: flagUrl
  }));

  return (
    <div className="user-block fade-in">
      <h1>About You</h1>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="user-group">
          <label>Sex:</label>
          <div className="user-gender-options">
            <button
              type="button"
              className={`user-gender-button ${gender === 'Male' ? 'selected' : ''}`}
              onClick={() => setGender('Male')}
            >
              Male
            </button>
            <button
              type="button"
              className={`user-gender-button ${gender === 'Female' ? 'selected' : ''}`}
              onClick={() => setGender('Female')}
            >
              Female
            </button>
          </div>
        </div>

        <div className="user-group">
          <label>Enter your age:</label>
          <input
            type="number"
            min="1"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            className="user-age-input"
          />
        </div>

        <div className="user-group">
          <label>Select your country:</label>
          <Select
            options={countryOptions}
            value={country}
            onChange={(selected) => setCountry(selected)}
            placeholder="Select your country..."
            isSearchable
            styles={selectStyles}
            formatOptionLabel={({ label, flagUrl }) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={flagUrl} alt="" style={{ width: '20px', height: '14px', borderRadius: '2px' }} />
                <span>{label}</span>
              </div>
            )}
          />
        </div>

        <div className="user-button-container">
          <button type="submit" className="user-button">Continue</button>
        </div>
        <p className="user-privacy-note">
          This information will be used solely for research purposes and will remain anonymous.
        </p>
      </form>

      {showError && (
        <UserErrorModal
          onClose={() => setShowError(false)}
          missingFields={missingFields}
        />
      )}

      {invalidAgeError && (
        <UserErrorModal
          onClose={() => setInvalidAgeError(false)}
          missingFields={['Age must be between 8 and 89 years']}
        />
      )}
    </div>
  );
}
