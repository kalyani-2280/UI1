import React, { useState, useEffect, useRef } from 'react';
import LoadingIndicator from '../components/LoadingIndicator';

const ImageEditingPage = ({ apiKey }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState(null);
  const [imageDescriptionOutput, setImageDescriptionOutput] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef(null);

  const backgroundImages = [
    'linear-gradient(135deg, #fff7ed 0%, #9a3412 100%)',
    'linear-gradient(135deg, #fefce8 0%, #a16207 100%)',
    'linear-gradient(135deg, #f0fdf4 0%, #166534 100%)',
    'linear-gradient(135deg, #f0f9ff 0%, #1d4ed8 100%)',
    'linear-gradient(135deg, #fdf2f8 0%, #be185d 100%)'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImageBase64(e.target.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
      setImageDescriptionOutput('');
    } else {
      setUploadedImage(null);
      setUploadedImageBase64(null);
      setImageDescriptionOutput('');
    }
  };

  const handleDescribeImage = async () => {
    if (!uploadedImageBase64) {
      setImageDescriptionOutput('Please upload an image first.');
      return;
    }

    if (!apiKey) {
      setImageDescriptionOutput('API key is required for this feature. Please add your Gemini API key.');
      return;
    }

    setLoadingImage(true);
    try {
      const prompt = "Describe this image in detail, focusing on its content, style, and any notable features.";
      const payload = {
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: uploadedImage.type || "image/jpeg",
                data: uploadedImageBase64
              }
            }
          ]
        }],
      };
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
        setImageDescriptionOutput(result.candidates[0].content.parts[0].text);
      } else {
        setImageDescriptionOutput('Could not describe image. Please try again.');
      }
    } catch (error) {
      console.error('Error in image description:', error);
      setImageDescriptionOutput('Error describing image. Please check your network or API key.');
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <section
      className="py-16 px-4 min-h-screen transition-all duration-1000"
      style={{ background: backgroundImages[currentImageIndex] }}
    >
      <div className="text-center max-w-6xl mx-auto">
        <h1 className="👉 text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}> 🌈 IMAGE <span className="text-orange-400">STUDIO</span>
        </h1>
        <p className="👉 text-lg md:text-xl text-gray-200 mb-8 font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}> 👈
          Upload images for AI analysis or future editing tools.
        </p>

        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-orange-500 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h2 className="👉 text-xl font-semibold text-gray-800 mb-4 font-sans 👈">Upload Image</h2>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500 transition-all min-h-[200px] flex flex-col items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImage ? (
                  <>
                    <img
                      src={URL.createObjectURL(uploadedImage)}
                      alt="Uploaded"
                      className="max-w-full max-h-48 rounded-lg mb-4 object-contain"
                    />
                    <p className="👉 text-gray-600 font-medium font-sans 👈">File: {uploadedImage.name}</p>
                    <p className="👉 text-gray-400 text-xs font-sans 👈">Type: {uploadedImage.type}</p>
                  </>
                ) : (
                  <>
                    <span className="text-6xl mb-4">🖼️</span>
                    <p className="👉 text-gray-600 font-medium font-sans 👈">Click to upload your image</p>
                    <p className="👉 text-gray-400 text-xs font-sans 👈">Supports JPG, PNG, GIF, WebP</p>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </div>
              <button
                onClick={handleDescribeImage}
                disabled={loadingImage}
                className="👉 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center w-full mt-4 disabled:opacity-50 font-sans 👈"
              >
                <span className="mr-2">Describe Image with AI ✨</span>
                {loadingImage && <LoadingIndicator />}
              </button>
              {imageDescriptionOutput && (
                <div className="👉 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 text-gray-700 text-left font-sans 👈">
                  <div className="whitespace-pre-wrap">{imageDescriptionOutput}</div>
                </div>
              )}
            </div>
            <div>
              <h2 className="👉 text-xl font-semibold text-gray-800 mb-4 font-sans 👈">Editing Tools (Coming Soon)</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '✂️', name: 'Crop' },
                  { icon: '🔄', name: 'Rotate' },
                  { icon: '↔️', name: 'Resize' },
                  { icon: '☀️', name: 'Brightness' },
                  { icon: '⚫', name: 'Contrast' },
                  { icon: '🌈', name: 'Filters' }
                ].map((tool, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition-all border-2 border-transparent hover:border-orange-500">
                    <span className="text-2xl block mb-2">{tool.icon}</span>
                    <span className="👉 text-sm text-gray-600 font-sans 👈">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageEditingPage;