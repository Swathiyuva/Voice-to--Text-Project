// server.js
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;
const NOTES_FILE = "notes.json";

app.use(cors());
app.use(bodyParser.json());

// Ensure notes.json file exists
if (!fs.existsSync(NOTES_FILE)) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
}

// Helper to read/write notes
const readNotes = () => JSON.parse(fs.readFileSync(NOTES_FILE));
const writeNotes = (notes) => fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));

// GET all notes
app.get("/notes", (req, res) => {
  const notes = readNotes();
  res.json(notes);
});

// POST a new note
app.post("/note", (req, res) => {
  const { id, text } = req.body;
  if (!id || !text) {
    return res.status(400).json({ message: "Invalid note data" });
  }
  const notes = readNotes();
  notes.push({ id, text });
  writeNotes(notes);
  res.json({ message: "Note saved successfully!" });
});
app.get("/notes", (req, res) => {
  let notes = readNotes();
  notes = notes.filter(note => note.text && note.text.trim() !== "");
  writeNotes(notes); // remove permanently
  res.json(notes);
});

// DELETE note by ID
app.delete('/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const notes = readNotes();
  const updatedNotes = notes.filter(note => note.id !== noteId);
  writeNotes(updatedNotes);
  res.status(200).json({ message: 'Note deleted' });
});

// PUT (update) note by ID
app.put('/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const { text } = req.body;
  let notes = readNotes();
  const index = notes.findIndex(note => note.id === noteId);
  if (index !== -1) {
    notes[index].text = text;
    writeNotes(notes);
    res.status(200).json({ message: 'Note updated' });
  } else {
    res.status(404).json({ message: 'Note not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
