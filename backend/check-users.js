import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

// Load environment variables
dotenv.config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check if there are any users
    const users = await User.find({});
    console.log(`Found ${users.length} users in the database:`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
      });
    } else {
      console.log('No users found in the database. You need to create an account first.');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
  }
}

checkUsers();