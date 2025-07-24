import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [editId, setEditId] = useState(null);

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
    };

    recognition.onerror = (event) => {
      alert("Speech recognition error: " + event.error);
    };

    recognition.start();
  };

  const handleSpeakText = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech not supported");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onerror = (e) => alert("Speech synthesis error: " + e.error);
    window.speechSynthesis.speak(utterance);
  };

  const getNotes = async () => {
    try {
      const res = await fetch(`${backendUrl}/notes`);
      const data = await res.json();
      setSavedNotes(data.filter((note) => note.text && note.text.trim() !== ""));
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const saveNote = async () => {
    if (!text.trim()) {
      alert("Note cannot be empty");
      return;
    }

    if (editId) {
      await fetch(`${backendUrl}/notes/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      setEditId(null);
    } else {
      const newNote = { id: Date.now().toString(), text };
      await fetch(`${backendUrl}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
    }

    setText("");
    getNotes();
  };

  const deleteNote = async (id) => {
    await fetch(`${backendUrl}/notes/${id}`, { method: "DELETE" });
    getNotes();
  };

  const startEditing = (note) => {
    setText(note.text);
    setEditId(note.id);
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

      <div className="button-row">
        <button onClick={handleVoiceInput}>🎙️ Start Speaking</button>
        <button onClick={handleSpeakText} disabled={!text.trim()}>
          🔊 Speak Text
        </button>
        <button onClick={saveNote} disabled={!text.trim()}>
          {editId ? "✏️ Update Note" : "💾 Save Note"}
        </button>
        <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>

      <hr />
      <h2>Saved Notes:</h2>
      <ul>
        {savedNotes.map((note) => (
          note.text.trim() !== "" && (
            <div key={note.id} className="note-container">
              <p>{note.text}</p>
              <div className="note-actions">
                <button onClick={() => deleteNote(note.id)}>🗑️ Delete</button>
                <button onClick={() => startEditing(note)}>✏️ Edit</button>
              </div>
            </div>
          )
        ))}
      </ul>
    </div>
  );
}

export default App;
