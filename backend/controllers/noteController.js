const Note = require('../models/Note');

// Get all notes for user with optional search and filtering
const getNotes = async (req, res) => {
  try {
    const { q, tags, favorite } = req.query;
    const userId = req.user.id;
    
    let query = { userId };
    
    // Add search functionality
    if (q) {
      query.$text = { $search: q };
    }
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }
    
    // Filter by favorites
    if (favorite === 'true') {
      query.isFavorite = true;
    }
    
    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .lean();
    
    res.json({
      success: true,
      count: notes.length,
      data: notes
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notes',
      error: error.message
    });
  }
};

// Get single note by ID
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    res.json({
      success: true,
      data: note
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching note',
      error: error.message
    });
  }
};

// Create new note
const createNote = async (req, res) => {
  try {
    const { title, content, tags, isFavorite } = req.body;
    
    const note = new Note({
      title,
      content,
      tags: tags || [],
      isFavorite: isFavorite || false,
      userId: req.user.id
    });
    
    await note.save();
    
    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating note',
      error: error.message
    });
  }
};

// Update note
const updateNote = async (req, res) => {
  try {
    const { title, content, tags, isFavorite } = req.body;
    
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, content, tags, isFavorite },
      { new: true, runValidators: true }
    );
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating note',
      error: error.message
    });
  }
};

// Delete note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting note',
      error: error.message
    });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};
