# Voice Notes App Documentation

This document provides a comprehensive overview of the Voice Notes application, explaining the code structure, components, and data flow of both the client and server sides.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Server-Side](#server-side)
  - [Server Setup](#server-setup)
  - [Database Model](#database-model)
  - [API Routes](#api-routes)
- [Client-Side](#client-side)
  - [App Structure](#app-structure)
  - [Components](#components)
  - [Data Flow](#data-flow)
- [Features](#features)
- [How Voice Recording Works](#how-voice-recording-works)
- [Search Functionality](#search-functionality)
- [Running the Application](#running-the-application)

## Overview

The Voice Notes application is a full-stack web app that allows users to create, edit, search, and manage notes using voice input. The app utilizes the Web Speech API for voice-to-text conversion and provides an intuitive interface for managing notes.

## Architecture

The application follows a typical client-server architecture:

```
Voice Notes App
│
├── Client (React.js)
│   ├── App Component
│   ├── VoiceRecorder Component
│   ├── NotesList Component
│   ├── NoteEditor Component
│   └── SearchBar Component
│
└── Server (Node.js/Express)
    ├── API Routes
    └── MongoDB Database
```

## Server-Side

### Server Setup

The server is built using Node.js with Express and connects to a MongoDB database using Mongoose.

**index.js**:
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Import routes
const notesRoutes = require('./routes/notes');

// Use routes
app.use('/api/notes', notesRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

This file sets up the Express server, connects to MongoDB, and registers the notes routes.

### Database Model

**models/Note.js**:
```javascript
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Note', NoteSchema);
```

This defines the data structure for each note in the database.

### API Routes

**routes/notes.js**:
```javascript
const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new note
router.post('/', async (req, res) => {
  const note = new Note({
    title: req.body.title,
    content: req.body.content
  });

  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
        updatedAt: Date.now()
      },
      { new: true }
    );
    if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

This file defines the API endpoints for CRUD operations on notes.

## Client-Side

### App Structure

The client is built using React and is organized into several key components.

**App.js**:
```javascript
import React, { useState, useEffect } from 'react';
import './App.css';
import VoiceRecorder from './components/VoiceRecorder';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import SearchBar from './components/SearchBar';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all notes from the server
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setNotes(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const createNote = async (noteData) => {
    try {
      setLoading(true);
      const response = await axios.post(API_URL, noteData);
      setNotes([response.data, ...notes]);
      setCurrentNote(response.data);
      setError('');
    } catch (err) {
      setError('Failed to create note');
      console.error('Error creating note:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing note
  const updateNote = async (id, noteData) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/${id}`, noteData);
      setNotes(notes.map(note => note._id === id ? response.data : note));
      setCurrentNote(response.data);
      setError('');
    } catch (err) {
      setError('Failed to update note');
      console.error('Error updating note:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`);
      setNotes(notes.filter(note => note._id !== id));
      if (currentNote && currentNote._id === id) {
        setCurrentNote(null);
      }
      setError('');
    } catch (err) {
      setError('Failed to delete note');
      console.error('Error deleting note:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle note selection
  const selectNote = (note) => {
    setCurrentNote(note);
  };
  
  // Create new note from voice
  const handleVoiceInput = (transcript) => {
    if (transcript) {
      console.log("Creating new note with transcript:", transcript);
      const title = transcript.split(' ').slice(0, 5).join(' ') + '...';
      createNote({ title, content: transcript });
    } else {
      console.log("No transcript available to create note");
    }
  };
    
  // Append to existing note from voice
  const handleVoiceAppend = (transcript) => {
    if (transcript && currentNote) {
      console.log("Appending new transcript:", transcript);
      const updatedContent = currentNote.content + '\n\n' + transcript;
      updateNote(currentNote._id, { ...currentNote, content: updatedContent });
    }
  };
  
  // Load notes when component mounts
  useEffect(() => {
    fetchNotes();
  }, []);
  
  // Filter notes based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(term) || 
        note.content.toLowerCase().includes(term)
      );
      setFilteredNotes(filtered);
    }
  }, [searchTerm, notes]);
  
  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Voice Notes</h1>
        {error && <div className="error-message">{error}</div>}
      </header>
      <main className="app-main">
        <div className="sidebar">
          <VoiceRecorder 
            onResult={handleVoiceInput} 
            onAppendResult={handleVoiceAppend}
            isNoteSelected={currentNote !== null}
          />
          <SearchBar onSearch={handleSearch} />
          <NotesList 
            notes={filteredNotes} 
            onSelect={selectNote} 
            onDelete={deleteNote}
            currentNote={currentNote}
            loading={loading}
          />
        </div>
        <div className="editor-container">
          <NoteEditor 
            note={currentNote}
            onUpdate={updateNote}
            onCreate={createNote}
          />
        </div>
      </main>
    </div>
  );
}
```

This is the main application component that handles state management and API calls.

### Components

#### VoiceRecorder Component

The VoiceRecorder component is responsible for converting speech to text using the Web Speech API.

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onResult, isNoteSelected, onAppendResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    // Check if browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Your browser does not support speech recognition.');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    return () => {
      // Clean up
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    setError('');
    setTranscript('');

    if (recognitionRef.current) {
      // Reset the onend handler to default behavior for creating a new note
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      setError('Speech recognition is not available');
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      // Always create a new note when stopping recording unless we're in append mode
      if (transcript) {
        // Create new note if this recording was started with the startRecording function
        onResult(transcript);
      }
    }
  };
  
  // Rest of the component...
}
```

This component handles the voice recording functionality and sends the transcript back to the App component.

#### NotesList Component

This component displays the list of notes and handles note selection and deletion.

#### NoteEditor Component

This component provides an interface to edit the title and content of a note.

#### SearchBar Component

This component allows users to search for notes by title or content.

### Data Flow

1. When the app loads, it fetches all notes from the server
2. When a user records a voice note, it's converted to text and a new note is created
3. When a note is selected, it's loaded into the editor for viewing/editing
4. When a search term is entered, the notes list is filtered accordingly
5. When a note is edited and saved, it's updated in the database
6. When a note is deleted, it's removed from the database and the UI

## Features

1. **Voice-to-Text Conversion**: Create notes by speaking
2. **Append to Notes**: Add more content to existing notes using voice
3. **Edit Notes**: Change title and content of notes
4. **Search Notes**: Find notes by title or content
5. **Delete Notes**: Remove unwanted notes

## How Voice Recording Works

The app uses the Web Speech API (specifically the SpeechRecognition interface) to convert speech to text:

1. When the user clicks "Start Recording" or "Record New", the `startRecording` function initializes the speech recognition
2. As the user speaks, the `onresult` event handler continuously updates the transcript
3. When the user clicks "Stop Recording", the recognition stops and the transcript is sent to create a new note
4. When the user clicks "Append to Note", the transcript is added to the selected note's content

## Search Functionality

The search feature filters notes based on the content of the title or body:

1. As the user types in the search box, the `handleSearch` function updates the search term
2. The `useEffect` hook filters the notes based on the search term
3. The filtered notes are displayed in the NotesList component

## Running the Application

To run the application:

1. Start the server:
   ```
   cd server
   npm install
   npm start
   ```

2. Start the client:
   ```
   cd client
   npm install
   npm start
   ```

3. Open your browser to http://localhost:3000

Note: You need to have Node.js and MongoDB installed and configured for the application to work properly.
