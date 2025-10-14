
import '../components/styles/CompletionModal.css';

export default function CompletionModal({ elapsedTime, onClose }) {
  return (
    <div className="completion-overlay">
      <div className="completion-window">
        <h2>Thank you for taking part!</h2>
        <p>You’ve successfully completed the test.</p>
        <p><strong>Total time:</strong> {elapsedTime} seconds</p>
        <button className="completion-button" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
