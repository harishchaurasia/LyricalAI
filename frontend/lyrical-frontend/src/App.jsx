import { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");

  const handleGenerate = async () => {
    const res = await axios.post("http://localhost:8000/generate-lyrics", null, {
      params: { prompt },
    });
    setLyrics(res.data.lyrics);
  };

  const handleTranscribe = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:8000/transcribe-audio", formData);
    setTranscription(res.data.transcription);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎵 Lyrical.AI</h1>

      <div>
        <textarea
          className="w-full p-2 rounded bg-gray-800"
          rows={4}
          placeholder="Enter a lyric prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button className="bg-blue-500 px-4 py-2 mt-2 rounded" onClick={handleGenerate}>
          Generate Lyrics
        </button>
        {lyrics && <pre className="mt-4 whitespace-pre-wrap">{lyrics}</pre>}
      </div>

      <div>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-white"
        />
        <button className="bg-green-500 px-4 py-2 mt-2 rounded" onClick={handleTranscribe}>
          Transcribe Audio
        </button>
        {transcription && <p className="mt-4">{transcription}</p>}
      </div>
    </div>
  );
}

export default App;
