'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-3xl mb-8 shadow-lg animate-scale-in">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-700 mb-6 animate-slide-in-up">
            Personal Notes & 
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Bookmark Manager
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            Organize your thoughts and save your favorite links in one beautiful, 
            searchable place. Never lose track of important information again.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-in-up" style={{ animationDelay: '400ms' }}>
          <Link
            href="/signup"
            className="material-button-filled px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="material-button-ghost px-8 py-4 rounded-2xl font-semibold text-lg transform hover:scale-105 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="material-card p-8 rounded-3xl transform hover:scale-105 transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '600ms' }}>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Smart Notes</h3>
            <p className="text-gray-600">
              Create and organize notes with tags. Search through your content instantly and never lose important information.
            </p>
          </div>
          
          <div className="material-card p-8 rounded-3xl transform hover:scale-105 transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '700ms' }}>
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🔖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Bookmark Manager</h3>
            <p className="text-gray-600">
              Save URLs with automatic title detection. Organize bookmarks with tags and descriptions for easy retrieval.
            </p>
          </div>
          
          <div className="material-card p-8 rounded-3xl transform hover:scale-105 transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '800ms' }}>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Favorites & Search</h3>
            <p className="text-gray-600">
              Mark important items as favorites and use powerful search to find exactly what you need in seconds.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p>&copy; 2025 Personal Notes & Bookmark Manager. Made with ❤️</p>
        </div>
      </div>
    </div>
  );
}
