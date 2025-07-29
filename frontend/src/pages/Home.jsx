import { useState } from 'react';
import './Home.css';


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
        headers: { 'Content-Type': 'application/json' },
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
    <div className="home-container">
      <h1>🧶 Pattern Defuzzer</h1>
      <p>Paste a pattern URL and get the cozy version ✨</p>

      <input
        type="text"
        placeholder="https://www.garnstudio.com/pattern.php?id=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={handleScrape} disabled={loading}>
        {loading ? 'Defuzzing...' : 'Fetch Pattern'}
      </button>

      {error && <p style={{ color: 'crimson', marginTop: '1rem' }}>⚠️ {error}</p>}

      {output && (
        <div className="card">
        <div className="preview-box checklist-box">
          {/* Split lines into header + content */}
          {(() => {
            const lines = output.split('\n');
            const headerLines = lines.filter(line =>
              line.startsWith('📌') || line.startsWith('🔗') || line.startsWith('🧵') || line.startsWith('🪝')
            );
            const contentLines = lines.slice(headerLines.length);

            return (
              <>
                {/* Pattern Header */}
                <div className="pattern-header">
                  {headerLines.map((line, idx) => (
                    <p key={idx} className="pattern-header-line">{line}</p>
                  ))}
                </div>

                {/* Main Body */}
                {contentLines.map((line, idx) => {
                  const rowMatch = line.match(/^Row\s*\d+.*?:\s*(.*)/i);
                  if (rowMatch) {
                    const rowLabel = line.split(':')[0];
                    const cleanedSteps = rowMatch[1]
                      .replace(/[()]/g, '')
                      .split(/(?<=[^,]),\s+/)
                      .map((step, i) => (
                        <div key={i} className="step-line">
                          {step.trim()}
                        </div>
                      ));

                    return (
                      <div key={idx} className="row-block">
                        <label className="row-checkbox">
                          <input type="checkbox" />
                          <strong>{rowLabel}</strong>
                        </label>
                        <div className="row-steps">{cleanedSteps}</div>
                      </div>
                    );
                  }

                  if (line.includes('Pattern Instructions')) {
  return (
    <div key={idx} style={{ margin: '0rem 0' }}>
      <hr style={{ margin: '0rem 0' }} />
      <p style={{ margin: '0', color: '#b48ead', fontWeight: 600 }}>
        🧶 {line}
      </p>
      <hr style={{ margin: '0rem 0' }} />
    </div>
  );
}



                  return <p key={idx} style={{ margin: '0rem 0px' }}>{line}</p>;
                })}
              </>
            );
          })()}
        </div></div>
      )}
    </div>
  );
}
