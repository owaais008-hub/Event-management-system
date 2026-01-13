import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority';

console.log('=== MongoDB Connection Diagnostics ===');
console.log('Current MONGO_URI:', mongoUri);

// Check if we're using Atlas
const isAtlas = mongoUri.includes('mongodb.net');

if (isAtlas) {
  console.log('✅ Using MongoDB Atlas');
  console.log('⚠️  Make sure your IP is whitelisted in MongoDB Atlas Network Access');
  console.log('⚠️  Make sure the username and password are correct');
} else {
  console.log('🔄 Using local MongoDB instance');
}

// Try to connect to MongoDB
console.log('\n🔄 Attempting to connect to MongoDB...');

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');

    // Send a ping to confirm a successful connection
    return mongoose.connection.db.admin().command({ ping: 1 });
  })
  .then(() => {
    console.log('✅ Ping successful - MongoDB is ready!');
    console.log('🎉 MongoDB connection is working correctly!');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error.message);

    // Provide specific troubleshooting steps
    if (isAtlas) {
      console.log('\n🔧 MongoDB Atlas Troubleshooting:');
      console.log('1. Check if your MongoDB Atlas cluster is running');
      console.log('2. Verify your IP address is whitelisted in MongoDB Atlas Network Access');
      console.log('   - Go to MongoDB Atlas > Network Access > Add IP Address');
      console.log('   - Add your current IP or use 0.0.0.0/0 (for testing only)');
      console.log('3. Verify the username and password are correct');
      console.log('4. Check your internet connection');
      console.log('5. Try using a local MongoDB instance as fallback');
    } else {
      console.log('\n🔧 Local MongoDB Troubleshooting:');
      console.log('1. Make sure MongoDB is installed and running');
      console.log('2. Check if MongoDB is listening on the correct port (27017)');
      console.log('3. Verify the database name is correct');
    }

    process.exit(1);
  });