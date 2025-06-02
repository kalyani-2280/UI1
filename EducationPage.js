import React, { useState, useEffect } from 'react';
import LoadingIndicator from '../components/LoadingIndicator';

const EducationPage = ({ apiKey }) => {
  const [board, setBoard] = useState('');
  const [standard, setStandard] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [learningContentOutput, setLearningContentOutput] = useState(
    'Select your board, standard, and subject to generate personalized learning content.'
  );
  const [loadingEducation, setLoadingEducation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const backgroundImages = [
    'linear-gradient(135deg, #e0f2f7 0%, #0369a1 100%)',
    'linear-gradient(135deg, #d1e7dd 0%, #064e3b 100%)',
    'linear-gradient(135deg, #fef3c7 0%, #854d0e 100%)',
    'linear-gradient(135deg, #fce7f3 0%, #9f1239 100%)',
    'linear-gradient(135deg, #eef2ff 0%, #4338ca 100%)'
  ];

  const boards = ["CBSE", "ICSE", "State Board (Maharashtra)", "State Board (Karnataka)"];
  const standards = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
  const subjects = ["Mathematics", "Science", "English", "History", "Geography", "Physics", "Chemistry", "Biology"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleGenerateLearningContent = async () => {
    if (!board || !standard || !subject) {
      setLearningContentOutput('Please select Board, Standard, and Subject.');
      return;
    }

    if (!apiKey) {
      setLearningContentOutput('API key is required for this feature. Please add your Gemini API key.');
      return;
    }

    setLoadingEducation(true);
    try {
      let prompt = `Generate a brief overview of learning content for the Indian curriculum. Board: ${board}, Standard: ${standard}, Subject: ${subject}.`;
      if (chapter) {
        prompt += ` Chapter: ${chapter}.`;
      }
      prompt += ` Provide key concepts and a brief summary.`;

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
        setLearningContentOutput(result.candidates[0].content.parts[0].text);
      } else {
        setLearningContentOutput('Could not generate learning content. Please try again.');
      }
    } catch (error) {
      console.error('Error in education API call:', error);
      setLearningContentOutput('Error fetching learning content. Please check your network or API key.');
    } finally {
      setLoadingEducation(false);
    }
  };

  return (
    <section
      className="py-16 px-4 min-h-screen transition-all duration-1000"
      style={{ background: backgroundImages[currentImageIndex] }}
    >
      <div className="text-center max-w-6xl mx-auto">
        <h1 className=" text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>

🎓EDUCATION<span className="text-orange-400"> AI</span></h1>
        <p className="text-lg text-gray-600 mb-8">
          Personalized learning content for Indian curriculum.
        </p>

        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-orange-500 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-left">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Board *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
              >
                <option value="">Select Board</option>
                {boards.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Standard *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
              >
                <option value="">Select Standard</option>
                {standards.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Subject *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Chapter (Optional)</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Enter chapter name"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleGenerateLearningContent}
            disabled={loadingEducation}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center mx-auto disabled:opacity-50"
          >
            <span className="mr-2">Generate Learning Content ✨</span>
            {loadingEducation && <LoadingIndicator />}
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg mt-8 border-2 border-transparent hover:border-orange-500 transition-all">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-left">AI Generated Learning Content</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-700 text-left">
            <div className="flex items-start">
              <span className="text-4xl mr-4 mt-2">📖</span>
              <div className="whitespace-pre-wrap">{learningContentOutput}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationPage;