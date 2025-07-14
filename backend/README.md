# Personal Notes & Bookmark Manager - Backend API

A secure RESTful API for managing personal notes and bookmarks with user authentication, favorites functionality, and comprehensive data validation.

## 🚀 Features

- **User Authentication**: JWT-based authentication system
- **Notes Management**: Create, read, update, delete personal notes
- **Bookmarks Management**: Save and organize web bookmarks with auto-title fetching
- **Favorites System**: Mark notes and bookmarks as favorites
- **Data Security**: User-specific data isolation
- **Input Validation**: Comprehensive validation for all inputs
- **URL Validation**: Automatic URL validation for bookmarks
- **Auto-fetch Titles**: Automatically fetch page titles for bookmarks
- **Search & Filtering**: Search by content and filter by favorites
- **Tags Support**: Organize notes with custom tags

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, bcryptjs, CORS
- **Development**: Nodemon for auto-reload

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MongoDB** (v5.0 or higher) - Local installation or MongoDB Atlas

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-notes-bookmark-manager/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend root directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bookmark_manager_dev

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security Configuration
BCRYPT_SALT_ROUNDS=12

# Optional: MongoDB Atlas Configuration
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookmark_manager?retryWrites=true&w=majority
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # Windows
   mongod

   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux (systemd)
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI` in `.env`

### 5. Start the Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   ├── index.js          # Environment configuration
│   └── database.js       # Database connection setup
├── controllers/
│   ├── authController.js # Authentication logic
│   ├── noteController.js # Notes CRUD operations
│   └── bookmarkController.js # Bookmarks CRUD operations
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── models/
│   ├── User.js          # User schema
│   ├── Note.js          # Note schema
│   └── Bookmark.js      # Bookmark schema
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── notes.js         # Notes API routes
│   └── bookmarks.js     # Bookmarks API routes
├── .env                 # Environment variables
├── index.js             # Application entry point
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🔌 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update user profile | ✅ |

### Notes Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notes` | Get all user notes | ✅ |
| GET | `/api/notes/:id` | Get specific note | ✅ |
| POST | `/api/notes` | Create new note | ✅ |
| PUT | `/api/notes/:id` | Update note | ✅ |
| DELETE | `/api/notes/:id` | Delete note | ✅ |

### Bookmarks Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bookmarks` | Get all user bookmarks | ✅ |
| GET | `/api/bookmarks/:id` | Get specific bookmark | ✅ |
| POST | `/api/bookmarks` | Create new bookmark | ✅ |
| PUT | `/api/bookmarks/:id` | Update bookmark | ✅ |
| DELETE | `/api/bookmarks/:id` | Delete bookmark | ✅ |

### Query Parameters

#### Notes & Bookmarks
- `search` - Search in title/content/description
- `favorite` - Filter favorites (`true`/`false`)
- `tags` - Filter by tags (comma-separated)
- `page` - Page number for pagination
- `limit` - Items per page

#### Example Requests
```bash
# Get favorite notes
GET /api/notes?favorite=true

# Search bookmarks
GET /api/bookmarks?search=javascript

# Get notes with specific tags
GET /api/notes?tags=work,important
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Example Login Flow

1. **Register/Login**:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

2. **Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

3. **Use Token**:
```bash
GET /api/notes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Request/Response Examples

### Create Note
```bash
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Meeting Notes",
  "content": "Important project discussion points...",
  "tags": ["work", "meeting"],
  "isFavorite": true
}
```

### Create Bookmark
```bash
POST /api/bookmarks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Useful Tutorial",
  "url": "https://example.com/tutorial",
  "description": "Great resource for learning",
  "isFavorite": false
}
```

## ✅ Validation Rules

### Notes
- **title**: Required, 1-200 characters
- **content**: Required, 1-10000 characters
- **tags**: Optional array of strings
- **isFavorite**: Boolean (default: false)

### Bookmarks
- **title**: Required, 1-200 characters (auto-fetched if empty)
- **url**: Required, valid URL format
- **description**: Optional, max 1000 characters
- **isFavorite**: Boolean (default: false)

### Users
- **name**: Required, 2-50 characters
- **email**: Required, valid email format, unique
- **password**: Required, minimum 6 characters

## 🔧 Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | Database connection string | mongodb://localhost:27017/bookmark_manager_dev |
| `JWT_SECRET` | JWT signing secret | your-dev-secret-key |
| `JWT_EXPIRES_IN` | Token expiration time | 7d |
| `CORS_ORIGIN` | Allowed frontend origin | http://localhost:3000 |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | 12 |

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Set appropriate `CORS_ORIGIN`

### Recommended Production Settings
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookmark_manager_prod
JWT_SECRET=your-super-secure-production-secret-min-32-chars
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://yourdomain.com
BCRYPT_SALT_ROUNDS=12
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MongoDB is running
   - Check MONGODB_URI in .env
   - Ensure database user has proper permissions

2. **JWT Token Invalid**
   - Check JWT_SECRET configuration
   - Verify token is included in Authorization header
   - Ensure token hasn't expired

3. **CORS Errors**
   - Verify CORS_ORIGIN matches frontend URL
   - Check frontend is sending requests to correct backend URL

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `npx kill-port 5000`

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=app:*
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -am 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related

- **Frontend Repository**: [Link to frontend repo]
- **Live Demo**: [Link to live demo]
- **API Documentation**: [Link to detailed API docs]

---

**Happy Coding! 🎉**

For questions or support, please open an issue in the repository.
