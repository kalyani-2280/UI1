import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HealthcarePage from './pages/HealthcarePage';
import EducationPage from './pages/EducationPage';
import ImageEditingPage from './pages/ImageEditingPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home-page');

  // Add your Gemini API key here for testing
  const apiKey = ""; // Replace with your actual API key

  const renderPage = () => {
    switch (currentPage) {
      case 'home-page':
        return <HomePage />;
      case 'healthcare-page':
        return <HealthcarePage apiKey={apiKey} />;
      case 'education-page':
        return <EducationPage apiKey={apiKey} />;
      case 'image-editing-page':
        return <ImageEditingPage apiKey={apiKey} />;
      default:
        return <HomePage />;
    }
  };

  const getFooterDotIndex = () => {
    switch (currentPage) {
      case 'home-page': return 0;
      case 'healthcare-page': return 1;
      case 'education-page': return 2;
      case 'image-editing-page': return 3;
      default: return 0;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header setCurrentPage={setCurrentPage} currentPage={currentPage} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer activeDot={getFooterDotIndex()} />
    </div>
  );
}

export default App;