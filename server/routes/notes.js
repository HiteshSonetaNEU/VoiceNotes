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

// Get all unique topics
router.get('/topics/list', async (req, res) => {
  try {
    const topics = await Note.distinct('topic');
    res.json(topics.filter(topic => topic && topic.trim() !== ''));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new topic (without creating a note)
router.post('/topics/create', async (req, res) => {
  try {
    const { topicName } = req.body;
    if (!topicName || !topicName.trim()) {
      return res.status(400).json({ message: 'Topic name is required' });
    }
    
    // Check if topic already exists
    const existingTopic = await Note.findOne({ topic: topicName.trim() });
    if (existingTopic) {
      return res.status(409).json({ message: 'Topic already exists' });
    }
    
    // For now, we'll just return success since we don't need to store empty topics in the database
    // Topics will be created implicitly when notes are moved to them
    res.status(201).json({ topic: topicName.trim(), message: 'Topic created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notes by topic
router.get('/topics/:topic', async (req, res) => {
  try {
    const notes = await Note.find({ topic: req.params.topic }).sort({ updatedAt: -1 });
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
    content: req.body.content,
    contentType: req.body.contentType || 'plain',
    topic: req.body.topic || 'General'
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
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      updatedAt: Date.now()
    };
    
    if (req.body.contentType) {
      updateData.contentType = req.body.contentType;
    }
    
    if (req.body.topic) {
      updateData.topic = req.body.topic;
    }
    
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// Move note to a different topic
router.patch('/:id/topic', async (req, res) => {
  try {
    const { topic } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { topic: topic || 'General', updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
