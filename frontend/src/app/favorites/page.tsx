'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ExternalLink, Trash2, ArrowLeft, Bookmark, FileText } from 'lucide-react';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import NoteDetailModal from '@/components/NoteDetailModal';
import BookmarkDetailModal from '@/components/BookmarkDetailModal';
import Link from 'next/link';

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BookmarkItem {
  _id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FavoritesPage() {
  const [favoriteNotes, setFavoriteNotes] = useState<Note[]>([]);
  const [favoriteBookmarks, setFavoriteBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ item: Note | BookmarkItem; type: 'note' | 'bookmark' } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'note' | 'bookmark' | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const router = useRouter();

  // Function to fetch favorite notes
  const fetchFavoriteNotes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/notes?favorite=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setFavoriteNotes(data.data);
      }
    } catch (error) {
      console.error('Error fetching favorite notes:', error);
    }
  }, [router]);

  // Function to fetch favorite bookmarks
  const fetchFavoriteBookmarks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/bookmarks?favorite=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setFavoriteBookmarks(data.data);
      }
    } catch (error) {
      console.error('Error fetching favorite bookmarks:', error);
    }
  }, [router]);

  // Handle item click
  const handleItemClick = (item: Note | BookmarkItem, type: 'note' | 'bookmark') => {
    setSelectedItemId(item._id);
    setSelectedItemType(type);
    setIsDetailModalOpen(true);
  };

  // Handle note deletion
  const handleDeleteClick = (item: Note | BookmarkItem, type: 'note' | 'bookmark', e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete({ item, type });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const endpoint = itemToDelete.type === 'note' 
        ? `http://localhost:5000/api/notes/${itemToDelete.item._id}`
        : `http://localhost:5000/api/bookmarks/${itemToDelete.item._id}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (itemToDelete.type === 'note') {
          setFavoriteNotes(prev => prev.filter(note => note._id !== itemToDelete.item._id));
        } else {
          setFavoriteBookmarks(prev => prev.filter(bookmark => bookmark._id !== itemToDelete.item._id));
        }
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        throw new Error(data.message || `Failed to delete ${itemToDelete.type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${itemToDelete?.type}:`, error);
      alert(`Failed to delete ${itemToDelete?.type}. Please try again.`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Toggle favorite status
  const toggleFavorite = async (item: Note | BookmarkItem, type: 'note' | 'bookmark') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const endpoint = type === 'note' 
        ? `http://localhost:5000/api/notes/${item._id}`
        : `http://localhost:5000/api/bookmarks/${item._id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...item,
          isFavorite: !item.isFavorite
        })
      });

      const data = await response.json();
      if (data.success) {
        // Remove from favorites list since we're toggling off
        if (!item.isFavorite) {
          // This shouldn't happen since we're only showing favorites
          return;
        } else {
          // Remove from the current view
          if (type === 'note') {
            setFavoriteNotes(prev => prev.filter(note => note._id !== item._id));
          } else {
            setFavoriteBookmarks(prev => prev.filter(bookmark => bookmark._id !== item._id));
          }
        }
      }
    } catch (error) {
      console.error(`Error toggling favorite ${type}:`, error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchFavoriteNotes(), fetchFavoriteBookmarks()]);
      setLoading(false);
    };

    fetchData();
  }, [router, fetchFavoriteNotes, fetchFavoriteBookmarks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-700">Favorites</h1>
                <p className="text-gray-600">All your starred notes and bookmarks in one place</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorite Notes</p>
                <p className="text-2xl font-bold text-gray-700">{favoriteNotes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Bookmark className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorite Bookmarks</p>
                <p className="text-2xl font-bold text-gray-700">{favoriteBookmarks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {favoriteNotes.length === 0 && favoriteBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">
              Star your important notes and bookmarks to see them here
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/notes"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Notes
              </Link>
              <Link 
                href="/bookmarks"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Bookmarks
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Favorite Notes */}
            {favoriteNotes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Favorite Notes ({favoriteNotes.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteNotes.map((note) => (
                    <div 
                      key={note._id} 
                      className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleItemClick(note, 'note')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-700 truncate">{note.title}</h3>
                          <button
                            onClick={() => toggleFavorite(note, 'note')}
                            className="text-yellow-500 hover:text-yellow-600"
                          >
                            <Star className="h-4 w-4 fill-current flex-shrink-0" />
                          </button>
                        </div>
                        <button
                          onClick={(e) => handleDeleteClick(note, 'note', e)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {note.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              +{note.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Bookmarks */}
            {favoriteBookmarks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <Bookmark className="h-5 w-5 text-green-600 mr-2" />
                  Favorite Bookmarks ({favoriteBookmarks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteBookmarks.map((bookmark) => (
                    <div 
                      key={bookmark._id} 
                      className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleItemClick(bookmark, 'bookmark')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-700 truncate">{bookmark.title}</h3>
                          <button
                            onClick={() => toggleFavorite(bookmark, 'bookmark')}
                            className="text-yellow-500 hover:text-yellow-600"
                          >
                            <Star className="h-4 w-4 fill-current flex-shrink-0" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            onClick={(e) => handleDeleteClick(bookmark, 'bookmark', e)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {bookmark.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{bookmark.description}</p>
                      )}
                      
                      <p className="text-blue-600 text-sm mb-4 truncate">{bookmark.url}</p>
                      
                      {bookmark.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {bookmark.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              {tag}
                            </span>
                          ))}
                          {bookmark.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              +{bookmark.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {new Date(bookmark.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={deleting}
        itemName={itemToDelete?.item.title || ''}
        itemType={itemToDelete?.type || 'item'}
      />

      {/* Note Detail Modal */}
      {selectedItemType === 'note' && (
        <NoteDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          noteId={selectedItemId}
          onNoteUpdated={(updatedNote) => {
            // Update the note in the current list
            setFavoriteNotes(prev => prev.map(n => 
              n._id === updatedNote._id ? updatedNote : n
            ));
          }}
          onNoteDeleted={(noteId) => {
            // Remove the note from the current list
            setFavoriteNotes(prev => prev.filter(n => n._id !== noteId));
          }}
        />
      )}

      {/* Bookmark Detail Modal */}
      {selectedItemType === 'bookmark' && (
        <BookmarkDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          bookmarkId={selectedItemId}
          onBookmarkUpdated={(updatedBookmark) => {
            // Update the bookmark in the current list
            setFavoriteBookmarks(prev => prev.map(b => 
              b._id === updatedBookmark._id ? updatedBookmark : b
            ));
          }}
          onBookmarkDeleted={(bookmarkId) => {
            // Remove the bookmark from the current list
            setFavoriteBookmarks(prev => prev.filter(b => b._id !== bookmarkId));
          }}
        />
      )}
    </div>
  );
}
