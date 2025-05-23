import React, { useEffect, useRef, useState } from 'react';
import '../components/styles/SemanticGraph.css';
import t1 from '../assets/t1.jpg';

const rawDictionary = [
  [1, ['girl', 'sister', 'kid', 'child', 'daughter', 'schoolgirl', 'female child', 'young girl', 'juvenile']],
  [2, ['shushing', 'silencing', 'warning', 'gesturing', 'alerting', 'signaling', 'pointing', 'communicating']],
  [3, ['jar', 'container', 'canister', 'tub', 'bottle', 'tin', 'storage jar', 'food jar', 'vessel']],
  [4, ['shelf', 'cupboard', 'cabinet', 'storage', 'closet', 'compartment', 'wall unit', 'kitchen shelf']],
  [5, ['cookies', 'biscuits', 'snacks', 'treats', 'sweets', 'baked goods', 'goodies', 'pastries']],
  [6, ['handing', 'passing', 'giving', 'offering', 'sharing', 'delivering', 'presenting']],
  [7, ['stealing', 'taking', 'reaching', 'snatching', 'grabbing', 'pilfering', 'thieving']],
  [8, ['stool', 'stepstool', 'ladder', 'bench', 'footstool', 'seat', 'unsteady base']],
  [9, ['wobbling', 'unsteady', 'teetering', 'unstable', 'shaky', 'swaying', 'rocking']],
  [10, ['boy', 'brother', 'kid', 'child', 'male child', 'schoolboy', 'youngster']],
  [11, ['mother', 'woman', 'lady', 'mom', 'housewife', 'female', 'adult', 'parent']],
  [12, ['washing', 'drying', 'cleaning', 'wiping', 'rinsing', 'scrubbing', 'polishing']],
  [13, ['plate', 'dish', 'ceramic plate', 'tableware', 'crockery', 'platter', 'china']],
  [14, ['water', 'puddle', 'spill', 'overflow', 'flood', 'wet floor', 'liquid', 'splash']],
  [15, ['sink', 'basin', 'washbasin', 'overflowing sink', 'drain', 'flooded sink']],
  [16, ['faucet', 'tap', 'spigot', 'valve', 'nozzle', 'running water']],
  [17, ['window', 'pane', 'glass', 'windowpane', 'casement']],
  [18, ['curtains', 'drapes', 'blinds', 'window coverings', 'hangings']],
  [19, ['dishes', 'dirty dishes', 'tableware', 'drying rack', 'plates', 'cups', 'cup','utensils']]
];

const dictionary = new Map();
rawDictionary.forEach(([num, words]) => {
  words.forEach(word => dictionary.set(word.toLowerCase(), num));
});

const coordinates = [
  [116.47, 362.44], [126.74, 242.71], [155.00, 63.00], [180.33, 90.27],
  [195.45, 30.90], [199.88, 144.65], [235.00, 118.16], [250.81, 436.19],
  [267.69, 297.73], [286.12, 186.62], [520.42, 175.35], [543.58, 260.94],
  [575.47, 200.31], [575.43, 500.97], [618.37, 346.37], [651.53, 290.97],
  [711.37, 192.37], [779.47, 124.25], [788.37, 402.37]
];

function getQuadrant(num) {
  return num <= 10 ? 'left' : 'right';
}

function analyzeText(rawText) {
  const clean = rawText.toLowerCase().replace(/[^\w\s]/g, '');
  const words = clean.split(/\s+/);
  const found = words.map(w => dictionary.get(w)).filter(Boolean);
  const transitions = found.reduce((sum, curr, i, arr) =>
    i === 0 ? sum : sum + (getQuadrant(curr) !== getQuadrant(arr[i - 1]) ? 1 : 0), 0);
  const unique = [...new Set(found)];
  const allNumbers = rawDictionary.map(([n]) => n);
  const missing = allNumbers.filter(n => !unique.includes(n));
  const density = unique.length > 1 ? (2 * (found.length - 1)) / (unique.length * (unique.length - 1)) : 0;
  const distance = found.slice(1).reduce((sum, cur, i) => {
    const prev = found[i];
    return sum + Math.hypot(
      coordinates[cur - 1][0] - coordinates[prev - 1][0],
      coordinates[cur - 1][1] - coordinates[prev - 1][1]
    );
  }, 0);
  const w1 = 2, w2 = 3, w3 = 1;
  const index = (w1 * transitions + w2 * found.length + w3 * (1 - missing.length / allNumbers.length)) / 3;
  return { found, transitions, missing, density, distance, index, words };
}

function highlightWords(text, wordsToHighlight) {
  const regex = new RegExp(`\\b(${wordsToHighlight.join('|')})\\b`, 'gi');
  return text.split(regex).map((part, i) =>
    wordsToHighlight.includes(part.toLowerCase()) ? (
      <span key={i} className="highlight">{part}</span>
    ) : (
      part
    )
  );
}

