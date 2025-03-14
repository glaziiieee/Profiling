// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createRedisClient } = require('./config/redis');
const BarangayModel = require('./models/barangay');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] 
}));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'An unexpected error occurred', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Initialize and connect Redis client
const startServer = async () => {
  try {
    const redisClient = createRedisClient();
    await redisClient.connect();
    
    // Create model instance
    const barangayModel = new BarangayModel(redisClient);
    app.locals.barangayModel = barangayModel;
    app.locals.redisClient = redisClient;
    
    // Routes
    app.use('/api', apiRoutes);
    
    // Default route
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Barangay Profiling API', 
        version: '1.0.0',
        endpoints: [
          { method: 'GET', path: '/api/profiles', description: 'Get all barangay profiles' },
          { method: 'GET', path: '/api/profiles/:id', description: 'Get a specific barangay profile' },
          { method: 'POST', path: '/api/profiles', description: 'Create a new barangay profile' },
          { method: 'PUT', path: '/api/profiles/:id', description: 'Update a barangay profile' },
          { method: 'DELETE', path: '/api/profiles/:id', description: 'Delete a barangay profile' },
          { method: 'GET', path: '/api/profile/stats', description: 'Get demographic statistics' },
          { method: 'GET', path: '/api/health', description: 'Check server health' }
        ]
      });
    });
    
    // Handle 404 errors
    app.use((req, res) => {
      res.status(404).json({ message: 'Endpoint not found' });
    });
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down server...');
      await redisClient.quit();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();