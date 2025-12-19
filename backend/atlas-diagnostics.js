import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

// Load environment variables

dotenv.config();

console.log('=== MongoDB Atlas Connection Diagnostics ===\n');

const mongoUri = process.env.MONGO_URI;
console.log('Current MONGO_URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//[username]:[password]@'));

if (!mongoUri) {
  console.error('❌ MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Extract hostname from MongoDB URI
const hostnameMatch = mongoUri.match(/mongodb\+srv:\/\/[^@]+@([^\/]+)/);
if (!hostnameMatch) {
  console.error('❌ Invalid MongoDB URI format');
  process.exit(1);
}

const hostname = hostnameMatch[1];
console.log('\n🔍 Analyzing hostname:', hostname);

// Test DNS resolution
console.log('\n🔄 Testing DNS SRV resolution...');
dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, records) => {
  if (err) {
    console.error('❌ DNS SRV resolution failed:', err.message);
    console.log('\nThis indicates that the MongoDB Atlas cluster hostname is incorrect or not accessible.');
    
    // Try regular DNS resolution as fallback
    console.log('\n🔄 Testing regular DNS resolution...');
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        console.error('❌ DNS lookup also failed:', err.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Verify your cluster name in MongoDB Atlas');
        console.log('2. Check if your MongoDB Atlas cluster is running');
        console.log('3. Ensure your internet connection is working');
        console.log('4. Verify your IP is whitelisted in MongoDB Atlas Network Access');
        console.log('5. Check your firewall/antivirus settings');
        process.exit(1);
      } else {
        console.log('✅ DNS lookup successful:', address);
        console.log('\nNow testing MongoDB connection...');
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
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
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
    console.log('4. Check your firewall/antivirus settings');
    
    process.exit(1);
  });
}