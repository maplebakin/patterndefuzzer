// frontend/src/pages/Home.jsx
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDefuzz = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await axios.post('http://localhost:3000/api/scrape', { url });
      setResult(response.data);
    } catch (err) {
      setError('Something went wrong while fetching the pattern.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container" style={{ padding: '2rem', fontFamily: 'serif' }}>
      <h1>🧵 Pattern Defuzzer</h1>
      <p>Paste a crochet pattern URL below to begin defuzzing:</p>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/my-pattern"
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />
      <button onClick={handleDefuzz} disabled={loading || !url.trim()}>
        {loading ? 'Defuzzing...' : 'Defuzz Pattern'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '1rem' }}>
          <h2>🧶 Defuzzed Output</h2>
          <p><strong>Title:</strong> {result.title}</p>
          <p><strong>Source:</strong> <a href={result.source} target="_blank" rel="noreferrer">{result.source}</a></p>
          <p><strong>Yarn:</strong> {result.yarn}</p>
          <p><strong>Hook Size:</strong> {result.hookSize}</p>
          <pre style={{ background: '#fff', padding: '1rem', border: '1px solid #ccc' }}>
{result.formatted}
          </pre>
        </div>
      )}
    </div>
  );
}
