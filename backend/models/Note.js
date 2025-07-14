const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true
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
  }
}, {
  timestamps: true
});

// Add text index for search functionality
noteSchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text' 
});

// Add compound index for user and favorites
noteSchema.index({ userId: 1, isFavorite: 1 });
noteSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model('Note', noteSchema);
