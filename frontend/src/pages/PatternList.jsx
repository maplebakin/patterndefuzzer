// frontend/src/pages/PatternList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function PatternList() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/patterns');
      const data = await res.json();

      // Support both shapes:
      //  - placeholder: [] 
      //  - future: { success: true, data: [...] }
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      if (!Array.isArray(list)) {
        throw new Error('Unexpected response shape');
      }
      setPatterns(list);
    } catch (err) {
      setError('Failed to load patterns. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="loading-box">Loading patterns…</div>;

  if (error) {
    return (
      <div className="error-text" style={{ display: 'grid', gap: 12, maxWidth: 600, margin: '2rem auto' }}>
        <div>⚠️ {error}</div>
        <button className="defuzz-button" onClick={load}>Retry</button>
      </div>
    );
  }

  if (!patterns.length) {
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
        <h2>Your Defuzzed Patterns</h2>
        <p>No patterns found yet.</p>
        <p>Try defuzzing one from the Home page!</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto' }}>
      <h2>Your Defuzzed Patterns</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {patterns.map((pattern, idx) => {
          const id = pattern._id ?? String(idx);
          const src = pattern.sourceUrl || pattern.source || '';

          return (
            <div
              key={id}
              className="card"
              style={{
                border: '1px solid #333',
                borderRadius: 12,
                padding: '1rem',
                background: '#1e1e1e',
                color: '#eee',
              }}
            >
              <h3 style={{ margin: '0 0 .5rem' }}>{pattern.title || 'Untitled Pattern'}</h3>

              {src && (
                <div style={{ marginBottom: 6 }}>
                  <strong>Source:</strong>{' '}
                  <a href={src} target="_blank" rel="noopener noreferrer">
                    {src}
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div><strong>Yarn:</strong> {pattern.yarn || '—'}</div>
                <div><strong>Hook:</strong> {pattern.hookSize || '—'}</div>
                <div><strong>Language:</strong> {pattern.language || '—'}</div>
              </div>

              <div style={{ marginTop: 10 }}>
                <Link
                  to={`/patterns/${id}`}
                  className="button"
                  style={{
                    background: '#78e6d6',
                    color: '#222',
                    padding: '6px 12px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