export default function SemanticGraph({ userText, gender, age, country, time }) {
  const canvasRef = useRef();
  const { found, transitions, missing, density, distance, index, words } = analyzeText(userText);
  const matchedWordsSet = new Set(words);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = t1;

  let animationFrameId = null;

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    let stepIndex = 1;
    let progress = 0;
    const speed = 0.004;
    let drawnSegments = [];

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Рисуем все точки
      coordinates.forEach(([x, y], i) => {
        const isStart = found[0] === i + 1;
        const isFinish = found[found.length - 1] === i + 1;

        // Цвет кружка
        ctx.fillStyle = isStart ? 'green' : isFinish ? 'magenta' : 'red';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();

        // Обводка
        if (isStart || isFinish) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'black';
          ctx.stroke();
        }

        // Номер точки
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, x, y);

        // Подписи start и finish
        if (isStart) {
          ctx.fillStyle = 'green';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('Start', x + 12, y - 12);
        } else if (isFinish) {
          ctx.fillStyle = 'magenta';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('Finish', x + 12, y - 12);
        }
      });

      // Рисуем завершённые отрезки
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 1;
      drawnSegments.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Анимируем текущую стрелку
      if (stepIndex < found.length) {
        const [x1, y1] = coordinates[found[stepIndex - 1] - 1];
        const [x2, y2] = coordinates[found[stepIndex] - 1];
        const currentX = x1 + (x2 - x1) * progress;
        const currentY = y1 + (y2 - y1) * progress;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        // Стрелка
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLength = 10;
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(
          currentX - arrowLength * Math.cos(angle - 0.3),
          currentY - arrowLength * Math.sin(angle - 0.3)
        );
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(
          currentX - arrowLength * Math.cos(angle + 0.3),
          currentY - arrowLength * Math.sin(angle + 0.3)
        );
        ctx.stroke();

        progress += speed;
        if (progress >= 1) {
          drawnSegments.push([x1, y1, x2, y2]);
          progress = 0;
          stepIndex++;
        }

        animationFrameId = requestAnimationFrame(animate);
      }
    }

    animate(); // ✅ Вызов один раз
  };




  return () => cancelAnimationFrame(animationFrameId);
}, [userText, found, animationTrigger]); // 👈 добавлено animationTrigger


  return (
    <div className="semantic-container">
  <div className="semantic-thankyou">
    <h2>Thanks for helping us with our research!</h2>
    <div className="thankyou-info">
      <p><strong>Sex:</strong> {gender}</p>
      <p><strong>Age:</strong> {age}</p>
      <p>
        <strong>Country:</strong>{' '}
        {country?.flagUrl && (
          <img
            src={country.flagUrl}
            alt={country.label}
            style={{ width: '20px', height: '14px', marginRight: '6px', verticalAlign: 'middle', borderRadius: '2px' }}
          />
        )}
        {country?.label}
      </p>
      <p><strong>Time to complete:</strong> {time} seconds</p>
    </div>
  </div>

  <div className="semantic-metrics">
  <h3>Test Analysis Summary</h3>
  <div className="metrics-table">
    <div className="metric-row">
      <span className="metric-label">🧠 Found categories:</span>
      <span className="metric-value">{found.join(', ')}</span>
    </div>
    <div className="metric-row">
      <span className="metric-label">🔄 Transitions between fields:</span>
      <span className="metric-value">{transitions}</span>
    </div>
    <div className="metric-row">
      <span className="metric-label">📉 Missing categories:</span>
      <span className="metric-value">{missing.join(', ')}</span>
    </div>
    <div className="metric-row">
      <span className="metric-label">📈 Graph density:</span>
      <span className="metric-value">{density.toFixed(3)}</span>
    </div>
    <div className="metric-row">
      <span className="metric-label">📏 Path distance:</span>
      <span className="metric-value">{distance.toFixed(1)}</span>
    </div>
  </div>

  <div className="highlight-index-box">
    <span className="highlight-index-label">Cognitive impairment index:</span>
    <span className="highlight-index-value">{index.toFixed(2)}</span>
  </div>
</div>  

  <div className="semantic-graph-wrapper">
  <canvas ref={canvasRef} />
  <div className="replay-button-wrapper">
    <button
      className="replay-button"
      onClick={() => setAnimationTrigger(prev => prev + 1)}
    >
      🔁 Replay animation
    </button>
  </div>
</div>

<div className="semantic-details">
  <div className="semantic-dictionary">
    <h3>Semantic Word Groups</h3>
    {rawDictionary.map(([num, wordList]) => (
      <div key={num} className="category-row">
        <div className="category-number">{num}:</div>
        <div className="category-words">
          {wordList.map((w, i) => (
            <span
              key={i}
              className={matchedWordsSet.has(w.toLowerCase()) ? 'highlight' : ''}
            >
              {w + (i < wordList.length - 1 ? ', ' : '')}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>

  <div className="semantic-usertext">
    <h3>Your text</h3>
    <div className="usertext-box">
      {highlightWords(userText, [...dictionary.keys()])}
    </div>
  </div>
</div>
</div>
  );
}
