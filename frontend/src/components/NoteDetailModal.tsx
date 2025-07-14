'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Star, Edit, Trash2, Calendar, Tag } from 'lucide-react';

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string | null;
  onNoteUpdated?: (note: Note) => void;
  onNoteDeleted?: (noteId: string) => void;
}

export default function NoteDetailModal({ 
  isOpen, 
  onClose, 
  noteId, 
  onNoteUpdated, 
  onNoteDeleted 
}: NoteDetailModalProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    tags: '',
    isFavorite: false
  });

  // Fetch note details
  const fetchNote = useCallback(async () => {
    if (!noteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setNote(data.data);
        setEditForm({
          title: data.data.title,
          content: data.data.content,
          tags: data.data.tags.join(', '),
          isFavorite: data.data.isFavorite
        });
      } else {
        setError(data.message || 'Failed to fetch note');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      setError('Failed to load note');
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchNote();
    }
  }, [isOpen, noteId, fetchNote]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!note) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...note,
          isFavorite: !note.isFavorite
        })
      });

      const data = await response.json();
      if (data.success) {
        setNote(data.data);
        setEditForm(prev => ({ ...prev, isFavorite: data.data.isFavorite }));
        if (onNoteUpdated) {
          onNoteUpdated(data.data);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Handle edit form submission
  const handleSaveEdit = async () => {
    if (!note) return;
    
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

      const response = await fetch(`http://localhost:5000/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          content: editForm.content,
          tags: tagsArray,
          isFavorite: editForm.isFavorite
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNote(data.data);
        setIsEditing(false);
        if (onNoteUpdated) {
          onNoteUpdated(data.data);
        }
      } else {
        setError(data.message || 'Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!note) return;
    
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`http://localhost:5000/api/notes/${note._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        if (onNoteDeleted) {
          onNoteDeleted(note._id);
        }
        onClose();
      } else {
        setError(data.message || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note');
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
              {isEditing ? 'Edit Note' : 'Note Details'}
            </h2>
            {note?.isFavorite && !isEditing && (
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && note && (
              <>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    note.isFavorite 
                      ? 'text-yellow-500 hover:bg-yellow-50' 
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                  }`}
                  title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`h-4 w-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit note"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete note"
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
                onClick={fetchNote}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : note && isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter note title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Content</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter note content"
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
          ) : note ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-700 mb-4">{note.title}</h1>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-600 leading-relaxed">
                    {note.content}
                  </div>
                </div>
              </div>
              
              {note.tags.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  {note.updatedAt !== note.createdAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
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
