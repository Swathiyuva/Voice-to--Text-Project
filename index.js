const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const NOTES_FILE = "notes.json";

// Read notes from file
function readNotes() {
  try {
    const data = fs.readFileSync(NOTES_FILE);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write notes to file
function writeNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

// GET all notes
app.get("/notes", (req, res) => {
  const notes = readNotes();
  res.json(notes);
});

// CREATE a new note
app.post("/notes", (req, res) => {
  const { title, text } = req.body;
  const newNote = {
    id: uuidv4(),
    title,
    text,
    timestamp: new Date().toISOString()
  };
  const notes = readNotes();
  notes.push(newNote);
  writeNotes(notes);
  res.status(201).json(newNote);
});

// UPDATE a note by ID
app.put("/notes/:id", (req, res) => {
  const { title, text } = req.body;
  let notes = readNotes();
  const index = notes.findIndex(note => note.id === req.params.id);

  if (index !== -1) {
    notes[index].title = title;
    notes[index].text = text;
    notes[index].timestamp = new Date().toISOString(); // ✅ update timestamp
    writeNotes(notes);
    return res.json({ message: "Note updated" });
  }

  res.status(404).json({ message: "Note not found" });
});

// DELETE a note by ID
app.delete("/notes/:id", (req, res) => {
  let notes = readNotes();
  notes = notes.filter(note => note.id !== req.params.id);
  writeNotes(notes);
  res.json({ message: "Note deleted" });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
