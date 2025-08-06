import React, { useState } from "react";

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
    <div style={{ maxWidth: 680, margin: "2rem auto", color: "#eee" }}>
      <h2>Pattern Defuzzer (Stateless MVP)</h2>
      <p>
        Paste a pattern link below and click <strong>Defuzz</strong>.<br/>
        The formatted pattern will appear below for you to copy and use as you wish.
      </p>
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="Paste pattern URL here"
        style={{ width: "90%", padding: 10, borderRadius: 6, marginBottom: 10 }}
      />
      <button
        onClick={handleScrape}
        disabled={loading || !url.trim()}
        style={{
          background: "#78e6d6",
          color: "#222",
          padding: "8px 18px",
          borderRadius: 6,
          marginLeft: 12,
          fontWeight: 600,
        }}
      >
        {loading ? "Defuzzing..." : "Defuzz"}
      </button>

      {error && <div style={{ color: "salmon", margin: "1rem 0" }}>{error}</div>}

      {output && (
        <div style={{ margin: "2rem 0", background: "#232323", padding: 24, borderRadius: 10 }}>
          <button
            onClick={handleCopy}
            style={{
              background: "#78e6d6",
              color: "#222",
              border: "none",
              borderRadius: 6,
              padding: "4px 12px",
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
              fontSize: "1.1rem",
              marginTop: 16,
            }}
          >
            {output}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 14, color: "#aaa" }}>
        ⚠️ For personal use only. Always check pattern permissions and support the original designer.
      </div>
    </div>
  );
}
