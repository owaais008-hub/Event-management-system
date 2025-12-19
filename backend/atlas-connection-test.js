import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const mongoUri = process.env.MONGO_URI;

console.log('=== MongoDB Atlas Connection Test ===');
console.log('MONGO_URI:', mongoUri);

// Extract hostname from MongoDB URI
const hostname = mongoUri.match(/mongodb\+srv:\/\/[^@]+@([^\/]+)/)[1];
console.log('Hostname to resolve:', hostname);

// Test DNS resolution
dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, records) => {
  if (err) {
    console.error('❌ DNS SRV resolution failed:', err.message);
    console.error('This indicates that the MongoDB Atlas cluster hostname is incorrect or not accessible.');
    
    // Try regular DNS resolution as fallback
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        console.error('❌ DNS lookup also failed:', err.message);
        console.error('Please check:');
        console.error('1. Your internet connection');
        console.error('2. The cluster name in your connection string');
        console.error('3. Whether your IP is whitelisted in MongoDB Atlas');
      } else {
        console.log('✅ DNS lookup successful:', address);
        console.log('Now testing MongoDB connection...');
        
        // Try to connect to MongoDB
        mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 5000,
        })
        .then(() => {
          console.log('✅ Successfully connected to MongoDB Atlas!');
          mongoose.connection.close();
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
          process.exit(1);
        });
      }
    });
  } else {
    console.log('✅ DNS SRV resolution successful');
    console.log('Records:', records);
    
    // Try to connect to MongoDB
    mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    })
    .then(() => {
      console.log('✅ Successfully connected to MongoDB Atlas!');
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
      process.exit(1);
    });
  }
});