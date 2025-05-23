import React, { useState, useEffect } from 'react';
import './App.css';
import VoiceRecorder from './components/VoiceRecorder';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import NotesOverview from './components/NotesOverview';
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
  const [currentView, setCurrentView] = useState('editor'); // 'editor' or 'overview'

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
  };  // Create new note from voice
  const handleVoiceInput = (transcript) => {
    if (transcript) {
      console.log("Creating new note with transcript:", transcript);
      // Create a new note with the first few words as title and the full transcript as content
      const title = transcript.split(' ').slice(0, 5).join(' ') + '...';
      // Convert transcript to HTML paragraph for rich text
      const richContent = `<p>${transcript}</p>`;
      createNote({ title, content: richContent, contentType: 'rich' });
    } else {
      console.log("No transcript available to create note");
    }
  };    // Append to existing note from voice
  const handleVoiceAppend = (transcript) => {
    if (transcript && currentNote) {
      console.log("Appending new transcript:", transcript);
      // Append transcript as a new paragraph in rich text format
      const newParagraph = `<p>${transcript}</p>`;
      const updatedContent = currentNote.content + newParagraph;
      updateNote(currentNote._id, { ...currentNote, content: updatedContent, contentType: 'rich' });
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

  // Navigation functions
  const showOverview = () => {
    setCurrentView('overview');
  };

  const showEditor = () => {
    setCurrentView('editor');
  };
  // Handle note selection from overview
  const handleOverviewNoteSelect = (note) => {
    setCurrentNote(note);
    setCurrentView('editor');
  };

  // Handle note update from overview (for moving topics, etc.)
  const handleNoteUpdate = (noteId, updatedNote) => {
    setNotes(notes.map(note => note._id === noteId ? updatedNote : note));
    if (currentNote && currentNote._id === noteId) {
      setCurrentNote(updatedNote);
    }
  };
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Voice Notes</h1>
          <nav className="header-nav">
            <button 
              onClick={showEditor}
              className={`nav-button ${currentView === 'editor' ? 'active' : ''}`}
            >
              Editor
            </button>
            <button 
              onClick={showOverview}
              className={`nav-button ${currentView === 'overview' ? 'active' : ''}`}
            >
              All Notes ({notes.length})
            </button>
          </nav>
        </div>
        {error && <div className="error-message">{error}</div>}
      </header>

      <main className="app-main">
        {currentView === 'editor' ? (
          <>
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
          </>        ) : (
          <NotesOverview
            notes={notes}
            onSelectNote={handleOverviewNoteSelect}
            onDeleteNote={deleteNote}
            onBackToEditor={showEditor}
            onCreateNote={createNote}
            onUpdateNote={handleNoteUpdate}
          />
        )}
      </main>
    </div>
  );
}

export default App;
