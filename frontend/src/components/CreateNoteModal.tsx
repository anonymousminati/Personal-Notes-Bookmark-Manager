'use client';

import { useState } from 'react';
import { X, FileText, Tag, Star, Save } from 'lucide-react';

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated: (note: Note) => void;
}

export default function CreateNoteModal({ isOpen, onClose, onNoteCreated }: CreateNoteModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isFavorite: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isFavorite: e.target.checked
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.title.trim()) {
      newErrors.push('Title is required');
    }
    
    if (!formData.content.trim()) {
      newErrors.push('Content is required');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors([]);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrors(['Authentication required. Please log in again.']);
        return;
      }
      
      // Convert tags string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
      
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          tags: tagsArray,
          isFavorite: formData.isFavorite
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Call the callback to update the parent component
        onNoteCreated(data.data);
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          tags: '',
          isFavorite: false
        });
        
        // Close modal
        onClose();
      } else {
        setErrors(data.errors || [data.message || 'Failed to create note']);
      }
    } catch {
      setErrors(['Network error. Please check your connection and try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: '',
        content: '',
        tags: '',
        isFavorite: false
      });
      setErrors([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-700">Create New Note</h3>
                <p className="text-sm text-gray-500">Add a new note with tags and organize your thoughts</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-800 text-sm font-medium mb-1 last:mb-0">
                    {error}
                  </p>
                ))}
              </div>
            )}

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-2">
                Note Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="text-gray-600 w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter a descriptive title for your note"
                disabled={loading}
              />
            </div>

            {/* Content Field */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-600 mb-2">
                Note Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                className="text-gray-600 w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                placeholder="Write your note content here..."
                disabled={loading}
              />
            </div>

            {/* Tags Field */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-600 mb-2">
                Tags
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="text-gray-600 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter tags separated by commas (e.g., work, ideas, important)"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple tags with commas. Tags help you organize and find your notes easily.
              </p>
            </div>

            {/* Favorite Checkbox */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <input
                  id="isFavorite"
                  name="isFavorite"
                  type="checkbox"
                  checked={formData.isFavorite}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="isFavorite" className="ml-2 flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  Mark as favorite
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-600 rounded-2xl font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-2xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="h-4 w-4 mr-2" />
                    Create Note
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
