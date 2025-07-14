const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/noteController');
const auth = require('../middleware/auth');

// All note routes require authentication
router.use(auth);

// @route   GET /api/notes
// @desc    Get all notes with optional search and filtering
// @access  Private
router.get('/', getNotes);

// @route   GET /api/notes/:id
// @desc    Get single note by ID
// @access  Private
router.get('/:id', getNoteById);

// @route   POST /api/notes
// @desc    Create new note
// @access  Private
router.post('/', createNote);

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Private
router.put('/:id', updateNote);

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete('/:id', deleteNote);

module.exports = router;
