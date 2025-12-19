import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { initSocket } from './services/socket.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables explicitly
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import exhibitorRoutes from './routes/exhibitorRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';
import boothRoutes from './routes/boothRoutes.js';

const app = express();
// Default to 5000 to align with frontend proxy and docs
const PORT = process.env.PORT || 5000;

// Configure CORS with more flexible origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ];
    
    // Check if the origin is in our allowed list or if it's from our own domain
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/exhibitors', exhibitorRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/booths', boothRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Create HTTP server and initialize socket.io
const server = createServer(app);

// Connect to MongoDB with proper error handling and retry logic
async function connectToDatabase() {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables');
      }
      
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      });
      
      console.log('✅ MongoDB connected successfully');
      return true;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, err.message);
      
      if (attempt === maxRetries) {
        console.error('❌ MongoDB connection failed after maximum retries');
        throw err;
      }
      
      console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Initialize socket.io after server creation
let io;
function initializeSocket() {
  try {
    io = initSocket(server, process.env.CLIENT_URL || 'http://localhost:5173');
    console.log('✅ Socket.IO initialized successfully');
    return io;
  } catch (err) {
    console.error('❌ Socket.IO initialization failed:', err.message);
    throw err;
  }
}

// Graceful shutdown handler
function setupGracefulShutdown() {
  const signals = ['SIGTERM', 'SIGINT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);
      
      try {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        
        // Close server
        server.close(() => {
          console.log('✅ HTTP server closed');
          process.exit(0);
        });
        
        // Force close after 10 seconds
        setTimeout(() => {
          console.error('❌ Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000);
        
      } catch (err) {
        console.error('❌ Error during shutdown:', err.message);
        process.exit(1);
      }
    });
  });
}

// Application startup sequence
async function startApplication() {
  try {
    console.log('🚀 Starting Event Management System...');
    
    // 1. Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectToDatabase();
    
    // 2. Initialize socket.io
    console.log('🔌 Initializing Socket.IO...');
    initializeSocket();
    
    // 3. Setup graceful shutdown
    setupGracefulShutdown();
    
    // 4. Start server
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Health check endpoint: http://localhost:${PORT}/api/health`);
      console.log(`📊 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
    
  } catch (err) {
    console.error('❌ Failed to start application:', err.message);
    process.exit(1);
  }
}

// Start the application
startApplication();

export { app, server, io };