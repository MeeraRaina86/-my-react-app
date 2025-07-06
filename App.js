import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const HealthFactChecker = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Gemini API integration
  const analyzeHealthClaim = async (text) => {
    setIsAnalyzing(true);
    
    try {
      // Replace 'YOUR_API_KEY' with your actual Gemini API key
      console.log("🔑 Gemini API Key from ENV:", process.env.REACT_APP_GEMINI_API_KEY);
      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'demo-key';
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
      
      const prompt = `
        You are a medical fact-checker. Analyze this health claim and respond with a JSON object containing:
        - verdict: "Likely Accurate", "Likely False", or "Needs More Context"
        - confidence: number 0-100
        - explanation: detailed explanation of why the claim is accurate/false
        - sources: array of relevant medical sources that support your analysis
        - redFlags: array of concerning aspects if any
        
        Health claim to analyze: "${text}"
        
        Base your analysis on established medical guidelines from WHO, CDC, Mayo Clinic, and peer-reviewed research.
        Be especially skeptical of rapid weight loss claims, miracle cures, and "doctors hate this trick" type statements.
        
        Respond only with valid JSON in this format:
        {
          "verdict": "...",
          "confidence": 85,
          "explanation": "...",
          "sources": ["source1", "source2"],
          "redFlags": ["flag1", "flag2"]
        }
      `;

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
                  text: prompt
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
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response
      const analysis = JSON.parse(aiResponse);
      analysis.claim = text;
      
      setResult(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Fallback to mock analysis if API fails
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

  const handleSubmit = () => {
    if (inputText.trim()) {
      analyzeHealthClaim(inputText);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'Likely Accurate': return 'text-green-600';
      case 'Likely False': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'Likely Accurate': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'Likely False': return <XCircle className="w-6 h-6 text-red-600" />;
      default: return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Health Fact Checker
          </h1>
          <p className="text-gray-600">
            Verify health claims and weight loss information with AI-powered analysis
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="healthClaim" className="block text-sm font-medium text-gray-700 mb-2">
                Enter health claim or weight loss statement:
              </label>
              <textarea
                id="healthClaim"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., 'This supplement helps you lose 10 pounds in 3 days' or 'Drinking green tea boosts metabolism'"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isAnalyzing || !inputText.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Check Health Claim
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              {getVerdictIcon(result.verdict)}
              <h2 className={`text-2xl font-bold ${getVerdictColor(result.verdict)}`}>
                {result.verdict}
              </h2>
              <span className="text-sm text-gray-500">
                Confidence: {result.confidence}%
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Analysis:</h3>
                <p className="text-gray-700">{result.explanation}</p>
              </div>

              {result.redFlags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Red Flags:</h3>
                  <ul className="list-disc list-inside text-red-600 space-y-1">
                    {result.redFlags.map((flag, index) => (
                      <li key={index}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Reliable Sources:</h3>
                <ul className="list-disc list-inside text-blue-600 space-y-1">
                  {result.sources.map((source, index) => (
                    <li key={index} className="hover:underline cursor-pointer">{source}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> This analysis is for informational purposes only. 
                  Always consult with healthcare professionals for medical advice.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Example Claims */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Try these examples:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setInputText("This miracle supplement helps you lose 10 pounds in 3 days!")}
              className="text-left p-3 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              <div className="text-sm font-medium text-red-800">Suspicious Claim</div>
              <div className="text-sm text-red-600">"Miracle supplement loses 10 pounds in 3 days"</div>
            </button>
            <button
              onClick={() => setInputText("Drinking water before meals can help with weight management")}
              className="text-left p-3 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
            >
              <div className="text-sm font-medium text-green-800">Reasonable Claim</div>
              <div className="text-sm text-green-600">"Drinking water helps with weight management"</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthFactChecker;
