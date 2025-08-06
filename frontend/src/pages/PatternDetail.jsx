import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function PatternDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pattern, setPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPattern() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/patterns/${id}`);
        const data = await res.json();
        if (data.success) {
          setPattern(data.data);
        } else {
          setError("Pattern not found.");
        }
      } catch (err) {
        setError("Error loading pattern.");
      }
      setLoading(false);
    }
    fetchPattern();
  }, [id]);

  const handleCopyInstructions = () => {
    if (pattern?.instructions) {
      navigator.clipboard.writeText(pattern.instructions);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  if (loading) return <div>Loading pattern…</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!pattern) return null;

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", color: "#eee" }}>
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
      <h2 style={{ fontSize: "2rem", marginBottom: 10 }}>{pattern.title}</h2>
      <div style={{ marginBottom: 8 }}>
        <strong>Source:</strong>{" "}
        <a
          href={pattern.sourceUrl || pattern.source}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#78e6d6" }}
        >
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
      <div>
        <strong>Difficulty:</strong> {pattern.difficulty}
      </div>
      {pattern.images && pattern.images.length > 0 && (
        <div style={{ margin: "1rem 0" }}>
          <strong>Images:</strong>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
        <strong>Instructions:</strong>
        <div>
          <button
            onClick={handleCopyInstructions}
            style={{
              background: "#78e6d6",
              color: "#222",
              border: "none",
              borderRadius: 6,
              padding: "4px 12px",
              cursor: "pointer",
              marginBottom: 8,
              marginTop: 8,
            }}
          >
            {copied ? "Copied!" : "Copy Instructions"}
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
          {pattern.instructions || "No instructions provided."}
        </pre>
      </div>
      {pattern.assembly && pattern.assembly.trim() && (
        <div style={{ margin: "1rem 0" }}>
          <strong>Assembly/Finishing:</strong>
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
      <div style={{ marginTop: 28 }}>
        <Link
          to="/patterns"
          style={{
            background: "#78e6d6",
            color: "#222",
            padding: "4px 12px",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          ← Back to Pattern List
        </Link>
      </div>
    </div>
  );
}
