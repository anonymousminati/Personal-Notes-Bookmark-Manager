'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Star, Trash2, Filter, X, Bookmark, ArrowLeft, ExternalLink } from 'lucide-react';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import BookmarkDetailModal from '@/components/BookmarkDetailModal';
import CreateBookmarkModal from '@/components/CreateBookmarkModal';
import Link from 'next/link';

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

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isCreateBookmarkModalOpen, setIsCreateBookmarkModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<BookmarkItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null);
  const [isBookmarkDetailModalOpen, setIsBookmarkDetailModalOpen] = useState(false);
  const router = useRouter();

  // Function to fetch all bookmarks
  const fetchBookmarks = useCallback(async (search = '', tags: string[] = [], favoritesOnly = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      let url = 'http://localhost:5000/api/bookmarks';
      const params = new URLSearchParams();
      
      if (search) params.append('q', search);
      if (tags.length > 0) params.append('tags', tags.join(','));
      if (favoritesOnly) params.append('favorite', 'true');
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setBookmarks(data.data);
        
        // Extract all unique tags
        const tagSet = new Set<string>();
        data.data.forEach((bookmark: BookmarkItem) => {
          bookmark.tags.forEach(tag => tagSet.add(tag));
        });
        setAllTags(Array.from(tagSet).sort());
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Handle search
  const handleSearch = () => {
    setLoading(true);
    fetchBookmarks(searchTerm, selectedTags, showFavoritesOnly);
  };

  // Handle tag filter
  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    setLoading(true);
    fetchBookmarks(searchTerm, newTags, showFavoritesOnly);
  };

  // Handle favorites filter
  const toggleFavoritesOnly = () => {
    const newFavoritesOnly = !showFavoritesOnly;
    setShowFavoritesOnly(newFavoritesOnly);
    setLoading(true);
    fetchBookmarks(searchTerm, selectedTags, newFavoritesOnly);
  };

  // Handle bookmark card click
  const handleBookmarkClick = (bookmarkId: string) => {
    setSelectedBookmarkId(bookmarkId);
    setIsBookmarkDetailModalOpen(true);
  };

  // Handle bookmark creation
  const handleBookmarkCreated = (newBookmark: BookmarkItem) => {
    setBookmarks(prev => [newBookmark, ...prev]);
    setIsCreateBookmarkModalOpen(false);
    // Refresh to get updated tags
    fetchBookmarks(searchTerm, selectedTags, showFavoritesOnly);
  };

  // Handle bookmark deletion
  const handleDeleteClick = (bookmark: BookmarkItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkToDelete(bookmark);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookmarkToDelete) return;
    
    setDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`http://localhost:5000/api/bookmarks/${bookmarkToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookmarks(prev => prev.filter(bookmark => bookmark._id !== bookmarkToDelete._id));
        setDeleteModalOpen(false);
        setBookmarkToDelete(null);
      } else {
        throw new Error(data.message || 'Failed to delete bookmark');
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert('Failed to delete bookmark. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setBookmarkToDelete(null);
  };

  // Toggle favorite status
  const toggleFavorite = async (bookmark: BookmarkItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
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
        // Update the bookmark in the current list
        setBookmarks(prev => prev.map(b => 
          b._id === bookmark._id ? { ...b, isFavorite: !b.isFavorite } : b
        ));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setShowFavoritesOnly(false);
    setLoading(true);
    fetchBookmarks();
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchBookmarks();
  }, [router, fetchBookmarks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="material-surface shadow-md border-b border-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link 
                href="/dashboard" 
                className="material-button-ghost mr-4 p-3 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                  <Bookmark className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-700">All Bookmarks</h1>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    {bookmarks.length} bookmarks found
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsCreateBookmarkModalOpen(true)}
              className="material-button-filled flex items-center gap-2 px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Add Bookmark</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="material-surface rounded-3xl p-8 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookmarks by title, description, or URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-gray-600 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 border border-gray-300 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-600">Filter options:</span>
                  <button
                    onClick={toggleFavoritesOnly}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      showFavoritesOnly
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ⭐ Favorites Only
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-600">Filter by tags:</span>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                
                {/* Active Filters */}
                {(searchTerm || selectedTags.length > 0 || showFavoritesOnly) && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {searchTerm && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        Search: &ldquo;{searchTerm}&rdquo;
                      </span>
                    )}
                    {showFavoritesOnly && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                        Favorites Only
                      </span>
                    )}
                    {selectedTags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        {tag}
                        <button
                          onClick={() => toggleTag(tag)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={clearFilters}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarks.map((bookmark, index) => (
              <div 
                key={bookmark._id} 
                className="group material-card rounded-3xl p-6 hover:shadow-xl cursor-pointer transform hover:scale-105 transition-all duration-300 animate-slide-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleBookmarkClick(bookmark._id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-3 h-3 bg-gradient-to-r from-secondary to-accent rounded-full flex-shrink-0"></div>
                    <h3 className="text-lg font-semibold text-gray-700 truncate">{bookmark.title}</h3>
                    {bookmark.isFavorite && (
                      <Star className="h-5 w-5 text-amber-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleFavorite(bookmark, e)}
                      className={`opacity-0 group-hover:opacity-100 p-2 rounded-full transition-all duration-200 ${
                        bookmark.isFavorite 
                          ? 'text-amber-500 bg-amber-50' 
                          : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                      title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`h-4 w-4 ${bookmark.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                      title="Open link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={(e) => handleDeleteClick(bookmark, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                      title="Delete bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-blue-600 text-sm mb-2 break-all font-medium">{bookmark.url}</p>
                
                {bookmark.description && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{bookmark.description}</p>
                )}
                
                {bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {bookmark.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  Added: {new Date(bookmark.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="material-surface w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Bookmark className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || selectedTags.length > 0 || showFavoritesOnly ? 'No bookmarks found' : 'No bookmarks yet'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || selectedTags.length > 0 || showFavoritesOnly
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.' 
                : 'Start building your personal bookmark collection by adding your first bookmark.'
              }
            </p>
            {(!searchTerm && selectedTags.length === 0 && !showFavoritesOnly) && (
              <button 
                onClick={() => setIsCreateBookmarkModalOpen(true)}
                className="material-button-filled px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Add Your First Bookmark
              </button>
            )}
          </div>
        )}

        {/* Create Bookmark Modal */}
        <CreateBookmarkModal
          isOpen={isCreateBookmarkModalOpen}
          onClose={() => setIsCreateBookmarkModalOpen(false)}
          onBookmarkCreated={handleBookmarkCreated}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={deleting}
          itemName={bookmarkToDelete?.title || ''}
          itemType="bookmark"
        />

        {/* Bookmark Detail Modal */}
        <BookmarkDetailModal
          isOpen={isBookmarkDetailModalOpen}
          onClose={() => setIsBookmarkDetailModalOpen(false)}
          bookmarkId={selectedBookmarkId}
          onBookmarkUpdated={(updatedBookmark) => {
            // Update the bookmark in the current list
            setBookmarks(prev => prev.map(b => 
              b._id === updatedBookmark._id ? updatedBookmark : b
            ));
          }}
          onBookmarkDeleted={(bookmarkId) => {
            // Remove the bookmark from the current list
            setBookmarks(prev => prev.filter(b => b._id !== bookmarkId));
          }}
        />
      </div>
    </div>
  );
}
