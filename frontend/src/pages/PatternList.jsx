// frontend/src/pages/PatternList.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function PatternList() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPatterns() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/patterns');
        const data = await res.json();
        if (data.success) {
          setPatterns(data.data);
        } else {
          setError('Failed to load patterns.');
        }
      } catch (err) {
        setError('Error loading patterns.');
      }
      setLoading(false);
    }
    fetchPatterns();
  }, []);

  if (loading) return <div>Loading patterns…</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!patterns.length) return <div>No patterns found yet. Try defuzzing one!</div>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Your Defuzzed Patterns</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {patterns.map(pattern => (
          <div
            key={pattern._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 12,
              padding: '1rem',
              background: '#222',
              color: '#eee',
            }}
          >
            <h3>{pattern.title || 'Untitled Pattern'}</h3>
            <div>
              <strong>Source:</strong>{' '}
              <a href={pattern.sourceUrl || pattern.source} target="_blank" rel="noopener noreferrer">
                {pattern.sourceUrl || pattern.source}
              </a>
            </div>
            <div>
              <strong>Yarn:</strong> {pattern.yarn}
            </div>
            <div>
              <strong>Hook size:</strong> {pattern.hookSize}
            </div>
            <div>
              <strong>Language:</strong> {pattern.language}
            </div>
            <div style={{ marginTop: 8 }}>
              <Link
                to={`/patterns/${pattern._id}`}
                style={{
                  background: '#78e6d6',
                  color: '#222',
                  padding: '4px 12px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
