import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

// Load environment variables
dotenv.config();

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
      enrollmentNumber: 'EN123456',
      department: 'Computer Science'
    });
    
    console.log('Test user created successfully:');
    console.log(`Name: ${testUser.name}`);
    console.log(`Email: ${testUser.email}`);
    console.log(`Role: ${testUser.role}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
  }
}

createTestUser();