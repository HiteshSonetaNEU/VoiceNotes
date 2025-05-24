import React, { useState, useEffect } from 'react';
import { FaSave, FaPlus } from 'react-icons/fa';
import RichTextEditor from './RichTextEditor';
import './NoteEditor.css';

const NoteEditor = ({ note, onUpdate, onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);  useEffect(() => {
    if (note) {
      setTitle(note.title);
      // Convert plain text to HTML format for rich text editor
      const noteContent = note.content || '';
      if (note.contentType === 'plain' || !note.contentType) {
        // Convert plain text to HTML paragraphs, preserving line breaks
        const htmlContent = noteContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => `<p>${line}</p>`)
          .join('');
        setContent(htmlContent || '<p></p>');
      } else {
        setContent(noteContent);
      }
      setIsEditing(true);
    } else {
      setTitle('');
      setContent('');
      setIsEditing(false);
    }
  }, [note]);const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) return;

    const noteData = { 
      title, 
      content, 
      contentType: 'rich' // Always save as rich text now
    };

    if (isEditing) {
      onUpdate(note._id, noteData);
    } else {
      onCreate(noteData);
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
      )}      <form onSubmit={handleSubmit} className="note-form">
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
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing your note with rich formatting..."
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
