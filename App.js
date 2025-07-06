const analyzeHealthClaim = async (text) => {
  setIsAnalyzing(true);

  try {
    const API_KEY = 'AIzaSyA3J9Z1ptlKCGBRBsU3s3knQW8u2BrPGo0';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `You are a medical fact-checker. Analyze this health claim and respond ONLY with a JSON object like:
{
  "verdict": "...",
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
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Optional: log the raw AI text
    console.log("Raw AI text:", aiText);

    // Try to parse as JSON
    const analysis = JSON.parse(aiText);
    analysis.claim = text;
    setResult(analysis);
  } catch (error) {
    console.error('Analysis failed:', error);

    const mockAnalysis = {
      claim: text,
      verdict: 'Analysis Error',
      confidence: 0,
      explanation: 'Unable to analyze this claim at the moment. Please try again later.',
      sources: [],
      redFlags: ['API Error']
    };

    setResult(mockAnalysis);
  }

  setIsAnalyzing(false);
};
