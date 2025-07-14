const Bookmark = require('../models/Bookmark');

// Helper function to fetch title from URL (bonus feature)
const fetchUrlTitle = async (url) => {
  try {
    // Simple implementation - in production, you might want to use a library like 'node-html-parser'
    const response = await fetch(url);
    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  } catch (error) {
    console.log('Failed to fetch title for URL:', url);
    return '';
  }
};

// Get all bookmarks for user with optional search and filtering
const getBookmarks = async (req, res) => {
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
    
    const bookmarks = await Bookmark.find(query)
      .sort({ updatedAt: -1 })
      .lean();
    
    res.json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookmarks',
      error: error.message
    });
  }
};

// Get single bookmark by ID
const getBookmarkById = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }
    
    res.json({
      success: true,
      data: bookmark
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookmark',
      error: error.message
    });
  }
};

// Create new bookmark
const createBookmark = async (req, res) => {
  try {
    let { url, title, description, tags, isFavorite } = req.body;
    
    // Auto-fetch title if not provided (bonus feature)
    let autoFetched = false;
    if (!title || title.trim() === '') {
      const fetchedTitle = await fetchUrlTitle(url);
      if (fetchedTitle) {
        title = fetchedTitle;
        autoFetched = true;
      }
    }
    
    const bookmark = new Bookmark({
      url,
      title: title || 'Untitled Bookmark',
      description: description || '',
      tags: tags || [],
      isFavorite: isFavorite || false,
      autoFetched,
      userId: req.user.id
    });
    
    await bookmark.save();
    
    res.status(201).json({
      success: true,
      message: 'Bookmark created successfully',
      data: bookmark
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
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have a bookmark with this URL'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating bookmark',
      error: error.message
    });
  }
};

// Update bookmark
const updateBookmark = async (req, res) => {
  try {
    const { url, title, description, tags, isFavorite } = req.body;
    
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { url, title, description, tags, isFavorite },
      { new: true, runValidators: true }
    );
    
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Bookmark updated successfully',
      data: bookmark
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
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have a bookmark with this URL'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating bookmark',
      error: error.message
    });
  }
};

// Delete bookmark
const deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting bookmark',
      error: error.message
    });
  }
};

module.exports = {
  getBookmarks,
  getBookmarkById,
  createBookmark,
  updateBookmark,
  deleteBookmark
};
