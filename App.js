import React, { useState } from 'react';

const App = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeHealthClaim = async () => {
    setLoading(true);
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const API_URL = `https://api.openai.com/v1/chat/completions`;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `You are a medical fact-checker. Analyze this health claim and respond with ONLY valid JSON like:
{
  "verdict": "Likely Accurate",
  "confidence": 85,
  "explanation": "...",
  "sources": ["source1", "source2"],
  "redFlags": ["flag1", "flag2"]
}
Health claim: "${input}"`
            }
          ]
        })
      });

      if (!res.ok) throw new Error(`API request failed: ${res.status}`);

      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content;

      console.log("🔍 Raw AI Response:", rawText);

      const parsed = JSON.parse(rawText);
      setResult({ ...parsed, claim: input });

    } catch (err) {
      console.error("❌ Error:", err);
      setResult({
        claim: input,
        verdict: "API Error",
        confidence: 0,
        explanation: "Could not analyze due to an API error.",
        sources: [],
        redFlags: ["API Error"]
      });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>🩺 Health Fact Checker</h1>
      
      <textarea
        rows="4"
        style={{ width: "100%", padding: "1rem", borderRadius: "6px", border: "1px solid #ccc" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter a health claim to verify..."
      />

      <button
        onClick={analyzeHealthClaim}
        disabled={loading || !input.trim()}
        style={{
          marginTop: "1rem",
          backgroundColor: loading ? "#ccc" : "#007BFF",
          color: "white",
          padding: "0.75rem 1.5rem",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Analyzing..." : "Check Claim"}
      </button>

      {result && (
        <div style={{
          marginTop: "2rem",
          background: "#f9f9f9",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #eee"
        }}>
          <h3>Verdict: <span style={{ color: result.verdict === 'Likely False' ? 'red' : result.verdict === 'Likely Accurate' ? 'green' : 'orange' }}>{result.verdict}</span></h3>
          <p><strong>Confidence:</strong> {result.confidence}%</p>
          <p><strong>Explanation:</strong> {result.explanation}</p>

          {result.redFlags?.length > 0 && (
            <div>
              <strong>Red Flags:</strong>
              <ul>
                {result.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {result.sources?.length > 0 && (
            <div>
              <strong>Sources:</strong>
              <ul>
                {result.sources.map((src, idx) => (
                  <li key={idx}>{src}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
