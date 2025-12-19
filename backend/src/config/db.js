import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  const mongoUri = env.mongoUri;

  try {
    // Connect to MongoDB with retry logic and better error handling
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });

    if (env.nodeEnv === 'development') {
      console.log('MongoDB connected successfully');
    }

    // Send a ping to confirm a successful connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    if (env.nodeEnv === 'development') {
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
  } catch (error) {
    if (env.nodeEnv === 'development') {
      console.error('MongoDB connection error:', error.message);

      // Provide more specific error information
      if (error.message.includes('querySrv ENODATA')) {
        console.error('DNS SRV resolution failed. Check your cluster name and internet connection.');
      } else if (error.message.includes('authentication failed')) {
        console.error('Authentication failed. Check your username and password.');
      } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
        console.error('DNS resolution failed. Check your cluster hostname.');
      }
    }

    // Don't exit process, let the application handle the error
    throw error;
  }
}