import React, { useState, useEffect } from 'react';
import LoadingIndicator from '../components/LoadingIndicator';

const HealthcarePage = ({ apiKey }) => {
  const [symptoms, setSymptoms] = useState('');
  const [healthAnalysisOutput, setHealthAnalysisOutput] = useState(
    'Enter your symptoms or upload an image to get AI-powered health insights. Remember: This is for informational purposes only.'
  );
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const backgroundImages = [
    'linear-gradient(135deg, #cffafe 0%, #0f172a 100%)',
    'linear-gradient(135deg, #dbeafe 0%, #1e293b 100%)',
    'linear-gradient(135deg, #f0f9ff 0%, #0c4a6e 100%)',
    'linear-gradient(135deg, #f0fdf4 0%, #065f46 100%)',
    'linear-gradient(135deg, #ecfdf5 0%, #0f766e 100%)'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleGetHealthAnalysis = async () => {
    if (!symptoms.trim()) {
      setHealthAnalysisOutput('Please describe your symptoms.');
      return;
    }

    if (!apiKey) {
      setHealthAnalysisOutput('API key is required for this feature. Please add your Gemini API key.');
      return;
    }

    setLoadingHealth(true);
    try {
      const prompt = `Analyze the following symptoms and provide a general, informational health insight. Remember, this is for informational purposes only and not a substitute for professional medical advice: "${symptoms}"`;
      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        setHealthAnalysisOutput(result.candidates[0].content.parts[0].text);
      } else {
        setHealthAnalysisOutput('Could not get health analysis. Please try again.');
      }
    } catch (error) {
      console.error('Error in health analysis:', error);
      setHealthAnalysisOutput('Error fetching health analysis. Please check your network or API key.');
    } finally {
      setLoadingHealth(false);
    }
  };

  return (
    <section
      className="py-16 px-4 min-h-screen transition-all duration-1000"
      style={{ background: backgroundImages[currentImageIndex] }}
    >
      <div className="text-center max-w-4xl mx-auto">
        <h1 className=" text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          🧑‍⚕️🩺 HEALTHCARE AI <span className="text-orange-400">ASSISTANT</span></h1>
        <p className="text-lg text-gray-600 mb-8">
          Describe symptoms for AI-powered health insights.
        </p>

        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-orange-500 transition-all">
          <div className="mb-6 text-left">
            <label htmlFor="symptoms" className="block text-gray-700 text-sm font-semibold mb-2">
              Describe your symptoms in detail:
            </label>
            <textarea
              id="symptoms"
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Example: I have been experiencing headaches for the past 2 days, along with mild fever and fatigue"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>

          <button
            onClick={handleGetHealthAnalysis}
            disabled={loadingHealth}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center mx-auto disabled:opacity-50"
          >
            <span className="mr-2">Get AI Health Analysis ✨</span>
            {loadingHealth && <LoadingIndicator />}
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg mt-8 border-2 border-transparent hover:border-orange-500 transition-all">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-left">AI Health Analysis</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-700 text-left">
            <div className="flex items-start">
              <span className="text-4xl mr-4 mt-2">🧠</span>
              <div className="whitespace-pre-wrap">{healthAnalysisOutput}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthcarePage;