import React from 'react';
import '../components/styles/Modal.css';

export default function ErrorModal({ onClose }) {
   return (
    <div className="modal-overlay">
      <div className="modal-window is-error">
        <h2 className="modal-title">Submission Error</h2>
        <p className="modal-text">You must enter a description before submitting.</p>
        <button className="btn btn-primary" onClick={onClose}>OK</button>
       </div>
     </div>
   );
 }
