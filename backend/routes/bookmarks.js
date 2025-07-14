const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  getBookmarkById,
  createBookmark,
  updateBookmark,
  deleteBookmark
} = require('../controllers/bookmarkController');
const auth = require('../middleware/auth');

// All bookmark routes require authentication
router.use(auth);

// @route   GET /api/bookmarks
// @desc    Get all bookmarks with optional search and filtering
// @access  Private
router.get('/', getBookmarks);

// @route   GET /api/bookmarks/:id
// @desc    Get single bookmark by ID
// @access  Private
router.get('/:id', getBookmarkById);

// @route   POST /api/bookmarks
// @desc    Create new bookmark
// @access  Private
router.post('/', createBookmark);

// @route   PUT /api/bookmarks/:id
// @desc    Update bookmark
// @access  Private
router.put('/:id', updateBookmark);

// @route   DELETE /api/bookmarks/:id
// @desc    Delete bookmark
// @access  Private
router.delete('/:id', deleteBookmark);

module.exports = router;
