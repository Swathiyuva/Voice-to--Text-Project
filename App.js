import React, { useState, useEffect } from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [allNotes, setAllNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const getNotes = async () => {
    try {
      const res = await fetch(`${backendUrl}/notes`);
      const data = await res.json();
      const validNotes = data.filter(note => !isNaN(new Date(note.timestamp)));
      setAllNotes(validNotes);
      setFilteredNotes(validNotes);
    } catch (err) {
      console.error("Error fetching notes:", err);
      toast.error("Failed to fetch notes");
    }
  };

  const saveNote = async () => {
    if (!title.trim() || !text.trim()) {
      toast.warn("Title and content cannot be empty.");
      return;
    }

    const notePayload = {
      title: title.trim(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      if (editId) {
        await fetch(`${backendUrl}/notes/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notePayload),
        });
        toast.info("Note updated successfully!");
        setEditId(null);
      } else {
        await fetch(`${backendUrl}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notePayload),
        });
        toast.success("Note saved!");
      }

      setText("");
      setTitle("");
      await getNotes();
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Failed to save note");
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${backendUrl}/notes/${id}`, {
        method: "DELETE",
      });
      await getNotes();
      toast.error("Note deleted");
    } catch (err) {
      console.error("Error deleting note:", err);
      toast.error("Failed to delete note");
    }
  };

  const startEditing = (note) => {
    setEditId(note.id || note._id);
    setTitle(note.title);
    setText(note.text);
    toast.info("Edit mode enabled");
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      setText(e.results[0][0].transcript);
      toast.success("Voice captured");
    };
    recognition.onerror = (e) => toast.error("Voice error: " + e.error);
    recognition.start();
  };

  const handleSpeakText = () => {
    if (!window.speechSynthesis) return toast.error("TTS not supported");
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
    toast("Speaking your note...");
  };

  useEffect(() => {
    getNotes();
  }, []);

  useEffect(() => {
    const filtered = allNotes.filter((note) =>
      (note.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (note.text?.toLowerCase() || "").includes(search.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [search, allNotes]);

  return (
    <div className={`App ${darkMode ? "dark" : "light"}`}>
      <ToastContainer position="top-right" autoClose={2000} />
      <h1>📝 Voice Notes App</h1>

     <input
  type="text"
  placeholder="Title"
  className="note-input"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>

<textarea
  rows="4"
  placeholder="Type or speak your note here..."
  className="note-input"
  value={text}
  onChange={(e) => setText(e.target.value)}
/>


      <div className="button-row">
        <button onClick={handleVoiceInput}>🎙️ Start Speaking</button>
        <button onClick={handleSpeakText} disabled={!text.trim()}>
          🔊 Speak
        </button>
        <button onClick={saveNote} disabled={!text.trim() || !title.trim()}>
          {editId ? "✏️ Update Note" : "💾 Save Note"}
        </button>
        <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <hr />
      <h2>Saved Notes</h2>

      <ul>
        {filteredNotes.map((note) => (
          <div key={note.id || note._id} className="note-container">
            <h3>{note.title}</h3>
            <p>{note.text}</p>
            <small>{new Date(note.timestamp).toLocaleString()}</small>
            <div className="note-actions">
              <button onClick={() => deleteNote(note.id || note._id)}>🗑️ Delete</button>
              <button onClick={() => startEditing(note)}>✏️ Edit</button>
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
}

export default App;
