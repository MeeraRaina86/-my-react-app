const analyzeHealthClaim = async (text) => {
  setIsAnalyzing(true);
  try {
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `You are a medical fact-checker. Analyze this health claim and respond with ONLY valid JSON like:
{
  "verdict": "Likely Accurate",
  "confidence": 85,
  "explanation": "...",
  "sources": ["source1", "source2"],
  "redFlags": ["flag1", "flag2"]
}
Health claim: "${text}"`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API response error:", data);
      throw new Error(`API request failed: ${response.status}`);
    }

    const aiText = data?.choices?.[0]?.message?.content;

    console.log("✅ AI Raw Response:", aiText);

    const analysis = JSON.parse(aiText); // try/catch optional here too
    analysis.claim = text;
    setResult(analysis);

  } catch (error) {
    console.error("❌ Analysis failed:", error);
    setResult({
      claim: text,
      verdict: "Analysis Error",
      confidence: 0,
      explanation: "API is not responding correctly.",
      sources: [],
      redFlags: ["API Error"]
    });
  }

  setIsAnalyzing(false);
};
