import { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await axios.post("http://localhost:8000/generate-lyrics", null, {
        params: { prompt },
      });
      setLyrics(res.data.lyrics);
    } catch (error) {
      console.error("Error generating lyrics:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranscribeAndGenerate = async () => {
    if (!file) return;
    setIsTranscribing(true);
    setIsGenerating(true);
    try {
      // Step 1: Transcribe
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:8000/transcribe-audio", formData);
      const transcript = res.data.transcription;
      setTranscription(transcript);
      setPrompt(transcript); // Optional: auto-fill prompt box

      // Step 2: Generate Lyrics
      const lyricsRes = await axios.post("http://localhost:8000/generate-lyrics", null, {
        params: { prompt: transcript },
      });
      setLyrics(lyricsRes.data.lyrics);
    } catch (error) {
      console.error("Error in transcription/lyrics:", error);
    } finally {
      setIsTranscribing(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
      <div className="w-full h-full min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            🎵 Lyrical.AI
          </h1>
          <p className="text-2xl text-gray-300">
            Your AI-powered music companion for lyrics generation and audio transcription
          </p>
        </div>

        {/* Content */}
        <div className="w-full max-w-4xl space-y-8">
          {/* Lyrics Generator */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-semibold mb-6 text-center">Generate Lyrics</h2>
            <div className="space-y-6">
              <textarea
                className="w-full p-4 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-lg"
                rows={4}
                placeholder="Enter a lyric prompt... (or generate from audio below)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-all ${
                  isGenerating ? "bg-purple-700 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                }`}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Lyrics"}
              </button>
              {lyrics && (
                <div className="mt-6 p-6 bg-gray-700/30 rounded-lg">
                  <h3 className="text-xl font-medium mb-4">Generated Lyrics:</h3>
                  <pre className="whitespace-pre-wrap text-gray-200 text-lg">{lyrics}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Audio Upload */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-semibold mb-6 text-center">Transcribe Audio & Generate Lyrics</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-6 py-8 bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600 cursor-pointer hover:bg-gray-700/50 transition-all">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-lg text-gray-300">
                      {file ? file.name : "Click to upload audio file"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-all ${
                  isTranscribing || isGenerating
                    ? "bg-green-700 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={handleTranscribeAndGenerate}
                disabled={isTranscribing || isGenerating || !file}
              >
                {isTranscribing || isGenerating ? "Processing..." : "Transcribe & Generate"}
              </button>
              {transcription && (
                <div className="mt-6 p-6 bg-gray-700/30 rounded-lg">
                  <h3 className="text-xl font-medium mb-4">Transcription:</h3>
                  <p className="text-gray-200 text-lg">{transcription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
