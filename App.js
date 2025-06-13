import React, { useState, useEffect, useRef } from 'react';
import { ImageUp, Mic, Play, Pause, XCircle, Loader2 } from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [spokenPrompt, setSpokenPrompt] = useState('');
  const [aiResponseText, setAiResponseText] = useState("Your AI doctor's response will appear here.");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  // Initialize Web Speech API for recognition and synthesis
  useEffect(() => {
    // Speech Recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Only record one utterance at a time
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSpokenPrompt(transcript);
        setError(''); // Clear any previous errors
        console.log('Transcript:', transcript);
      };

      recognitionRef.current.onerror = (event) => {
        setIsRecording(false);
        let errorMessage = `Speech recognition error: ${event.error}.`;
        if (event.error === 'not-allowed') {
          errorMessage += ' Please ensure you have granted microphone access to this site in your browser settings and try again.';
          console.warn('Microphone access "not-allowed". User needs to grant permission.');
        } else {
          errorMessage += ' Please ensure microphone access is granted.';
        }
        setError(errorMessage);
        console.error('Speech recognition error', event.error);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        console.log('Speech recognition ended.');
      };
    } else {
      setError('Web Speech API (Speech Recognition) not supported in this browser. Voice input will not work.');
      console.warn('Web Speech API (Speech Recognition) not supported.');
    }

    // Speech Synthesis setup
    if (!('speechSynthesis' in window)) {
      setError(prev => (prev ? prev + ' ' : '') + 'Web Speech API (Speech Synthesis) not supported in this browser. Voice output will not work.');
      console.warn('Web Speech API (Speech Synthesis) not supported.');
    }

    // Cleanup for speech synthesis when component unmounts
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle image file selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setError(''); // Clear any previous errors
    } else {
      setSelectedImage(null);
      setImagePreviewUrl('');
    }
  };

  // Start recording user's voice prompt
  const startRecording = () => {
    if (recognitionRef.current) {
      setSpokenPrompt(''); // Clear previous prompt
      setError(''); // Clear any previous errors
      setIsRecording(true);
      recognitionRef.current.start();
      console.log('Recording started...');
    } else {
      setError('Speech recognition not available. Cannot start recording.');
    }
  };

  // Stop recording user's voice prompt
  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      console.log('Recording stopped.');
    }
  };

  // Process the image and voice prompt using Gemini API
  const processImageAndPrompt = async () => {
    if (!selectedImage) {
      setError('Please upload a medical image first.');
      return;
    }
    if (!spokenPrompt.trim()) {
      setError('Please provide a voice prompt by recording or typing.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAiResponseText('Analyzing image and prompt...');
    setIsPlaying(false); // Stop any ongoing speech

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = async () => {
        const base64ImageData = reader.result.split(',')[1]; // Get base64 string without data URL prefix

        const prompt = `Analyze this medical image and respond to the following question/description from a medical professional perspective: "${spokenPrompt}". Provide a concise and clear explanation.`;

        const chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        chatHistory.push({
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: selectedImage.type, // Use the actual MIME type of the uploaded image
                data: base64ImageData
              }
            }
          ]
        });

        const payload = { contents: chatHistory };
        // API key will be automatically provided by Canvas runtime if empty
        const apiKey = "AIzaSyAjm_vwAaUMnuNwH7-KXhS0uEV_LcigMV8"; // Keep this empty; Canvas provides the key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload) // Corrected: use the payload object
        });

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
          const text = result.candidates[0].content.parts[0].text;
          setAiResponseText(text);
          speakAiResponse(text); // Speak the response automatically
        } else if (result.error) {
            setError(`API Error: ${result.error.message}`);
            setAiResponseText('Error processing image. Please try again.');
            console.error('Gemini API Error:', result.error);
        }
        else {
          setError('Could not get a valid response from the AI. Please try again.');
          setAiResponseText('No response received.');
        }
      };
      reader.onerror = (error) => {
        setError('Error reading image file.');
        console.error('FileReader error:', error);
        setIsLoading(false);
      };
    } catch (err) {
      setError(`An unexpected error occurred: ${err.message}`);
      setAiResponseText('An error occurred.');
      console.error('Processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Speak the AI's text response
  const speakAiResponse = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech immediately
      setIsPlaying(false); // Immediately set playing state to false
      console.log('SpeechSynthesis: Cancelled previous utterance.');

      // Give the speech synthesis engine a moment to clear its queue
      setTimeout(() => {
        // Only speak if no other speech is currently active or pending
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utteranceRef.current = utterance; // Store reference to current utterance

          utterance.onstart = () => {
            setIsPlaying(true);
            console.log('SpeechSynthesis: Utterance started.');
          };
          utterance.onend = () => {
            setIsPlaying(false);
            console.log('SpeechSynthesis: Utterance ended.');
          };
          utterance.onerror = (event) => { // Added onerror for robust error handling
            console.error('Speech synthesis error:', event.error);
            setError('Error speaking response. Text-to-speech may not be fully supported.');
            setIsPlaying(false);
          };

          window.speechSynthesis.speak(utterance);
          console.log('SpeechSynthesis: New utterance spoken.');
        } else {
          console.log('SpeechSynthesis: Engine still busy after delay, not speaking new utterance immediately.');
        }
      }, 300); // Increased delay to 300ms
    } else {
      setError('Speech synthesis not supported in this browser. Voice output will not work.');
    }
  };

  // Stop current speech playback
  const stopSpeaking = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      console.log('SpeechSynthesis: Manual stop and cancel.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl transform transition-all duration-300 hover:scale-[1.01] flex flex-col space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">AI Doctor</span>
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
            <XCircle className="h-5 w-5 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Image Upload Section */}
        <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-4">
          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full">
            <ImageUp className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-gray-600 font-medium text-center">
              {selectedImage ? selectedImage.name : 'Click to upload Medical Image (e.g., X-ray, MRI, CT scan)'}
            </span>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {imagePreviewUrl && (
            <div className="mt-4 max-h-64 overflow-hidden rounded-md shadow-md">
              <img src={imagePreviewUrl} alt="Image Preview" className="max-w-full h-auto object-contain" />
            </div>
          )}
        </div>

        {/* Voice Prompt Section */}
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Your Voice Prompt</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full shadow-lg transition-all duration-300
                ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
                text-white focus:outline-none focus:ring-4 focus:ring-blue-300`}
              disabled={isLoading || !recognitionRef.current}
            >
              {isRecording ? <Pause className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
            </button>
            <p className="text-lg text-gray-700 italic">
              {isRecording ? 'Listening...' : (spokenPrompt || 'Click mic to speak your query')}
            </p>
          </div>
          <input
            type="text"
            value={spokenPrompt}
            onChange={(e) => setSpokenPrompt(e.target.value)}
            placeholder="Or type your prompt here (e.g., 'What does this X-ray show?')"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-gray-700"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={processImageAndPrompt}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2
                     focus:outline-none focus:ring-4 focus:ring-green-300 active:scale-[0.98]"
          disabled={isLoading || !selectedImage || !spokenPrompt.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Get AI Diagnosis</span>
          )}
        </button>

        {/* AI Response Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">AI Doctor's Response</h2>
          <p className="text-gray-800 leading-relaxed min-h-[80px] max-h-64 overflow-y-auto custom-scrollbar">
            {aiResponseText}
          </p>
          <div className="flex justify-center">
            <button
              onClick={isPlaying ? stopSpeaking : () => speakAiResponse(aiResponseText)}
              className={`p-3 rounded-full shadow-md transition-all duration-300
                ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'}
                text-white focus:outline-none focus:ring-4 focus:ring-purple-300`}
              disabled={isLoading || !aiResponseText || !('speechSynthesis' in window)}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          <span className="font-semibold">Disclaimer:</span> This AI tool is for informational purposes only and does not constitute medical advice. Consult a healthcare professional for any medical concerns.
        </p>
      </div>
    </div>
  );
}

export default App;