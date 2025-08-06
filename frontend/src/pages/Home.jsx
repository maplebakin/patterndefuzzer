import { useState } from 'react';
import './Home.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [batchMode, setBatchMode] = useState(false);

  const handleSingleScrape = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setOutput(null);
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

  const handleBatchScrape = async () => {
    const urlList = urls.split('\n').filter(u => u.trim());
    if (urlList.length === 0) return;

    setLoading(true);
    setOutput(null);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/patterns/scrape-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList }),
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy.');
    });
  };

  const saveAsTextFile = (text, title) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPatternCard = (pattern, index = 0) => {
    if (pattern.error) {
      return (
        <div key={index} className="card error-card">
          <h3>Error scraping pattern</h3>
          <p style={{ color: 'crimson' }}>⚠️ {pattern.error}</p>
          {pattern.details && <p><small>{pattern.details}</small></p>}
        </div>
      );
    }

    const { formatted, structured } = pattern;

    return (
      <div key={index} className="card preview-box">
        <pre className="formatted-output">{formatted}</pre>
        <div className="action-buttons">
          <button onClick={() => copyToClipboard(formatted)}>📋 Copy to Clipboard</button>
          <button className="save-btn" onClick={() => saveAsTextFile(formatted, structured?.title || 'pattern')}>
            💾 Save as .txt
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">
      <h1>Pattern Defuzzer</h1>
      <p>Paste pattern URL(s) and get the cozy, organized version</p>

      <div className="mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={batchMode}
            onChange={(e) => setBatchMode(e.target.checked)}
          />
          Batch mode (multiple URLs)
        </label>
      </div>

      {batchMode ? (
        <div className="batch-input">
          <textarea
            placeholder="https://www.garnstudio.com/pattern.php?id=...\nhttps://www.garnstudio.com/pattern.php?id=...\n(One URL per line)"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={5}
          />
          <button onClick={handleBatchScrape} disabled={loading}>
            {loading ? 'Defuzzing batch...' : 'Fetch All Patterns'}
          </button>
        </div>
      ) : (
        <div className="single-input">
          <input
            type="text"
            placeholder="https://www.garnstudio.com/pattern.php?id=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSingleScrape()}
          />
          <button onClick={handleSingleScrape} disabled={loading}>
            {loading ? 'Defuzzing...' : 'Fetch Pattern'}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p style={{ color: 'crimson', marginTop: '1rem' }}>
            ⚠️ {error}
          </p>
        </div>
      )}

      {output && (
        <div className="output-container">
          {Array.isArray(output) ? (
            <div className="batch-results">
              <h2>Batch Results ({output.length} patterns)</h2>
              {output.map((pattern, index) => renderPatternCard(pattern, index))}
            </div>
          ) : (
            renderPatternCard(output)
          )}
        </div>
      )}
    </div>
  );
}
