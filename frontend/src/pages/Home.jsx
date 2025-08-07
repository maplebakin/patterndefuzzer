import React, { useState } from "react";
import "../global.css";

export default function Home() {
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleScrape = async () => {
    setLoading(true);
    setError("");
    setOutput(null);
    setCopied(false);

    try {
      const res = await fetch("/api/patterns/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.success) {
        setOutput(data.data.formatted);
      } else {
        setError(data.message || "Unknown error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    }

    setLoading(false);
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="home-wrapper">
      <div className="intro-card">
        <h1 className="app-title">🧶 Pattern Defuzzer</h1>
        <p className="home-subtext">
          Paste a pattern link below and click <strong>Defuzz</strong>.
          <br />
          The formatted pattern will appear below for you to copy and use as you wish.
        </p>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste pattern URL here"
          className="input-url"
        />
        <button
          onClick={handleScrape}
          disabled={loading || !url.trim()}
          className="defuzz-button"
        >
          {loading ? "Defuzzing..." : "Defuzz"}
        </button>

        {error && <div className="error-text">{error}</div>}

        <div className="footer-warning">
          ⚠️ For personal use only. Always check pattern permissions and support the original designer.
        </div>
      </div>

      {output && (
        <div className="pattern-card">
          <button className="copy-button" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <pre className="pattern-output">{output}</pre>
        </div>
      )}
    </div>
  );
}
