// Environment configuration
const config = {
  development: {
    port: process.env.PORT || 5000,
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmark_manager_dev',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      }
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-dev-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    },
    logging: {
      level: 'debug'
    }
  },

  test: {
    port: process.env.PORT || 5001,
    mongodb: {
      uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/bookmark_manager_test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 3,
        serverSelectionTimeoutMS: 5000
      }
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'test-secret-key',
      expiresIn: '1h'
    },
    cors: {
      origin: 'http://localhost:3000',
      credentials: true
    },
    logging: {
      level: 'error'
    }
  },

  production: {
    port: process.env.PORT || 8080,
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 20,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        w: 'majority'
      }
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    },
    logging: {
      level: 'info'
    }
  }
};

const env = process.env.NODE_ENV || 'development';

// Validate required environment variables in production
if (env === 'production') {
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }
}

module.exports = config[env];
