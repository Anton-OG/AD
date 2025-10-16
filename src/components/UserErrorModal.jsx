import React from 'react';
import '../components/styles/Modal.css';

export default function UserErrorModal({ onClose, missingFields }) {
  return (
    <div className="modal-overlay">
      <div className="modal-window is-error">
        <h2 className="modal-title">Oops!</h2>
        <p className="modal-text">Please complete the following fields:</p>
        <ul className="modal-list">
           {missingFields.map((field, index) => (
             <li key={index} style={{ color: '#00ffffff', marginBottom: '4px' }}>{field}</li>
           ))}
         </ul>

        <button className="btn btn-primary" onClick={onClose}>OK</button>
       </div>
     </div>
   );
 }