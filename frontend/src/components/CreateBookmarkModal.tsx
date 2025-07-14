'use client';

import { useState } from 'react';
import { X, Bookmark, Link as LinkIcon, Tag, Star, Save, Globe, Loader2 } from 'lucide-react';

interface BookmarkItem {
  _id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookmarkCreated: (bookmark: BookmarkItem) => void;
}

export default function CreateBookmarkModal({ isOpen, onClose, onBookmarkCreated }: CreateBookmarkModalProps) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    tags: '',
    isFavorite: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isAutoFetching, setIsAutoFetching] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Auto-fetch title when URL is provided and title is empty
  const handleUrlBlur = async () => {
    if (formData.url && !formData.title) {
      setIsAutoFetching(true);
      try {
        // Validate URL first
        new URL(formData.url);
        
        const token = localStorage.getItem('token');
        if (!token) return;

        // Call backend to fetch title
        const response = await fetch('http://localhost:5000/api/bookmarks/fetch-title', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url: formData.url })
        });

        const data = await response.json();
        if (data.success && data.title) {
          setFormData(prev => ({
            ...prev,
            title: data.title
          }));
        }
      } catch (error) {
        // Silently fail auto-fetch - user can still enter title manually
        console.log('Auto-fetch failed:', error);
      } finally {
        setIsAutoFetching(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.url.trim()) {
      newErrors.push('URL is required');
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.push('Please enter a valid URL');
      }
    }
    
    if (!formData.title.trim()) {
      newErrors.push('Title is required');
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
      
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
      
      const response = await fetch('http://localhost:5000/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: formData.url.trim(),
          title: formData.title.trim(),
          description: formData.description.trim(),
          tags: tagsArray,
          isFavorite: formData.isFavorite
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onBookmarkCreated(data.data);
        // Reset form
        setFormData({
          url: '',
          title: '',
          description: '',
          tags: '',
          isFavorite: false
        });
        onClose();
      } else {
        setErrors([data.message || 'Failed to create bookmark']);
      }
    } catch (error) {
      console.error('Error creating bookmark:', error);
      setErrors(['Failed to create bookmark. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      url: '',
      title: '',
      description: '',
      tags: '',
      isFavorite: false
    });
    setErrors([]);
    setLoading(false);
    setIsAutoFetching(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="material-surface rounded-3xl p-8 w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto shadow-lg border border-white/20 animate-slide-in-up">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">Create New Bookmark</h3>
          </div>
          <button
            onClick={handleClose}
            className="material-button-ghost p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-200/50 rounded-2xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <X className="h-3 w-3 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-red-400 mt-1.5 text-xs">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
              <LinkIcon className="h-4 w-4 text-primary" />
              URL *
            </label>
            <div className="relative">
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                onBlur={handleUrlBlur}
                placeholder="https://example.com"
                className="w-full px-4 py-3 pl-12 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-700 placeholder-gray-500"
                required
                disabled={loading}
              />
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {isAutoFetching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
              )}
            </div>
            {isAutoFetching && (
              <p className="text-xs text-primary mt-2 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Fetching page information...
              </p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
              <Bookmark className="h-4 w-4 text-primary" />
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter bookmark title"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-700 placeholder-gray-500"
              required
              disabled={loading || isAutoFetching}
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Leave empty to auto-fetch from the webpage
            </p>
          </div>

          <div>
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description"
              rows={3}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-700 placeholder-gray-500 resize-none"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="tags" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
              <Tag className="h-4 w-4 text-primary" />
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="web, development, tutorial (comma-separated)"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-700 placeholder-gray-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Separate multiple tags with commas
            </p>
          </div>

          {/* Favorite Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-white/30 rounded-2xl border border-gray-200">
            <div className="relative">
              <input
                type="checkbox"
                id="isFavorite"
                name="isFavorite"
                checked={formData.isFavorite}
                onChange={handleCheckboxChange}
                className="sr-only"
                disabled={loading}
              />
              <label
                htmlFor="isFavorite"
                className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-200 cursor-pointer ${
                  formData.isFavorite
                    ? 'bg-amber-500 border-amber-500'
                    : 'bg-white border-gray-300 hover:border-amber-500'
                }`}
              >
                {formData.isFavorite && (
                  <Star className="h-3 w-3 text-white fill-current" />
                )}
              </label>
            </div>
            <label htmlFor="isFavorite" className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <Star className={`h-4 w-4 ${formData.isFavorite ? 'text-amber-500' : 'text-gray-400'}`} />
              <span>Mark as favorite</span>
            </label>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="material-button-ghost flex-1 py-3 text-sm font-medium rounded-2xl transition-all duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isAutoFetching}
              className="material-button-filled flex-1 py-3 text-sm font-medium rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : isAutoFetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Bookmark
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
