// src/components/SemanticGraph.jsx
import React, { useEffect, useRef, useState } from 'react';
import '../components/styles/SemanticGraph.css';
import t1 from '../assets/t1.jpg';
import { useTranslation } from 'react-i18next';

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
  [19, ['dishes', 'dirty dishes', 'tableware', 'drying rack', 'plates', 'cups', 'cup', 'utensils']],
];

const dictionary = new Map();
rawDictionary.forEach(([num, words]) => words.forEach(w => dictionary.set(w.toLowerCase(), num)));


const coordinates = [
  [116.47, 362.44], [126.74, 242.71], [155.0, 63.0], [180.33, 90.27],
  [195.45, 30.9], [199.88, 144.65], [235.0, 118.16], [250.81, 436.19],
  [267.69, 297.73], [286.12, 186.62], [520.42, 175.35], [543.58, 260.94],
  [575.47, 200.31], [575.43, 500.97], [618.37, 346.37], [651.53, 290.97],
  [711.37, 192.37], [779.47, 124.25], [788.37, 402.37]
];

function getQuadrant(n) { return n <= 10 ? 'left' : 'right'; }

function analyzeText(rawText) {
  const clean = (rawText || '').toLowerCase().replace(/[^\w\s]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
  const found = words.map(w => dictionary.get(w)).filter(Boolean);
if (found.length === 0) {
  return {
    found,
    transitions: 0,
    missing: rawDictionary.map(([n]) => n),
    density: 0,
    distance: 0,
    index: 0,
    words: []
  };
}
  const transitions = found.reduce((sum, curr, i, arr) =>
    i === 0 ? sum : sum + (getQuadrant(curr) !== getQuadrant(arr[i - 1]) ? 1 : 0), 0);

  const unique = [...new Set(found)];
  const allNumbers = rawDictionary.map(([n]) => n);
  const missing = allNumbers.filter(n => !unique.includes(n));
  const density = unique.length / rawDictionary.length;

  let totalDistance = 0;
  for (let i = 1; i < found.length; i++) {
    const [x1, y1] = coordinates[found[i - 1] - 1];
    const [x2, y2] = coordinates[found[i] - 1];
    totalDistance += Math.hypot(x2 - x1, y2 - y1);
  }

  
            // coverage: сколько категорий найдено (0..1)
            const coverage = unique.length / rawDictionary.length;

            // coherence: связность (0..1)
            const transitionsNorm = found.length > 1 
              ? transitions / (found.length - 1)
              : 0;

            const coherence = 1 - transitionsNorm;

            // richness: насколько слова разнообразны (0..1)
            const richness = found.length > 0 
              ? (unique.length / found.length)
              : 0;

            // итоговый индекс 0..10
            const index = 10 * (
              0.5 * coverage +
              0.3 * coherence +
              0.2 * richness
            );


  const matched = words.filter(w => dictionary.has(w));

  return { found, transitions, missing, density, distance: totalDistance, index, words: matched };
}

function highlightWords(text, vocab) {
  if (!text) return null;
  const re = new RegExp(`\\b(${vocab.join('|')})\\b`, 'gi');
  return text.split(re).map((part, i) =>
    vocab.includes(part?.toLowerCase?.()) ? <span key={i} className="highlight">{part}</span> : part
  );
}

export default function SemanticGraph({ userText = '', onNumbersExtracted }) {
  const { i18n,t } = useTranslation();
  const canvasRef = useRef(null);
  const [animSeed, setAnimSeed] = useState(0);

  const { found, transitions, missing, density, distance, index, words } = analyzeText(userText);
  const uniqueFound = [...new Set(found)]; 

  
      useEffect(() => {
        if (typeof onNumbersExtracted === "function") {
          onNumbersExtracted({
            found: uniqueFound,
            missing,
            index
          });
        }
      }, [userText]);


 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = t1;

    let raf = null;

    const drawPointsAndLabels = () => {
      for (let i = 1; i <= coordinates.length; i++) {
        const [x, y] = coordinates[i - 1];

        
        const isFound = uniqueFound.includes(i);
        ctx.beginPath();
        ctx.arc(x, y, isFound ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isFound ? '#00ff37ff' : 'rgba(255,255,255,0.55)';
        ctx.fill();

        
        const lx = x + 10;
        const ly = y - 10;
        ctx.font = 'bold 20px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; 
        ctx.strokeText(String(i), lx, ly);
        ctx.fillStyle = isFound ? '#00ff2aff' : '#e6e6e6';
        ctx.fillText(String(i), lx, ly);
      }
    };

    const redrawBase = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      drawPointsAndLabels();
    };

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (found.length < 2) {
        redrawBase();
        return;
      }

      let stepIndex = 1;
      let stepStart = performance.now();
      const stepDuration = 700;

      const render = now => {
        const progress = Math.min(1, (now - stepStart) / stepDuration);

        redrawBase();

       
        ctx.strokeStyle = '#ff0000ff';
        ctx.lineWidth = 2;
        for (let i = 1; i < stepIndex; i++) {
          const [x1, y1] = coordinates[found[i - 1] - 1];
          const [x2, y2] = coordinates[found[i] - 1];
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

       
        if (stepIndex < found.length) {
          const [x1, y1] = coordinates[found[stepIndex - 1] - 1];
          const [x2, y2] = coordinates[found[stepIndex] - 1];
          const cx = x1 + (x2 - x1) * progress;
          const cy = y1 + (y2 - y1) * progress;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(cx, cy);
          ctx.stroke();

          const ang = Math.atan2(y2 - y1, x2 - x1);
          const L = 10;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - L * Math.cos(ang - 0.3), cy - L * Math.sin(ang - 0.3));
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - L * Math.cos(ang + 0.3), cy - L * Math.sin(ang + 0.3));
          ctx.stroke();
        }

        if (progress >= 1) {
          stepIndex++;
          stepStart = now;
          if (stepIndex <= found.length) raf = requestAnimationFrame(render);
        } else {
          raf = requestAnimationFrame(render);
        }
      };

      raf = requestAnimationFrame(render);
    };

    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [animSeed, userText, found, uniqueFound]);

  return (
    <div className="semantic-container">
      

      <div className="semantic-metrics">
        <h3>{t('graph.title')}</h3>
        <div className="metrics-table">
          <div className="metric-row"><span className="metric-label">{t('graph.found_seq')}</span><span className="metric-value">{found.join(', ')}</span></div>
          <div className="metric-row"><span className="metric-label">{t('graph.transitions')}</span><span className="metric-value">{transitions}</span></div>
          <div className="metric-row"><span className="metric-label">{t('graph.missing')}</span><span className="metric-value">{missing.join(', ')}</span></div>
          <div className="metric-row"><span className="metric-label">{t('graph.density')}</span><span className="metric-value">{density.toFixed(3)}</span></div>
          <div className="metric-row"><span className="metric-label">{t('graph.distance')}</span><span className="metric-value">{distance.toFixed(1)}</span></div>
        </div>
        <div className="highlight-index-box">
          <span className="highlight-index-label">{t('graph.index_label')}</span>
          <span className="highlight-index-value">{index.toFixed(2)}</span>
        </div>
      </div>

      <div className="semantic-graph-wrapper">
        <canvas ref={canvasRef} />
        <div className="replay-button-wrapper">
       <button className="replay-button" onClick={() => setAnimSeed(x => x + 1)}>
            {t('graph.replay')}
         </button>
        </div>
      </div>

      <div className="semantic-io">
        <div className="dictionary-block">
          <h3>{t('graph.dict_title')}</h3>
          <div className="semantic-dictionary">
            {rawDictionary.map(([num, words]) => (
              <div className="category-row" key={num}>
                <div className="category-number">{num}:</div>
                <div className="category-words">{words.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="usertext-block">
         <h3>{t('graph.your_text')}</h3>
          <div className="usertext-box">
            {highlightWords(userText, [...dictionary.keys()])}
          </div>
        </div>
      </div>
    </div>
  );
}
