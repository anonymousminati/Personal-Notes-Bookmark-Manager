'use client';

import { useState } from 'react';
import { FileText, Star, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RecentNotesProps {
  notes: Note[];
  onCreateNote: () => void;
  onNoteDeleted: (noteId: string) => void;
  onNoteUpdated?: (updatedNote: Note) => void;
}

export default function RecentNotes({ notes, onCreateNote, onNoteDeleted, onNoteUpdated }: RecentNotesProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);

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
        onNoteDeleted(noteToDelete._id);
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
      if (data.success && onNoteUpdated) {
        onNoteUpdated(data.data);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="material-surface rounded-3xl shadow-lg border border-white/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700">Recent Notes</h3>
        </div>
        <div className="text-center py-16">
          <div className="material-surface w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No notes yet</h4>
          <p className="text-gray-500 mb-6">Start capturing your thoughts and ideas</p>
          <button 
            onClick={onCreateNote}
            className="material-button-filled px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Create Your First Note
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="material-surface rounded-3xl shadow-lg border border-white/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700">Recent Notes</h3>
        </div>
        <div className="space-y-4">
          {notes.slice(0, 5).map((note, index) => (
            <div 
              key={note._id} 
              className="group material-card rounded-2xl p-6 hover:shadow-md cursor-pointer transform hover:scale-[1.02] transition-all duration-300 animate-slide-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full flex-shrink-0"></div>
                  <h4 className="text-base font-semibold text-gray-700 truncate">{note.title}</h4>
                  {note.isFavorite && (
                    <Star className="h-5 w-5 text-amber-500 fill-current flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{note.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {note.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span key={tagIndex} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
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
                </div>
              </div>
            </div>
          ))}
          {notes.length > 5 && (
            <div className="text-center pt-6">
              <button className="material-button-ghost px-6 py-3 rounded-2xl font-medium hover:shadow-md transition-all duration-200">
                View all {notes.length} notes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={deleting}
        itemName={noteToDelete?.title || ''}
        itemType="note"
      />
    </>
  );
}
