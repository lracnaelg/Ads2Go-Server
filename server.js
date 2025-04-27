const express = require('express');
const mongoose = require('mongoose');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
require('dotenv').config();

const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers/userResolvers');
const { authMiddleware } = require('./middleware/auth');

// Ensure MONGODB_URI exists in .env
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in the .env file');
  process.exit(1);
}

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
  .then(() => console.log('\n💾 Database: CONNECTED to MongoDB Atlas'))
  .catch(err => {
    console.error('\n❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Apply middleware and start server
async function startServer() {
  await server.start();

  app.use(express.json());

  app.use(
    '/graphql',
    cors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost', 'http://127.0.0.1', 'http://192.168.1.5:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    }),
    expressMiddleware(server, { context: authMiddleware })
  );

  // Improved error handling
  app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  const PORT = process.env.PORT || 5000;
  
  // Add error handling for server startup
  const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server ready at http://localhost:${PORT}/graphql`);
  });

  httpServer.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please kill the process using this port.`);
      process.exit(1);
    } else {
      console.error('Server startup error:', error);
    }
  });
}

startServer().catch(console.error);
