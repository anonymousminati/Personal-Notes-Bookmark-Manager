const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Please provide a valid URL'
    }
  },
  title: {
    type: String,
    required: [true, 'Bookmark title is required'],
    trim: true,
    maxLength: [300, 'Title cannot exceed 300 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Auto-fetched metadata
  favicon: {
    type: String,
    default: ''
  },
  autoFetched: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add text index for search functionality
bookmarkSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  url: 'text'
});

// Add compound indexes
bookmarkSchema.index({ userId: 1, isFavorite: 1 });
bookmarkSchema.index({ userId: 1, tags: 1 });
bookmarkSchema.index({ userId: 1, url: 1 }, { unique: true }); // Prevent duplicate URLs per user

module.exports = mongoose.model('Bookmark', bookmarkSchema);
