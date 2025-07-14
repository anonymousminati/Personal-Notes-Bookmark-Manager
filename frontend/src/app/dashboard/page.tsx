'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Bookmark, FileText, Star, User } from 'lucide-react';
import CreateNoteModal from '../../components/CreateNoteModal';
import RecentNotes from '../../components/RecentNotes';
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

interface Bookmark {
  _id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{username: string; email: string; _id: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false);
  const [notesStats, setNotesStats] = useState({
    total: 0,
    favorites: 0
  });
  const [bookmarksStats, setBookmarksStats] = useState({
    total: 0,
    favorites: 0
  });
  const router = useRouter();

  // Function to refresh all stats
  const refreshStats = useCallback(async () => {
    await Promise.all([fetchNotes(), fetchBookmarksStats()]);
  }, []);

  // Function to fetch notes from API
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setNotes(data.data);
        setNotesStats({
          total: data.data.length,
          favorites: data.data.filter((note: Note) => note.isFavorite).length
        });
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  // Function to fetch bookmarks stats from API
  const fetchBookmarksStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/bookmarks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setBookmarksStats({
          total: data.data.length,
          favorites: data.data.filter((bookmark: Bookmark) => bookmark.isFavorite).length
        });
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  // Function to handle note deletion
  const handleNoteDeleted = (noteId: string) => {
    setNotes(prev => prev.filter(note => note._id !== noteId));
    setNotesStats(prev => {
      const deletedNote = notes.find(note => note._id === noteId);
      return {
        total: prev.total - 1,
        favorites: prev.favorites - (deletedNote?.isFavorite ? 1 : 0)
      };
    });
    // Also refresh bookmarks stats to keep data fresh
    fetchBookmarksStats();
  };

  // Function to handle new note creation
  const handleNoteCreated = (newNote: Note) => {
    setNotes(prev => [newNote, ...prev]);
    setNotesStats(prev => ({
      total: prev.total + 1,
      favorites: prev.favorites + (newNote.isFavorite ? 1 : 0)
    }));
    // Also refresh bookmarks stats to keep data fresh
    fetchBookmarksStats();
  };

  // Function to handle note updates
  const handleNoteUpdated = (updatedNote: Note) => {
    setNotes(prev => prev.map(note => 
      note._id === updatedNote._id ? updatedNote : note
    ));
    // Refresh stats to update favorites count
    fetchNotes();
  };

  // Function to open create note modal
  const openCreateNoteModal = () => {
    setIsCreateNoteModalOpen(true);
  };

  // Function to close create note modal
  const closeCreateNoteModal = () => {
    setIsCreateNoteModalOpen(false);
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
      // Fetch notes and bookmarks after setting user
      fetchNotes();
      fetchBookmarksStats();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
      return;
    }
    
    setLoading(false);
  }, [router]);

  // Refresh stats when window gains focus (user returns to dashboard)
  useEffect(() => {
    const handleFocus = () => {
      refreshStats();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshStats]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-indigo-600 rounded-full animate-pulse-slow"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-white/90 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.username || 'User'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={openCreateNoteModal}
                className="material-button gradient-primary text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Quick Note</span>
              </button>
              
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl border border-gray-200/50 shadow-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">{user?.username}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="material-button p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-in-up">
          <div className="material-surface-elevated p-8 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Your Personal Knowledge Hub
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Organize your thoughts, save important links, and keep track of your favorite content all in one beautiful place.
            </p>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Notes Total */}
          <div className="material-card group hover:scale-105 transition-all duration-300 animate-slide-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Notes</p>
                <p className="text-3xl font-bold text-indigo-600">{notesStats.total}</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Bookmarks Total */}
          <div className="material-card group hover:scale-105 transition-all duration-300 animate-slide-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Bookmarks</p>
                <p className="text-3xl font-bold text-emerald-600">{bookmarksStats.total}</p>
              </div>
              <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Bookmark className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Favorites */}
          <div className="material-card group hover:scale-105 transition-all duration-300 animate-slide-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Favorites</p>
                <p className="text-3xl font-bold text-amber-600">{notesStats.favorites + bookmarksStats.favorites}</p>
              </div>
              <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="material-card group hover:scale-105 transition-all duration-300 animate-slide-in-up">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-3">Quick Actions</p>
              <div className="flex space-x-2">
                <button
                  onClick={openCreateNoteModal}
                  className="material-button flex-1 gradient-primary text-white py-2 px-3 rounded-lg text-xs font-medium hover:shadow-md transition-all duration-200"
                  title="Create Note"
                >
                  <Plus className="h-3 w-3 mx-auto" />
                </button>
                <Link
                  href="/notes"
                  className="material-button flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center"
                  title="View Notes"
                >
                  <FileText className="h-3 w-3" />
                </Link>
                <Link
                  href="/bookmarks"
                  className="material-button flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center"
                  title="View Bookmarks"
                >
                  <Bookmark className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Notes Card */}
          <Link href="/notes" className="material-card group hover:scale-105 transition-all duration-300 animate-slide-in-up block">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">{notesStats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">My Notes</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Organize your thoughts, ideas, and important information in beautiful, searchable notes.
            </p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {notesStats.favorites} favorites
              </span>
              <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                Browse <span className="ml-1">→</span>
              </div>
            </div>
          </Link>

          {/* Bookmarks Card */}
          <Link href="/bookmarks" className="material-card group hover:scale-105 transition-all duration-300 animate-slide-in-up block">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 gradient-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Bookmark className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">{bookmarksStats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">My Bookmarks</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Save and organize your favorite websites, articles, and resources for easy access.
            </p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {bookmarksStats.favorites} favorites
              </span>
              <div className="flex items-center text-emerald-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                Browse <span className="ml-1">→</span>
              </div>
            </div>
          </Link>

          {/* Favorites Card */}
          <Link href="/favorites" className="material-card group hover:scale-105 transition-all duration-300 animate-slide-in-up block">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 gradient-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Star className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-600">{notesStats.favorites + bookmarksStats.favorites}</p>
                <p className="text-xs text-gray-500">Items</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Favorites</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Quick access to your most important and frequently used content.
            </p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                All starred items
              </span>
              <div className="flex items-center text-amber-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                View All <span className="ml-1">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-8 animate-slide-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-700">Recent Activity</h2>
            <Link 
              href="/notes" 
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1 transition-colors duration-200"
            >
              <span>View all notes</span>
              <span>→</span>
            </Link>
          </div>
          
          <RecentNotes 
            notes={notes}
            onCreateNote={openCreateNoteModal}
            onNoteDeleted={handleNoteDeleted}
            onNoteUpdated={handleNoteUpdated}
          />
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8 animate-slide-in-up">
          <h2 className="text-2xl font-bold text-gray-700 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={openCreateNoteModal}
              className="material-card group hover:scale-105 transition-all duration-300 p-6 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Create New Note</h3>
                  <p className="text-sm text-gray-600">Start writing your ideas</p>
                </div>
              </div>
            </button>

            <Link
              href="/bookmarks"
              className="material-card group hover:scale-105 transition-all duration-300 p-6 text-left block"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Bookmark className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Add Bookmark</h3>
                  <p className="text-sm text-gray-600">Save important links</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Create Note Modal */}
        {isCreateNoteModalOpen && (
          <CreateNoteModal
            isOpen={isCreateNoteModalOpen}
            onClose={closeCreateNoteModal}
            onNoteCreated={handleNoteCreated}
          />
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={openCreateNoteModal}
        className="fab"
        title="Create new note"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
