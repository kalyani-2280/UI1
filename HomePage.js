import React, { useState, useEffect } from 'react';

const HomePage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    'linear-gradient(135deg, #e0f2f7 0%, #334155 100%)',
    'linear-gradient(135deg, #d1e7dd 0%, #1f2937 100%)',
    'linear-gradient(135deg, #fef3c7 0%, #4b5563 100%)',
    'linear-gradient(135deg, #fce7f3 0%, #374151 100%)',
    'linear-gradient(135deg, #eef2ff 0%, #2a3340 100%)'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <section
      className="py-16 px-4 min-h-screen transition-all duration-1000"
      style={{ background: backgroundImages[currentImageIndex] }}
    >
      <div className="text-center max-w-6xl mx-auto">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-4 tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}> 
           
          🤖 Welcome to <span className="text-orange-500">MEDHAVI</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-2xl mx-auto font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
          A modern platform combining AI technology with cultural wisdom for healthcare, education, and creativity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🏥', title: 'Healthcare', desc: 'AI-powered health analysis and wellness guidance for better living.' },
            { icon: '🎨', title: 'Image Editing', desc: 'Creative AI tools for image enhancement and artistic generation.' },
            { icon: '📚', title: 'Education', desc: 'Personalized learning with AI tutoring for Indian curriculum.' }
          ].map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-orange-500">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{card.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePage;