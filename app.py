from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

notes = []

@app.route("/", methods=["GET"])
def home():
    return jsonify(notes)

@app.route("/notes", methods=["GET"])
def get_notes():
    search = request.args.get("search", "").lower()
    filtered = [note for note in notes if search in note["title"].lower() or search in note["text"].lower()]
    return jsonify(filtered)

@app.route("/notes", methods=["POST"])
def create_note():
    data = request.get_json()
    data["timestamp"] = request.args.get("timestamp") or ""
    notes.append(data)
    return jsonify({"message": "Note added successfully"}), 201

@app.route("/notes/<note_id>", methods=["PUT"])
def update_note(note_id):
    data = request.get_json()
    for note in notes:
        if note["id"] == note_id:
            note["title"] = data["title"]
            note["text"] = data["text"]
            return jsonify({"message": "Note updated"})
    return jsonify({"error": "Note not found"}), 404

@app.route("/notes/<note_id>", methods=["DELETE"])
def delete_note(note_id):
    global notes
    notes = [note for note in notes if note["id"] != note_id]
    return jsonify({"message": "Note deleted"})

if __name__ == "__main__":
    app.run(debug=True)
