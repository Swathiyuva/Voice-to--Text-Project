import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setText(result);
      console.log("Result received:", result);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      alert("Speech recognition error: " + event.error);
    };

    recognition.start();
  };

  const handleSpeakText = () => {
  if (!window.speechSynthesis) {
    alert("Text-to-speech not supported");
    return;
  }

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  utterance.onerror = (e) => {
    console.error("SpeechSynthesis error:", e.error);
    alert("Error during speech synthesis: " + e.error);
  };

  window.speechSynthesis.speak(utterance);
};

  const getNotes = async () => {
    try {
      const res = await fetch(`${backendUrl}/notes`);
      const data = await res.json();
      console.log("Fetched notes:", data);
      setSavedNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const saveNote = async () => {
    if (!text.trim()) return;

    try {
      const res = await fetch(`${backendUrl}/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Date.now().toString(),
          text,
        }),
      });

      const result = await res.json();
      alert(result.message);
      setText("");
      getNotes();
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  useEffect(() => {
    getNotes();
  }, []);

  return (
    <div className={`App ${darkMode ? "dark" : "light"}`}>
      <h1>🎤 Voice Notes App</h1>

      <textarea
        rows="4"
        cols="50"
        placeholder="Type or speak your note here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br />
      <button onClick={handleVoiceInput}>🎙️ Start Speaking</button>
      <button onClick={handleSpeakText} disabled={!text.trim()}>
        🔊 Speak Text
      </button>
      <button onClick={saveNote} disabled={!text.trim()}>
        💾 Save Note
      </button>

      <br />
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle {darkMode ? "Light" : "Dark"} Mode
      </button>

      <hr />
      <h2>Saved Notes:</h2>
      <ul>
        {Array.isArray(savedNotes) &&
          savedNotes.map((note, index) => (
            <div key={index}>
              <p>{note.text}</p>
            </div>
          ))}
      </ul>
    </div>
  );
}

export default App;
