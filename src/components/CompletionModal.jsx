
import '../components/styles/Modal.css';

export default function CompletionModal({ elapsedTime, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-window is-completion">
        <h2 className="modal-title">Thank you for taking part!</h2>
        <p className="modal-text">You’ve successfully completed the test.</p>
        <p className="modal-text"><strong>Total time:</strong> {elapsedTime} seconds</p>
        <button className="btn btn-primary" onClick={onClose}>Done</button>
       </div>
     </div>
   );
 }