import React, { useEffect, useRef, useState } from 'react';
import '../components/styles/SemanticGraph.css';
import t1 from '../assets/t1.jpg';

const rawDictionary = [
  [1, ['girl', 'girls', 'sister', 'sibling', 'young lady', 'lass', 'maiden', 'miss', 'damsel', 'gal', 'child', 'kid', 'daughter', 'minor', 'youth', 'schoolgirl', 'teen', 'tween', 'female child', 'juvenile', 'little girl']],
  [2, ['taking', 'asking', 'finger', 'saying', 'quiet', 'trying', 'laughing', 'disaster', 'action', 'gesture', 'signal', 'motion', 'indicating', 'warning', 'hushing', 'communicating', 'miming', 'shushing', 'silencing', 'alerting']],
  [3, ['jar', 'jars', 'container', 'pot', 'vessel', 'jug', 'canister', 'tin', 'flask', 'bottle', 'tub', 'box', 'receptacle', 'drum', 'storage jar', 'food jar']],
  [4, ['shelf', 'shelves', 'cupboard', 'ledge', 'tier', 'rack', 'storage', 'closet', 'cabinet', 'alcove', 'compartment', 'locker', 'wall unit', 'kitchen shelf']],
  [5, ['cookies', 'cookie', 'biscuits', 'snacks', 'confections', 'treats', 'pastries', 'sweets', 'crackers', 'dessert', 'candy', 'goodies', 'munchies', 'baked goods', 'edibles']],
  [6, ['handing', 'passing', 'giving', 'transferring', 'distributing', 'conveying', 'presenting', 'dispensing', 'delivering', 'offering', 'providing', 'yielding', 'sharing']],
  [7, ['stealing', 'taking', 'reaching', 'thievery', 'pilfering', 'larceny', 'burglary', 'embezzlement', 'appropriation', 'acquiring', 'snatching', 'purloining', 'looting', 'shoplifting', 'grabbing']],
  [8, ['stool', 'falling', 'dropping', 'descending', 'sinking', 'tumbling', 'plummeting', 'seat', 'ottoman', 'footstool', 'bench', 'hassock', 'stepstool', 'stepladder', 'furniture']],
  [9, ['legged', 'wobbling', 'shaking', 'trembling', 'swaying', 'rocking', 'tottering', 'unstable', 'unsteady', 'teetering', 'shaky', 'insecure', 'loose leg']],
  [10, ['boy', 'brother', 'himself', "he's", 'lad', 'youth', 'youngster', 'kid', 'chap', 'son', 'schoolboy', 'toddler', 'male child']],
  [11, ['mother', 'woman', "woman's", 'lady', 'ignoring', 'daydreaming', 'she', "she's", 'mom', 'mum', 'parent', 'maternal', 'female', 'dame', 'adult', 'madam', 'mommy', 'ma', 'mama', 'housewife']],
  [12, ['sanding', 'washing', 'doing', 'buffing', 'polishing', 'cleansing', 'cleaning', 'rinsing', 'laundering', 'performing', 'executing', 'carrying', 'undertaking', 'scrubbing', 'scouring', 'brushing', 'drying', 'wiping']],
  [13, ['plate', 'dish', 'platter', 'saucer', 'serving', 'tray', 'bowl', 'crockery', 'tableware', 'china', 'ceramic plate']],
  [14, ['blast', 'floor', 'feet', 'puddle', 'water', 'wetting', 'surface', 'flooring', 'limbs', 'extremities', 'splash', 'aqua', 'h2o', 'moisture', 'liquid', 'fluid', 'moistening', 'damping', 'spill', 'overflow', 'leak', 'flood']],
  [15, ['sink', "sink's", 'overflowing', 'spilling', 'basin', 'washbasin', 'drain', 'lavatory', 'kitchen sink', 'flooding', 'flooded', 'backed up']],
  [16, ['faucet', 'kitchen', 'tap', 'spigot', 'valve', 'spout', 'outlet', 'hydrant', 'nozzle', 'water flow', 'running water']],
  [17, ['window', 'aperture', 'pane', 'opening', 'casement', 'glazing', 'lattice', 'glass panel', 'windowpane']],
  [18, ['curtains', 'drapes', 'drape', 'blinds', 'coverings', 'hangings', 'shades', 'valance', 'sheers', 'window treatments']],
  [19, ['dishes', 'drying', 'dirty', 'plates', 'utensils', 'cookware', 'tableware', 'crockery', 'desiccating', 'draining', 'cutlery', 'flatware', 'dish rack', 'air-drying']]
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
    const speed = 0.01;
    let drawnSegments = [];

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Точки
      ctx.font = 'bold 12px Arial';
      coordinates.forEach(([x, y], i) => {
        const isStart = found[0] === i + 1;
        const isFinish = found[found.length - 1] === i + 1;
        ctx.fillStyle = isStart ? 'green' : isFinish ? 'magenta' : 'red';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        if (isStart || isFinish) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'black';
          ctx.stroke();
        }
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, x, y);
      });

      // Готовые отрезки
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 1;
      drawnSegments.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Анимация текущей стрелки
      if (stepIndex < found.length) {
        const [x1, y1] = coordinates[found[stepIndex - 1] - 1];
        const [x2, y2] = coordinates[found[stepIndex] - 1];
        const currentX = x1 + (x2 - x1) * progress;
        const currentY = y1 + (y2 - y1) * progress;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLength = 10;
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(currentX - arrowLength * Math.cos(angle - 0.3), currentY - arrowLength * Math.sin(angle - 0.3));
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(currentX - arrowLength * Math.cos(angle + 0.3), currentY - arrowLength * Math.sin(angle + 0.3));
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

    animate();
  };

  return () => cancelAnimationFrame(animationFrameId);
}, [userText, found, animationTrigger]); // 👈 добавлено animationTrigger


  return (
    <div className="semantic-container">
  <div className="semantic-thankyou">
    <h2>Thank you for your participation!</h2>
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
    <h3>Analysis Results</h3>
    <div className="metric"><span>🧠 Found categories:</span><span>{found.join(', ')}</span></div>
    <div className="metric"><span>🔄 Transitions between fields:</span><span>{transitions}</span></div>
    <div className="metric"><span>📉 Missing categories:</span><span>{missing.join(', ')}</span></div>
    <div className="metric"><span>📈 Graph density:</span><span>{density.toFixed(3)}</span></div>
    <div className="metric"><span>📏 Path distance:</span><span>{distance.toFixed(1)}</span></div>
    <div className="metric highlight-index">
      <strong>Cognitive impairment index:</strong>
      <strong>{index.toFixed(2)}</strong>
    </div>
  </div>

  <div className="semantic-graph-wrapper">
  <canvas ref={canvasRef} />
  <div className="replay-button-wrapper">
    <button
      className="replay-button"
      onClick={() => setAnimationTrigger(prev => prev + 1)}
    >
      🔁 Повторить анимацию
    </button>
  </div>
</div>

<div className="semantic-details">
  <div className="semantic-dictionary">
    <h3>Category dictionary</h3>
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
