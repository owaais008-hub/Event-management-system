#!/usr/bin/env node

/**
 * MongoDB Atlas Setup Helper
 * 
 * This script helps verify MongoDB Atlas connection settings
 * and provides guidance for proper setup.
 */

import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('=== MongoDB Atlas Setup Helper ===\n');

// Check if MONGO_URI is set
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env file');
  console.log('\nPlease add the following to your .env file:');
  console.log('MONGO_URI=mongodb+srv://username:password@cluster-name.abc123.mongodb.net/database-name?retryWrites=true&w=majority');
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI;
console.log('Current MONGO_URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//[username]:[password]@'));

// Extract hostname from MongoDB URI
const hostnameMatch = mongoUri.match(/mongodb\+srv:\/\/[^@]+@([^\/]+)/);
if (!hostnameMatch) {
  console.error('❌ Invalid MongoDB URI format');
  process.exit(1);
}

const hostname = hostnameMatch[1];
console.log('\n🔍 Checking hostname:', hostname);

// Test DNS resolution
console.log('\n🔄 Testing DNS resolution...');

dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, records) => {
  if (err) {
    console.error('❌ DNS SRV resolution failed:', err.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your cluster name in the connection string');
    console.log('2. Check if your MongoDB Atlas cluster is running');
    console.log('3. Ensure your internet connection is working');
    console.log('4. Try regular DNS lookup...');
    
    // Try regular DNS resolution as fallback
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        console.error('❌ DNS lookup also failed:', err.message);
        console.log('\n🔧 Additional troubleshooting:');
        console.log('1. Log in to MongoDB Atlas at https://cloud.mongodb.com/');
        console.log('2. Verify your cluster exists and is running');
        console.log('3. Get the correct connection string from the "Connect" button');
        console.log('4. Make sure your IP is whitelisted in Network Access');
        console.log('5. Verify your database user credentials');
        process.exit(1);
      } else {
        console.log('✅ DNS lookup successful:', address);
        testMongoConnection();
      }
    });
  } else {
    console.log('✅ DNS SRV resolution successful');
    console.log('Records found:', records.length);
    testMongoConnection();
  }
});

function testMongoConnection() {
  console.log('\n🔄 Testing MongoDB connection...');
  
  mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test a simple operation
    return mongoose.connection.db.admin().command({ ping: 1 });
  })
  .then(() => {
    console.log('✅ Ping successful - MongoDB Atlas is ready!');
    console.log('\n🎉 MongoDB Atlas connection is working correctly!');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your database user credentials');
    console.log('2. Check if your IP is whitelisted in MongoDB Atlas Network Access');
    console.log('3. Ensure your cluster is running');
    console.log('4. Try using a local MongoDB instance as fallback for development');
    
    process.exit(1);
  });
}