import React, { useEffect, useMemo, useState } from 'react';
import './styles/MyTests.css';
import { auth, db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import SemanticGraph from './SemanticGraph.jsx';


function fmt(ts) {
  if (!ts) return '—';
  try {
    const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  } catch {
    return '—';
  }
}


const rawDictionary = [
  [1, ['girl','sister','kid','child','daughter','schoolgirl','female child','young girl','juvenile']],
  [2, ['shushing','silencing','warning','gesturing','alerting','signaling','pointing','communicating']],
  [3, ['jar','container','canister','tub','bottle','tin','storage jar','food jar','vessel']],
  [4, ['shelf','cupboard','cabinet','storage','closet','compartment','wall unit','kitchen shelf']],
  [5, ['cookies','biscuits','snacks','treats','sweets','baked goods','goodies','pastries']],
  [6, ['handing','passing','giving','offering','sharing','delivering','presenting']],
  [7, ['stealing','taking','reaching','snatching','grabbing','pilfering','thieving']],
  [8, ['stool','stepstool','ladder','bench','footstool','seat','unsteady base']],
  [9, ['wobbling','unsteady','teetering','unstable','shaky','swaying','rocking']],
  [10, ['boy','brother','kid','child','male child','schoolboy','youngster']],
  [11, ['mother','woman','lady','mom','housewife','female','adult','parent']],
  [12, ['washing','drying','cleaning','wiping','rinsing','scrubbing','polishing']],
  [13, ['plate','dish','ceramic plate','tableware','crockery','platter','china']],
  [14, ['water','puddle','spill','overflow','flood','wet floor','liquid','splash']],
  [15, ['sink','basin','washbasin','overflowing sink','drain','flooded sink']],
  [16, ['faucet','tap','spigot','valve','nozzle','running water']],
  [17, ['window','pane','glass','windowpane','casement']],
  [18, ['curtains','drapes','blinds','window coverings','hangings']],
  [19, ['dishes','dirty dishes','tableware','drying rack','plates','cups','cup','utensils']],
];
const dict = new Map(); rawDictionary.forEach(([n, ws]) => ws.forEach(w => dict.set(w.toLowerCase(), n)));
const ALL = rawDictionary.map(([n]) => n);

function fallbackCounts(description = '') {
  const words = description.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const nums = words.map(w => dict.get(w)).filter(Boolean);
  const uniq = [...new Set(nums)];
  const missing = ALL.filter(n => !uniq.includes(n));
  return { foundCount: uniq.length, missingCount: missing.length };
}
// -------------------------

export default function MyTests() {
  const uid = auth.currentUser?.uid;
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(() => tests.find(t => t.id === selectedId) || null, [tests, selectedId]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!uid) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'users', uid, 'tests'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!mounted) return;
        setTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Failed to load tests:', e);
        setTests([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [uid]);

  if (loading) {
    return (
      <div className="cases-wrap">
        <h2>My test cases</h2>
        <div className="cases-grid">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="case-card skeleton" />)}
        </div>
      </div>
    );
  }

  
  if (selected) {
    return (
      <div className="case-details">
        <div className="case-details-head">
          <button className="back-btn" onClick={() => setSelectedId(null)}>← Back to list</button>
          <div className="case-meta">
            <div><strong>Date:</strong> {fmt(selected.createdAt)}</div>
            <div><strong>Time to complete:</strong> {selected.time ?? '—'} s</div>
          </div>
        </div>

        
        <SemanticGraph userText={selected.description || ''} time={selected.time} />
      </div>
    );
  }

  
  return (
    <div className="cases-wrap">
      <h2>My test cases</h2>

      {tests.length === 0 ? (
        <div className="empty">
          You have no tests yet. Run a <strong>New test</strong> to see it here.
        </div>
      ) : (
        <div className="cases-grid">
          {tests.map((t, idx) => {
            const foundCount = Array.isArray(t.numbersFound)
              ? t.numbersFound.length
              : fallbackCounts(t.description).foundCount;

            const missingCount = Array.isArray(t.numbersMissing)
              ? t.numbersMissing.length
              : fallbackCounts(t.description).missingCount;

            return (
              <button
                key={t.id}
                className="case-card"
                onClick={() => setSelectedId(t.id)}
                title="Open test details"
              >
                <div className="case-title">Test {tests.length - idx}</div>
                <div className="case-date">{fmt(t.createdAt)}</div>

                <div className="case-meta-line">
                  <span className="meta-chip time">
                    <span className="ico">⏱</span> {t.time ?? '—'} s
                  </span>
                  <span className="meta-chip ok">
                    <span className="ico">✔</span> {foundCount}
                  </span>
                  <span className="meta-chip bad">
                    <span className="ico">✕</span> {missingCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
