import React, { useState, useEffect } from 'react';
import { FaSave, FaPlus } from 'react-icons/fa';
import './NoteEditor.css';

const NoteEditor = ({ note, onUpdate, onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsEditing(true);
    } else {
      setTitle('');
      setContent('');
      setIsEditing(false);
    }
  }, [note]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) return;

    if (isEditing) {
      onUpdate(note._id, { title, content });
    } else {
      onCreate({ title, content });
    }
  };

  const handleNewNote = () => {
    setTitle('');
    setContent('');
    setIsEditing(false);
  };

  return (
    <div className="note-editor">
      {!isEditing && (
        <div className="note-editor-header">
          <h2>New Note</h2>
        </div>
      )}

      {isEditing && (
        <div className="note-editor-header">
          <h2>Edit Note</h2>
          <button onClick={handleNewNote} className="new-note-button">
            <FaPlus /> New Note
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="note-title-input"
            required
          />
        </div>

        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your note content here..."
            className="note-content-textarea"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">
            <FaSave /> {isEditing ? 'Save Changes' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteEditor;
