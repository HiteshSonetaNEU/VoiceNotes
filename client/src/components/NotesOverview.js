import React, { useState, useMemo, useEffect } from 'react';
import { FaFolder, FaFileAlt, FaSearch, FaEdit, FaTrash, FaTh, FaList, FaPlus, FaTags, FaFolderPlus, FaArrowRight, FaHashtag } from 'react-icons/fa';
import RichTextDisplay from './RichTextDisplay';
import './NotesOverview.css';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notes';

const NotesOverview = ({ notes, onSelectNote, onDeleteNote, onBackToEditor, onCreateNote, onUpdateNote }) => {
  const [groupBy, setGroupBy] = useState('topic'); // 'none', 'topic'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [searchTerm, setSearchTerm] = useState('');  const [selectedNote, setSelectedNote] = useState(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedNoteForMove, setSelectedNoteForMove] = useState(null);
  const [moveToTopic, setMoveToTopic] = useState('');
  const [availableTopics, setAvailableTopics] = useState([]);
  const [createdTopics, setCreatedTopics] = useState(new Set()); // Track empty topics created  // Get topics from notes (using the topic field, not hashtags)
  const allTopics = useMemo(() => {
    const topics = new Set();
    notes.forEach(note => {
      const noteTopic = note.topic || 'General';
      topics.add(noteTopic);
    });
    // Add created empty topics
    createdTopics.forEach(topic => topics.add(topic));
    return Array.from(topics).sort();
  }, [notes, createdTopics]);

  // Update available topics when notes change
  useEffect(() => {
    setAvailableTopics(allTopics);
  }, [allTopics]);

  // Group notes based on the selected grouping method
  const groupedNotes = useMemo(() => {
    let filteredNotes = notes;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(term) || 
        note.content.toLowerCase().includes(term)
      );
    }

    if (groupBy === 'none') {
      return { 'All Notes': filteredNotes };
    }

    if (groupBy === 'topic') {
      // Group by topic field
      const groups = {};
      filteredNotes.forEach(note => {
        const topic = note.topic || 'General';
        if (!groups[topic]) groups[topic] = [];
        groups[topic].push(note);
      });
      return groups;
    }

    return { 'All Notes': filteredNotes };
  }, [notes, groupBy, searchTerm]);

  const handleNoteClick = (note) => {
    if (viewMode === 'grid') {
      setSelectedNote(note);
    } else {
      onSelectNote(note);
      onBackToEditor();
    }
  };  const handleEditNote = (note) => {
    onSelectNote(note);
    onBackToEditor();
  };
  const handleCreateTopic = async () => {
    if (newTopicName.trim()) {
      try {
        // Check if topic already exists
        if (allTopics.includes(newTopicName.trim())) {
          alert('Topic already exists!');
          return;
        }

        const response = await axios.post(`${API_URL}/topics/create`, {
          topicName: newTopicName.trim()
        });
        
        // Add to created topics set
        setCreatedTopics(prev => new Set([...prev, newTopicName.trim()]));
        setNewTopicName('');
        setShowTopicModal(false);
        alert(`Topic "${newTopicName.trim()}" created successfully! You can now move notes to this topic.`);
      } catch (error) {
        if (error.response?.status === 409) {
          alert('Topic already exists!');
        } else {
          console.error('Error creating topic:', error);
          alert('Failed to create topic. Please try again.');
        }
      }
    }
  };

  const handleCreateNoteInTopic = async (topicName) => {
    const noteTitle = `${topicName} - New Note`;
    const noteContent = `<p>This is a new note in the ${topicName} topic.</p>`;
    
    try {
      const response = await axios.post(API_URL, {
        title: noteTitle,
        content: noteContent,
        contentType: 'rich',
        topic: topicName
      });
      
      onCreateNote(response.data);
      setShowTopicModal(false);
      onBackToEditor();
    } catch (error) {
      console.error('Error creating note in topic:', error);
    }  };

  const handleAddToTopic = () => {
    if (selectedTopic) {
      handleCreateNoteInTopic(selectedTopic);
      setSelectedTopic('');
    }
  };

  const handleMoveNote = async () => {
    if (selectedNoteForMove && moveToTopic) {
      try {
        const response = await axios.patch(`${API_URL}/${selectedNoteForMove._id}/topic`, {
          topic: moveToTopic
        });
        
        onUpdateNote(selectedNoteForMove._id, response.data);
        setShowMoveModal(false);
        setSelectedNoteForMove(null);
        setMoveToTopic('');
      } catch (error) {
        console.error('Error moving note:', error);
      }
    }
  };

  const openMoveModal = (note, e) => {
    e.stopPropagation();
    setSelectedNoteForMove(note);
    setMoveToTopic(note.topic || 'General');
    setShowMoveModal(true);
  };

  return (
    <div className="notes-overview">
      <div className="overview-header">
        <div className="header-title">
          <h2>All Notes ({notes.length})</h2>
          <button onClick={onBackToEditor} className="back-button">
            Back to Editor
          </button>
        </div>        <div className="overview-controls">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="group-controls">
            <label>Group by:</label>
            <select 
              value={groupBy} 
              onChange={(e) => setGroupBy(e.target.value)}
              className="group-select"
            >
              <option value="none">None</option>
              <option value="topic">Topic</option>
            </select>
          </div>

          <div className="topic-actions">            <button 
              onClick={() => setShowTopicModal(true)}
              className="topic-button"
              title="Create new topic or add note to existing topic"
            >
              <FaPlus /> Create Topic
            </button>
          </div>

          <div className="view-controls">
            <button 
              onClick={() => setViewMode('grid')}
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid View"
            >
              <FaTh />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              title="List View"
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      <div className={`notes-content ${viewMode}`}>
        {Object.entries(groupedNotes).map(([groupName, groupNotes]) => (
          <div key={groupName} className="note-group">            {groupBy !== 'none' && (
              <div className="group-header">
                {groupBy === 'topic' ? <FaFolder /> : <FaFileAlt />}
                <h3>{groupName} ({groupNotes.length})</h3>
              </div>
            )}

            <div className={`notes-${viewMode}`}>
              {groupNotes.map(note => (
                <div 
                  key={note._id} 
                  className="note-card"
                  onClick={() => handleNoteClick(note)}
                >                  <div className="note-card-header">
                    <h4 className="note-card-title">{note.title}</h4>
                    <div className="note-card-actions">
                      <button 
                        onClick={(e) => openMoveModal(note, e)}
                        className="action-button move"
                        title="Move to topic"
                      >
                        <FaArrowRight />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNote(note);
                        }}
                        className="action-button edit"
                        title="Edit note"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this note?')) {
                            onDeleteNote(note._id);
                          }
                        }}
                        className="action-button delete"
                        title="Delete note"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="note-card-content">
                    {note.contentType === 'rich' ? (
                      <RichTextDisplay content={note.content} className="note-preview" />
                    ) : (
                      <p className="note-preview">{note.content}</p>
                    )}
                  </div>                  <div className="note-card-meta">
                    <span className="note-date">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="note-topic">
                      <span className="topic-tag">
                        <FaFolder /> {note.topic || 'General'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>      {/* Note Detail Modal for Grid View */}
      {selectedNote && viewMode === 'grid' && (
        <div className="note-modal-overlay" onClick={() => setSelectedNote(null)}>
          <div className="note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedNote.title}</h3>
              <div className="modal-actions">
                <button onClick={() => handleEditNote(selectedNote)} className="modal-edit">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => setSelectedNote(null)} className="modal-close">
                  ×
                </button>
              </div>
            </div>
            <div className="modal-content">
              {selectedNote.contentType === 'rich' ? (
                <RichTextDisplay content={selectedNote.content} />
              ) : (
                <p>{selectedNote.content}</p>
              )}
            </div>
            <div className="modal-footer">
              <span>Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Topic Creation Modal */}
      {showTopicModal && (
        <div className="note-modal-overlay" onClick={() => setShowTopicModal(false)}>
          <div className="topic-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaTags /> Topic Management</h3>
              <button onClick={() => setShowTopicModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="topic-options">
                <div className="topic-option">
                  <h4><FaFolderPlus /> Create Empty Topic</h4>
                  <p>Create a new topic folder that you can move notes into later.</p>
                  <input
                    type="text"
                    placeholder="Enter new topic name..."
                    value={newTopicName}                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="topic-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTopic()}
                  />
                  <button 
                    onClick={handleCreateTopic}
                    disabled={!newTopicName.trim()}
                    className="topic-action-button"
                  >
                    <FaFolderPlus /> Create Empty Topic
                  </button>
                </div>

                {allTopics.length > 0 && (
                  <div className="topic-option">
                    <h4><FaPlus /> Add New Note to Existing Topic</h4>
                    <p>Create a new note and place it in an existing topic.</p>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="topic-select"
                    >
                      <option value="">Select a topic...</option>                      {allTopics.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAddToTopic}
                      disabled={!selectedTopic}
                      className="topic-action-button"
                    >
                      <FaFolder /> Add New Note to Topic
                    </button>
                  </div>
                )}
              </div>
            </div>          </div>
        </div>
      )}

      {/* Move Note Modal */}
      {showMoveModal && selectedNoteForMove && (
        <div className="note-modal-overlay" onClick={() => setShowMoveModal(false)}>
          <div className="topic-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaArrowRight /> Move Note to Topic</h3>
              <button onClick={() => setShowMoveModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="move-note-info">
                <h4>Moving: "{selectedNoteForMove.title}"</h4>
                <p>Current topic: <strong>{selectedNoteForMove.topic || 'General'}</strong></p>
              </div>
              <div className="topic-option">
                <h4>Select New Topic</h4>
                <select
                  value={moveToTopic}
                  onChange={(e) => setMoveToTopic(e.target.value)}
                  className="topic-select"
                >
                  {allTopics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
                <button 
                  onClick={handleMoveNote}
                  disabled={!moveToTopic || moveToTopic === selectedNoteForMove.topic}
                  className="topic-action-button"
                >
                  <FaArrowRight /> Move Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesOverview;
