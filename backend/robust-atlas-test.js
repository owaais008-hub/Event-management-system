import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('=== Robust MongoDB Atlas Connection Test ===\n');

const mongoUri = process.env.MONGO_URI;
console.log('MONGO_URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//[username]:[password]@'));

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
console.log('\n🔍 Checking hostname:', hostname);

// Test multiple DNS resolution methods
console.log('\n🔄 Testing DNS resolution methods...');

// Method 1: DNS SRV (standard for MongoDB Atlas)
dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, records) => {
  if (err) {
    console.error('❌ DNS SRV resolution failed:', err.message);
    
    // Method 2: Regular DNS lookup
    console.log('\n🔄 Trying regular DNS lookup...');
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        console.error('❌ Regular DNS lookup also failed:', err.message);
        
        // Method 3: DNS resolve
        console.log('\n🔄 Trying DNS resolve...');
        dns.resolve(hostname, (err, addresses) => {
          if (err) {
            console.error('❌ DNS resolve also failed:', err.message);
            console.log('\n🔧 Critical troubleshooting steps:');
            console.log('1. Verify your cluster exists and is running in MongoDB Atlas');
            console.log('2. Check if the cluster name in your connection string is correct');
            console.log('3. Ensure your IP is whitelisted in MongoDB Atlas Network Access');
            console.log('4. Verify your database user credentials');
            console.log('5. Check your internet connection and firewall settings');
            console.log('6. Try connecting to a local MongoDB instance for development');
            process.exit(1);
          } else {
            console.log('✅ DNS resolve successful:', addresses);
            testMongoConnection();
          }
        });
      } else {
        console.log('✅ Regular DNS lookup successful:', address);
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
  console.log('\n🔄 Testing MongoDB connection with various options...');
  
  // Try multiple connection options
  const connectionOptions = [
    {
      name: 'Standard connection',
      options: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      }
    },
    {
      name: 'With direct connection',
      options: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        directConnection: false,
      }
    },
    {
      name: 'With SSL disabled (for testing)',
      options: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        ssl: false,
      }
    }
  ];
  
  // Try each connection option
  tryConnectionOption(0);
  
  function tryConnectionOption(index) {
    if (index >= connectionOptions.length) {
      console.error('❌ All connection options failed');
      process.exit(1);
      return;
    }
    
    const option = connectionOptions[index];
    console.log(`\n🔄 Trying ${option.name}...`);
    
    mongoose.connect(mongoUri, option.options)
      .then(() => {
        console.log(`✅ Successfully connected to MongoDB Atlas using ${option.name}!`);
        
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
        console.error(`❌ Failed to connect using ${option.name}:`, error.message);
        // Try next option
        tryConnectionOption(index + 1);
      });
  }
}