import React, { useEffect, useMemo, useState } from 'react';
import './styles/MyTests.css';
import { auth, db } from '../firebase';
import { collection, getDocs, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore';
import SemanticGraph from './SemanticGraph.jsx';
import { useTranslation } from 'react-i18next';

function fmt(ts) {
  if (!ts) return '—';
  try {
    const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  } catch {
    return '—';
  }
}

export default function MyTests() {
  const { i18n, t } = useTranslation();
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // extracted semantic results (from SemanticGraph)
  const [extracted, setExtracted] = useState({
    found: [],
    missing: [],
    index: null
  });

  const selected = useMemo(
    () => tests.find(t => t.id === selectedId) || null,
    [tests, selectedId]
  );

  // Load tests from Firestore
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!uid) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users', uid, 'tests'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        if (!mounted) return;

        setTests(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        );
      } catch (e) {
        console.error('Failed to load tests:', e);
        setTests([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [uid]);

  // Save new AD test
  const saveTest = async (description, time) => {
    if (!uid) return;

    try {
      await addDoc(collection(db, "users", uid, "tests"), {
        description,
        time,
        createdAt: serverTimestamp(),
        type: "AD",
        score: extracted.index ?? null,   // ← KEY: AD SCORE SAVED
        numbersFound: extracted.found || [],
        numbersMissing: extracted.missing || []
      });
    } catch (e) {
      console.error("Error saving test:", e);
    }
  };

  // TEST DETAILS VIEW
  if (selected) {
    return (
      <div className="case-details">
        <div className="case-details-head">
          <button className="back-btn" onClick={() => setSelectedId(null)}>
            ← {t('cases.back')}
          </button>

          <div className="case-meta">
            <div>
              <strong>{t('date')}:</strong> {fmt(selected.createdAt)}
            </div>
            <div>
              <strong>{t('time_to_complete')}:</strong> {selected.time ?? '—'} {t('units.seconds_short')}
            </div>
          </div>
        </div>

        <SemanticGraph
          userText={selected.description || ''}
          onNumbersExtracted={(data) => setExtracted(data)} // receives index + found/missing
        />
      </div>
    );
  }

  // TESTS LIST
  if (loading) {
    return (
      <div className="cases-wrap">
        <h2>{t('nav_cases')}</h2>
        <div className="cases-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="case-card skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cases-wrap">
      <h2>{t('nav_cases')}</h2>

      {tests.length === 0 ? (
        <div className="empty">
          {t('cases.empty_prefix')} <strong>{t('nav_new_test')}</strong> {t('cases.empty_suffix')}
        </div>
      ) : (
        <div className="cases-grid">
          {tests.map((row, idx) => {
            const foundCount = Array.isArray(row.numbersFound)
              ? row.numbersFound.length
              : 0;

            const missingCount = Array.isArray(row.numbersMissing)
              ? row.numbersMissing.length
              : 19 - foundCount;

            return (
              <button
                key={row.id}
                className="case-card"
                onClick={() => setSelectedId(row.id)}
                title={t('cases.open_details')}
              >
                <div className="case-title">
                  {t('cases.test_n', { n: tests.length - idx })}
                </div>
                <div className="case-date">{fmt(row.createdAt)}</div>

                <div className="case-meta-line">
                  <span className="meta-chip time">
                    <span className="ico"></span>
                    {row.time ?? '—'} {t('units.seconds_short')}
                  </span>

                  <span className="meta-chip ok">
                    <span className="ico">✔</span>
                    {foundCount}
                  </span>

                  <span className="meta-chip bad">
                    <span className="ico">✕</span>
                    {missingCount}
                  </span>

                  <span className="meta-chip score">
                    <span className="ico">★</span>
                    {row.score != null ? row.score.toFixed(2) : "—"}
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
