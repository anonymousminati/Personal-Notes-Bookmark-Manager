const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
// Import configurations
const config = require('./config');
const databaseConfig = require('./config/database');

const app = express();
const PORT = config.port;

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const bookmarkRoutes = require('./routes/bookmarks');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Personal Notes Bookmark Manager API',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Database health check route
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await databaseConfig.healthCheck();
    const connectionStatus = databaseConfig.getConnectionStatus();
    
    res.json({
      status: 'OK',
      database: {
        connected: dbStatus,
        ...connectionStatus
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: {
        connected: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Connect to MongoDB
  try {
    await databaseConfig.connect();
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
  }
});

module.exports = app;
