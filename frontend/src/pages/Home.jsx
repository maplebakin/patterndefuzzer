import { useState } from 'react';
import './Home.css'; // optional if you want custom styles

export default function Home() {
  const [url, setUrl] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScrape = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setOutput('');
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/patterns/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (data.success) {
        setOutput(data.data);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🧶 Pattern Defuzzer</h1>
      <p>Paste a pattern URL and get the cozy version ✨</p>

      <input
        type="text"
        placeholder="https://www.garnstudio.com/pattern.php?id=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />

      <button
        onClick={handleScrape}
        disabled={loading}
        style={{ padding: '0.5rem 1rem', cursor: loading ? 'wait' : 'pointer' }}
      >
        {loading ? 'Defuzzing...' : 'Fetch Pattern'}
      </button>

      {error && <p style={{ color: 'crimson', marginTop: '1rem' }}>⚠️ {error}</p>}

      {output && (
        <pre
          style={{
            background: '#fdf6f0',
            border: '1px solid #ddd',
            padding: '1rem',
            whiteSpace: 'pre-wrap',
            marginTop: '2rem',
          }}
        >
          {output}
        </pre>
      )}
    </div>
  );
}
