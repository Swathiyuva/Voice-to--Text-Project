from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

notes = []

@app.route('/')
def home():
    return "Backend is running"

@app.route('/note', methods=['POST'])
def add_note():
    data = request.get_json()
    note_text = data.get("text", "")
    if note_text:
        notes.append(note_text)
        return jsonify({"message": "Note saved successfully!"}), 200
    return jsonify({"message": "No text provided"}), 400

@app.route('/notes', methods=['GET'])
def get_notes():
    return jsonify(notes)
