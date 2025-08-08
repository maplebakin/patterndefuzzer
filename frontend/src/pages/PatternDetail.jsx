import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function PatternDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pattern, setPattern] = useState(null);   // raw record if found
  const [formatted, setFormatted] = useState(""); // pretty text if available
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    async function fetchPattern() {
      setLoading(true);
      setError("");
      setPattern(null);
      setFormatted("");

      try {
        const res = await fetch(`/api/patterns/${id}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          // Our backend currently returns 404 for detail (placeholder)
          setError("This pattern isn’t stored yet. Try defuzzing it from the Home page.");
          return;
        }

        // Support both shapes:
        //  A) { success: true, data: {..., formatted, sourceUrl } }
        //  B) a stored record object directly
        const payload = data?.data ?? data;

        if (!payload) {
          setError("Pattern not found.");
          return;
        }

        if (alive) {
          setPattern(payload);
          setFormatted(payload.formatted || payload.instructions || "");
        }
      } catch (err) {
        setError("Error loading pattern. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchPattern();
    return () => { alive = false; };
  }, [id]);

  const handleCopy = async () => {
    const text = formatted || pattern?.instructions || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Couldn’t copy to clipboard. You can select and copy manually.");
    }
  };

  if (loading) return <div className="loading-box">Loading pattern…</div>;

  if (error) {
    return (
      <div style={{ maxWidth: 720, margin: "2rem auto", color: "#eee" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "#78e6d6", color: "#222", border: "none", borderRadius: 6, padding: "0.3rem 1rem", marginBottom: 20, cursor: "pointer" }}
        >
          ← Back
        </button>

        <div className="error-text" style={{ marginBottom: 16 }}>⚠️ {error}</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            to="/"
            style={{ background: "#78e6d6", color: "#222", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}
          >
            Defuzz a Pattern
          </Link>
          <Link
            to="/patterns"
            style={{ background: "#333", color: "#eee", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}
          >
            ← Back to Pattern List
          </Link>
        </div>
      </div>
    );
  }

  if (!pattern) return null;

  const src = pattern.sourceUrl || pattern.source || "";

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", color: "#eee" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "#78e6d6",
          color: "#222",
          border: "none",
          borderRadius: 6,
          padding: "0.3rem 1rem",
          marginBottom: 20,
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h2 style={{ fontSize: "2rem", marginBottom: 10 }}>
        {pattern.title || "Untitled Pattern"}
      </h2>

      {src && (
        <div style={{ marginBottom: 8 }}>
          <strong>Source:</strong>{" "}
          <a href={src} target="_blank" rel="noopener noreferrer" style={{ color: "#78e6d6", wordBreak: "break-all" }}>
            {src}
          </a>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
        <div><strong>Yarn:</strong> {pattern.yarn || "—"}</div>
        <div><strong>Hook:</strong> {pattern.hookSize || "—"}</div>
        <div><strong>Language:</strong> {pattern.language || "—"}</div>
        {pattern.difficulty && <div><strong>Difficulty:</strong> {pattern.difficulty}</div>}
      </div>

      {Array.isArray(pattern.images) && pattern.images.length > 0 && (
        <div style={{ margin: "1rem 0" }}>
          <strong>Images:</strong>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
            {pattern.images.map((img, idx) =>
              img.url ? (
                <img
                  key={idx}
                  src={img.url}
                  alt={img.alt || "Pattern image"}
                  style={{ maxWidth: 160, borderRadius: 10 }}
                />
              ) : null
            )}
          </div>
        </div>
      )}

      <div style={{ margin: "1.2rem 0" }}>
        <strong>Formatted Summary:</strong>
        <div>
          <button
            onClick={handleCopy}
            style={{
              background: "#78e6d6",
              color: "#222",
              border: "none",
              borderRadius: 6,
              padding: "4px 12px",
              cursor: "pointer",
              margin: "8px 0",
            }}
          >
            {copied ? "Copied!" : "Copy Summary"}
          </button>
        </div>
        <pre
          style={{
            background: "#161616",
            padding: "1rem",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            marginTop: 8,
            fontSize: "1.05rem",
          }}
        >
          {formatted || "No formatted summary available."}
        </pre>
      </div>

      {pattern.assembly && pattern.assembly.trim() && (
        <div style={{ margin: "1rem 0" }}>
          <strong>Assembly/Finishing (raw):</strong>
          <pre
            style={{
              background: "#222",
              padding: "0.8rem",
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
              marginTop: 8,
              fontSize: "1rem",
            }}
          >
            {pattern.assembly}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          to="/patterns"
          style={{
            background: "#333",
            color: "#eee",
            padding: "6px 12px",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Back to Pattern List
        </Link>
        <Link
          to="/"
          style={{
            background: "#78e6d6",
            color: "#222",
            padding: "6px 12px",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Defuzz another pattern
        </Link>
      </div>
    </div>
  );
}
