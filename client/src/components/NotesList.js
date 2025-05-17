import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import './NotesList.css';

const NotesList = ({ notes, onSelect, onDelete, currentNote, loading }) => {
  if (loading && notes.length === 0) {
    return (
      <div className="notes-list-container">
        <h3>Notes</h3>
        <div className="notes-list-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="notes-list-container">
      <h3>Notes</h3>
      {notes.length === 0 ? (
        <div className="notes-list-empty">
          <p>No notes found</p>
          <p className="notes-list-hint">Use the voice recorder to create your first note!</p>
        </div>
      ) : (
        <ul className="notes-list">
          {notes.map((note) => (
            <li 
              key={note._id}
              className={`note-item ${currentNote && currentNote._id === note._id ? 'active' : ''}`}
              onClick={() => onSelect(note)}
            >
              <div className="note-item-content">
                <div className="note-item-title">{note.title}</div>
                <div className="note-item-date">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="note-item-actions">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(note);
                  }}
                  title="Edit note"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm('Are you sure you want to delete this note?')) {
                      onDelete(note._id);
                    }
                  }}
                  title="Delete note"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotesList;
