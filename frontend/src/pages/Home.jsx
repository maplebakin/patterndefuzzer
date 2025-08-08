import React, { useState, useRef } from "react";
import "../global.css";

const isLikelyUrl = (str) => {
  try {
    const u = new URL(str.trim());
    return !!u.protocol && !!u.hostname;
  } catch {
    return false;
  }
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null); // { formatted, sourceUrl, cached? }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef(null);

  const handleScrape = async () => {
    if (!isLikelyUrl(url)) {
      setError("Please paste a valid URL (include http/https).");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const res = await fetch("/api/patterns/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: abortRef.current.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Something went wrong while defuzzing.");
      } else if (data?.success && data?.data?.formatted) {
        setResult({
          formatted: data.data.formatted,
          sourceUrl: data.data?.sourceUrl || url,
          cached: !!data.cached,
        });
      } else {
        setError(data?.message || "Unknown error occurred.");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        setError("Failed to connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.formatted) return;
    try {
      await navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn’t copy to clipboard. You can select and copy manually.");
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleScrape();
  };

  return (
    <div className="home-wrapper">
      <div className="intro-card">
        <h1 className="app-title">🧶 Pattern Defuzzer</h1>
        <p className="home-subtext">
          Paste a pattern link below and click <strong>Defuzz</strong>.<br />
          We’ll format a clean, readable summary with a link back to the source.
        </p>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="https://www.garnstudio.com/pattern.php?id=..."
          className="input-url"
          aria-label="Pattern URL"
        />

        <button
          onClick={handleScrape}
          disabled={loading || !url.trim()}
          className="defuzz-button"
        >
          {loading ? "Defuzzing…" : "Defuzz"}
        </button>

        {loading && (
          <div className="loading-box">
            <div className="spinner" aria-hidden="true" />
            <div>
              Working on it… this may take <strong>10–20 seconds</strong> on some sites.
            </div>
          </div>
        )}

        {error && <div className="error-text">⚠️ {error}</div>}

        <div className="footer-warning">
          ⚠️ For personal reference only. Please visit and support the original designer.
        </div>
      </div>

      {result?.formatted && (
        <div className="pattern-card">
          <div className="pattern-toolbar">
            <a
              className="source-link"
              href={result.sourceUrl}
              target="_blank"
              rel="noreferrer"
              title="Open original pattern (new tab)"
            >
              Visit original ↗
            </a>

            <button className="copy-button" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {result.cached && (
            <div className="cached-note">Served from cache for speed.</div>
          )}

          <pre className="pattern-output">{result.formatted}</pre>
        </div>
      )}
    </div>
  );
}
