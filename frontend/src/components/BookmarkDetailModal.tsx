'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Star, Edit, Trash2, Calendar, Tag, ExternalLink, Globe } from 'lucide-react';

interface BookmarkItem {
  _id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  isFavorite: boolean;
  autoFetched: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BookmarkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkId: string | null;
  onBookmarkUpdated?: (bookmark: BookmarkItem) => void;
  onBookmarkDeleted?: (bookmarkId: string) => void;
}

export default function BookmarkDetailModal({ 
  isOpen, 
  onClose, 
  bookmarkId, 
  onBookmarkUpdated, 
  onBookmarkDeleted 
}: BookmarkDetailModalProps) {
  const [bookmark, setBookmark] = useState<BookmarkItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    isFavorite: false
  });

  // Fetch bookmark details
  const fetchBookmark = useCallback(async () => {
    if (!bookmarkId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`http://localhost:5000/api/bookmarks/${bookmarkId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setBookmark(data.data);
        setEditForm({
          title: data.data.title,
          url: data.data.url,
          description: data.data.description,
          tags: data.data.tags.join(', '),
          isFavorite: data.data.isFavorite
        });
      } else {
        setError(data.message || 'Failed to fetch bookmark');
      }
    } catch (error) {
      console.error('Error fetching bookmark:', error);
      setError('Failed to load bookmark');
    } finally {
      setLoading(false);
    }
  }, [bookmarkId]);

  useEffect(() => {
    if (isOpen && bookmarkId) {
      fetchBookmark();
    }
  }, [isOpen, bookmarkId, fetchBookmark]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!bookmark) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/bookmarks/${bookmark._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...bookmark,
          isFavorite: !bookmark.isFavorite
        })
      });

      const data = await response.json();
      if (data.success) {
        setBookmark(data.data);
        setEditForm(prev => ({ ...prev, isFavorite: data.data.isFavorite }));
        if (onBookmarkUpdated) {
          onBookmarkUpdated(data.data);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Handle edit form submission
  const handleSaveEdit = async () => {
    if (!bookmark) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const tagsArray = editForm.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      const response = await fetch(`http://localhost:5000/api/bookmarks/${bookmark._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          url: editForm.url,
          description: editForm.description,
          tags: tagsArray,
          isFavorite: editForm.isFavorite
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setBookmark(data.data);
        setIsEditing(false);
        if (onBookmarkUpdated) {
          onBookmarkUpdated(data.data);
        }
      } else {
        setError(data.message || 'Failed to update bookmark');
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      setError('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!bookmark) return;
    
    if (!confirm('Are you sure you want to delete this bookmark? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`http://localhost:5000/api/bookmarks/${bookmark._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        if (onBookmarkDeleted) {
          onBookmarkDeleted(bookmark._id);
        }
        onClose();
      } else {
        setError(data.message || 'Failed to delete bookmark');
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      setError('Failed to delete bookmark');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="material-surface rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-700">
              {isEditing ? 'Edit Bookmark' : 'Bookmark Details'}
            </h2>
            {bookmark?.isFavorite && !isEditing && (
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && bookmark && (
              <>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Open link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    bookmark.isFavorite 
                      ? 'text-yellow-500 hover:bg-yellow-50' 
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                  }`}
                  title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`h-4 w-4 ${bookmark.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit bookmark"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete bookmark"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsEditing(false);
                onClose();
              }}
              className="material-button-ghost p-3 rounded-full transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchBookmark}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : bookmark && isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter bookmark title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">URL</label>
                <input
                  type="url"
                  value={editForm.url}
                  onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Tags</label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tags separated by commas"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="editFavorite"
                  type="checkbox"
                  checked={editForm.isFavorite}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isFavorite: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="editFavorite" className="ml-2 block text-sm text-gray-700">
                  Mark as favorite
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="material-button-ghost flex-1 px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : bookmark ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-700 mb-4">{bookmark.title}</h1>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">URL</span>
                  </div>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all text-sm underline"
                  >
                    {bookmark.url}
                  </a>
                </div>
                
                {bookmark.description && (
                  <div className="prose max-w-none">
                    <div className="text-gray-600 leading-relaxed">
                      {bookmark.description}
                    </div>
                  </div>
                )}
              </div>
              
              {bookmark.tags.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bookmark.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex flex-col space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {new Date(bookmark.createdAt).toLocaleDateString()}</span>
                  </div>
                  {bookmark.updatedAt !== bookmark.createdAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Updated: {new Date(bookmark.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {bookmark.autoFetched && (
                    <div className="text-xs text-gray-400">
                      Title was automatically fetched from the webpage
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
