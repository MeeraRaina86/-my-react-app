const analyzeHealthClaim = async (text) => {
  setIsAnalyzing(true);
console.log("Using OpenAI Key:", import.meta.env.VITE_OPENAI_API_KEY);
  try {
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a medical fact-checker. Analyze this health claim and respond with ONLY valid JSON like:
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
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("🔍 Raw AI response:", aiText);

    const analysis = JSON.parse(aiText);
    analysis.claim = text;
    setResult(analysis);
  } catch (error) {
    console.error('❌ Analysis failed:', error);

    setResult({
      claim: text,
      verdict: 'Analysis Error',
      confidence: 0,
      explanation: 'The API is not responding correctly right now. Please try again later.',
      sources: [],
      redFlags: ['API Error']
    });
  }

  setIsAnalyzing(false);
};
