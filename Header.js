import React from 'react';

const Header = ({ setCurrentPage, currentPage }) => {
  const navLinks = [
    { name: 'Home', page: 'home-page' },
    { name: 'Healthcare', page: 'healthcare-page' },
    { name: 'Education', page: 'education-page' },
    { name: 'Image Editing', page: 'image-editing-page' },
  ];

  return (
    <header className="bg-white p-4 shadow-md rounded-b-lg">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center text-2xl font-bold text-gray-700">
          <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
            🤖
          </div>
          MEDHAVI
        </div>
        <nav className="flex space-x-4">
          {navLinks.map((link) => (
            <button
              key={link.page}
              type="button"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === link.page
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:border-orange-500 border-2 border-transparent'
              }`}
              onClick={() => setCurrentPage(link.page)}
            >
              {link.name}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;