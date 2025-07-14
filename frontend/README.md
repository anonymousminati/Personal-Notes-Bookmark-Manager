# Personal Notes & Bookmark Manager - Frontend

A modern, responsive React/Next.js frontend application for managing personal notes and bookmarks with a beautiful UI, authentication, and comprehensive features.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design built with Tailwind CSS
- **User Authentication**: Secure login/register with JWT tokens
- **Notes Management**: Create, edit, delete, and organize personal notes
- **Bookmarks Management**: Save and manage web bookmarks with auto-title fetching
- **Favorites System**: Mark important items as favorites with visual indicators
- **Advanced Search**: Search through notes and bookmarks content
- **Tag Filtering**: Organize and filter content by custom tags
- **Modal System**: Elegant modals for viewing and editing content
- **Dashboard Analytics**: Overview of your content with statistics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Instant UI updates for all operations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 
- **Icons**: Lucide React
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Authentication**: JWT tokens with localStorage
- **Build Tool**: Turbopack (Next.js)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Backend API** running on `http://localhost:5000`

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-notes-bookmark-manager/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the frontend root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# App Configuration
NEXT_PUBLIC_APP_NAME=Personal Notes & Bookmark Manager
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics or other services
# NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/
│   ├── file.svg          # Static icons
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── bookmarks/    # Bookmarks management page
│   │   ├── dashboard/    # Main dashboard
│   │   ├── favorites/    # Favorites page
│   │   ├── login/        # Login page
│   │   ├── notes/        # Notes management page
│   │   ├── signup/       # Registration page
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout component
│   │   └── page.tsx      # Homepage/landing page
│   └── components/       # Reusable React components
│       ├── BookmarkDetailModal.tsx
│       ├── CreateNoteModal.tsx
│       ├── DeleteConfirmModal.tsx
│       ├── NoteDetailModal.tsx
│       └── RecentNotes.tsx
├── .env.local           # Environment variables
├── eslint.config.mjs    # ESLint configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies and scripts
├── postcss.config.mjs   # PostCSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🎨 Pages & Features

### 🏠 **Homepage** (`/`)
- Welcome message and feature overview
- Call-to-action buttons for login/signup
- Modern landing page design

### 🔐 **Authentication**
- **Login** (`/login`): User authentication with email/password
- **Signup** (`/signup`): New user registration
- JWT token management with automatic logout on expiration

### 📊 **Dashboard** (`/dashboard`)
- Statistics overview (total notes, bookmarks, favorites)
- Recent notes widget
- Quick action buttons
- Navigation to all features

### 📝 **Notes Management** (`/notes`)
- View all personal notes in a card layout
- Create new notes with rich content
- Edit notes inline or in modal view
- Delete notes with confirmation
- Mark notes as favorites
- Filter by favorites only
- Search through note content
- Tag-based filtering

### 🔖 **Bookmarks Management** (`/bookmarks`)
- View all saved bookmarks
- Add new bookmarks with URL validation
- Auto-fetch page titles when URL is provided
- Edit bookmark details in modal
- Delete bookmarks with confirmation
- Mark bookmarks as favorites
- Filter by favorites only
- Search through bookmark content

### ⭐ **Favorites** (`/favorites`)
- Unified view of all favorite notes and bookmarks
- Toggle favorite status
- Search and filter favorite items
- Quick access to most important content

## 🎛️ Components

### **Modal Components**
- **NoteDetailModal**: Full CRUD operations for notes
- **BookmarkDetailModal**: Full CRUD operations for bookmarks
- **CreateNoteModal**: Dedicated note creation interface
- **DeleteConfirmModal**: Confirmation dialog for deletions

### **Utility Components**
- **RecentNotes**: Dashboard widget showing latest notes
- Responsive navigation and layout components
- Form validation and error handling

## 🔧 Development

### Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

### Development Features

- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code quality and consistency enforcement
- **Turbopack**: Fast build and development experience

## 🎨 Styling & UI

### **Design System**
- **Colors**: Modern color palette with semantic naming
- **Typography**: Clean, readable fonts (Geist Sans & Geist Mono)
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components
- **Icons**: Lucide React icon library

### **Responsive Design**
- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Excellent tablet experience
- **Desktop**: Full desktop functionality
- **Breakpoints**: Custom responsive breakpoints

### **Interactive Elements**
- **Hover Effects**: Subtle animations and feedback
- **Focus States**: Accessible keyboard navigation
- **Loading States**: Visual feedback during operations
- **Error States**: Clear error messaging

## 🔗 API Integration

### **Authentication Flow**
1. User submits login credentials
2. Frontend sends request to `/api/auth/login`
3. Backend returns JWT token
4. Token stored in localStorage
5. Token included in all subsequent requests

### **API Endpoints Used**

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/api/auth/login` | User authentication | POST |
| `/api/auth/register` | User registration | POST |
| `/api/notes` | Notes CRUD operations | GET, POST, PUT, DELETE |
| `/api/bookmarks` | Bookmarks CRUD operations | GET, POST, PUT, DELETE |

### **Error Handling**
- Network error handling
- Authentication token expiration
- Validation error display
- User-friendly error messages

## 🚀 Production Build

### Build Process
```bash
# Create production build
npm run build

# Start production server
npm start
```

### **Optimization Features**
- **Static Generation**: Pre-built pages for better performance
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic code splitting for faster loading
- **Bundle Analysis**: Built-in bundle size optimization

### **Performance**
- **Lighthouse Score**: Optimized for Core Web Vitals
- **SEO Ready**: Meta tags and structured data
- **PWA Ready**: Progressive Web App capabilities
- **Fast Loading**: Optimized assets and lazy loading

## 🌐 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### **Environment Variables for Production**
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_NAME=Personal Notes & Bookmark Manager
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

### **Other Deployment Options**
- **Netlify**: Static site deployment
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment
- **Traditional Hosting**: Static file hosting

## 🔧 Configuration

### **Next.js Configuration** (`next.config.ts`)
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add your custom configuration here
  images: {
    domains: ['example.com'], // Add external image domains
  },
  // Enable experimental features if needed
  experimental: {
    turbo: {
      // Turbopack configuration
    }
  }
};

export default nextConfig;
```

### **TypeScript Configuration**
- Strict type checking enabled
- Path mapping for clean imports
- Modern ES features supported

## 🐛 Troubleshooting

### **Common Issues**

1. **API Connection Failed**
   ```bash
   # Check if backend is running
   curl http://localhost:5000/api/auth/login
   
   # Verify NEXT_PUBLIC_API_URL in .env.local
   ```

2. **Authentication Issues**
   ```bash
   # Clear localStorage
   localStorage.clear()
   
   # Check token expiration
   # Login again to get fresh token
   ```

3. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Styling Issues**
   ```bash
   # Ensure Tailwind CSS is properly configured
   # Check globals.css imports
   ```

### **Debug Mode**
```bash
# Enable debug mode
DEBUG=* npm run dev

# Check browser console for detailed logs
```

## 📱 Browser Support

- **Chrome** (last 2 versions)
- **Firefox** (last 2 versions)
- **Safari** (last 2 versions)
- **Edge** (last 2 versions)
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit changes: `git commit -am 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Submit a pull request

### **Development Guidelines**
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add responsive design for all components
- Write clean, documented code

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related

- **Backend Repository**: [Link to backend repo]
- **API Documentation**: [Link to API docs]
- **Live Demo**: [Link to live demo]
- **Design System**: [Link to design system docs]

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

For questions or support, please open an issue in the repository.
