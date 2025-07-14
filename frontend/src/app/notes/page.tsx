'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Star, Trash2, Filter, X, FileText, ArrowLeft } from 'lucide-react';
import CreateNoteModal from '@/components/CreateNoteModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import NoteDetailModal from '@/components/NoteDetailModal';
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

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isNoteDetailModalOpen, setIsNoteDetailModalOpen] = useState(false);
  const router = useRouter();

  // Function to fetch all notes
  const fetchNotes = useCallback(async (search = '', tags: string[] = [], favoritesOnly = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      let url = 'http://localhost:5000/api/notes';
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
        setNotes(data.data);
        
        // Extract all unique tags
        const tagSet = new Set<string>();
        data.data.forEach((note: Note) => {
          note.tags.forEach(tag => tagSet.add(tag));
        });
        setAllTags(Array.from(tagSet).sort());
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Handle search
  const handleSearch = () => {
    setLoading(true);
    fetchNotes(searchTerm, selectedTags, showFavoritesOnly);
  };

  // Handle tag filter
  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    setLoading(true);
    fetchNotes(searchTerm, newTags, showFavoritesOnly);
  };

  // Handle favorites filter
  const toggleFavoritesOnly = () => {
    const newFavoritesOnly = !showFavoritesOnly;
    setShowFavoritesOnly(newFavoritesOnly);
    setLoading(true);
    fetchNotes(searchTerm, selectedTags, newFavoritesOnly);
  };

  // Handle note card click
  const handleNoteClick = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsNoteDetailModalOpen(true);
  };

  // Handle note creation
  const handleNoteCreated = (newNote: Note) => {
    setNotes(prev => [newNote, ...prev]);
    setIsCreateNoteModalOpen(false);
    // Refresh to get updated tags
    fetchNotes(searchTerm, selectedTags, showFavoritesOnly);
  };

  // Handle note deletion
  const handleDeleteClick = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;
    
    setDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`http://localhost:5000/api/notes/${noteToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotes(prev => prev.filter(note => note._id !== noteToDelete._id));
        setDeleteModalOpen(false);
        setNoteToDelete(null);
      } else {
        throw new Error(data.message || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setNoteToDelete(null);
  };

  // Toggle favorite status
  const toggleFavorite = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    
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
        // Update the note in the current list
        setNotes(prev => prev.map(n => 
          n._id === note._id ? { ...n, isFavorite: !n.isFavorite } : n
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
    fetchNotes('', [], false);
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchNotes('', [], false);
  }, [router, fetchNotes]);

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
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-700">All Notes</h1>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    {notes.length} notes found
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsCreateNoteModalOpen(true)}
              className="material-button-filled flex items-center gap-2 px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Create Note</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="material-surface rounded-3xl p-8 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col space-y-6">
            {/* Search Bar */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-600 placeholder-gray-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="material-button-filled px-6 py-4 rounded-2xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="material-button-ghost flex items-center gap-2 px-4 py-4 rounded-2xl transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-6 animate-slide-in-down">
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter by tags:
                  </span>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Favorites Filter */}
                <div className="flex items-center mb-3">
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
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-600">
                        {tag}
                        <button
                          onClick={() => toggleTag(tag)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
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

        {/* Notes Grid */}
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notes.map((note, index) => (
              <div 
                key={note._id} 
                className="group material-card rounded-3xl p-6 hover:shadow-xl cursor-pointer transform hover:scale-105 transition-all duration-300 animate-slide-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleNoteClick(note._id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full flex-shrink-0"></div>
                    <h3 className="text-lg font-semibold text-gray-700 truncate">{note.title}</h3>
                    {note.isFavorite && (
                      <Star className="h-5 w-5 text-amber-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleFavorite(note, e)}
                      className={`opacity-0 group-hover:opacity-100 p-2 rounded-full transition-all duration-200 ${
                        note.isFavorite 
                          ? 'text-amber-500 bg-amber-50' 
                          : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                      title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`h-4 w-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(note, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{note.content}</p>
                
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  Created: {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="material-surface w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || selectedTags.length > 0 ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || selectedTags.length > 0 
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.' 
                : 'Start capturing your thoughts and ideas by creating your first note.'
              }
            </p>
            {(!searchTerm && selectedTags.length === 0) && (
              <button 
                onClick={() => setIsCreateNoteModalOpen(true)}
                className="material-button-filled px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Create Your First Note
              </button>
            )}
          </div>
        )}

        {/* Create Note Modal */}
        {isCreateNoteModalOpen && (
          <CreateNoteModal
            isOpen={isCreateNoteModalOpen}
            onClose={() => setIsCreateNoteModalOpen(false)}
            onNoteCreated={handleNoteCreated}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={deleting}
          itemName={noteToDelete?.title || ''}
          itemType="note"
        />

        {/* Note Detail Modal */}
        <NoteDetailModal
          isOpen={isNoteDetailModalOpen}
          onClose={() => setIsNoteDetailModalOpen(false)}
          noteId={selectedNoteId}
          onNoteUpdated={(updatedNote) => {
            // Update the note in the current list
            setNotes(prev => prev.map(n => 
              n._id === updatedNote._id ? updatedNote : n
            ));
          }}
          onNoteDeleted={(noteId) => {
            // Remove the note from the current list
            setNotes(prev => prev.filter(n => n._id !== noteId));
          }}
        />
      </div>
    </div>
  );
}
