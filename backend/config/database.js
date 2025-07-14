const mongoose = require('mongoose');

class DatabaseConfig {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Get MongoDB connection URI
   * @returns {string} MongoDB connection string
   */
  getConnectionURI() {
    const {
      MONGODB_URI,
    
    } = process.env;

    // If MONGODB_URI is provided, use it directly
    if (MONGODB_URI) {
      return MONGODB_URI;
    }

    // Construct URI from individual components
    let uri = 'mongodb://';
    
    if (MONGODB_USERNAME && MONGODB_PASSWORD) {
      uri += `${MONGODB_USERNAME}:${MONGODB_PASSWORD}@`;
    }
    
    uri += `${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
    
    // Add additional options for production
    if (NODE_ENV === 'production') {
      uri += '?retryWrites=true&w=majority';
    }
    
    return uri;
  }

  /**
   * Get MongoDB connection options
   * @returns {object} Mongoose connection options
   */
  getConnectionOptions() {
    const { NODE_ENV = 'development' } = process.env;
    
    const baseOptions = {
     
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      bufferCommands: false, // Disable mongoose buffering
      // Disable mongoose buffering
    };

    // Production-specific options
    if (NODE_ENV === 'production') {
      return {
        ...baseOptions,
        maxPoolSize: 20,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 10000
      };
    }

    return baseOptions;
  }

  /**
   * Connect to MongoDB with retry logic
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.isConnected) {
      console.log('📦 Already connected to MongoDB');
      return;
    }

    try {
      const uri = this.getConnectionURI();
      const options = this.getConnectionOptions();

      console.log('🔄 Connecting to MongoDB...');
      
      this.connection = await mongoose.connect(uri, options);
      this.isConnected = true;
      this.retryCount = 0;

      console.log('✅ Successfully connected to MongoDB');
      console.log(`📍 Database: ${this.connection.connection.name}`);
      console.log(`🌐 Host: ${this.connection.connection.host}:${this.connection.connection.port}`);

    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retrying connection... (${this.retryCount}/${this.maxRetries})`);
        
        await this.delay(this.retryDelay);
        return this.connect();
      } else {
        console.error('💥 Maximum retry attempts reached. Exiting...');
        process.exit(1);
      }
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (!this.isConnected) {
      console.log('📦 Already disconnected from MongoDB');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.connection = null;
      console.log('✅ Successfully disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Check database connection health
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      if (!this.isConnected || !this.connection) {
        return false;
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get connection status
   * @returns {object} Connection status information
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      retryCount: this.retryCount
    };
  }

  /**
   * Setup connection event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (error) => {
      console.error('🔴 Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🟢 Mongoose reconnected to MongoDB');
      this.isConnected = true;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const databaseConfig = new DatabaseConfig();

// Setup event listeners
databaseConfig.setupEventListeners();

module.exports = databaseConfig;
