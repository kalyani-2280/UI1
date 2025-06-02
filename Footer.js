import React from 'react';

const Footer = ({ activeDot }) => {
  return (
    <footer className="bg-white p-6 text-center mt-auto shadow-md rounded-t-lg">
      <div className="flex justify-center space-x-2 mb-2">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === activeDot ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          ></span>
        ))}
      </div>
      <div className="text-gray-600 text-sm">
        &copy; 2024 MEDHAVI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;