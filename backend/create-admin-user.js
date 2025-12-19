import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

// Load environment variables
dotenv.config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'owais@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      mongoose.connection.close();
      return;
    }
    
    // Create admin user with admin role
    const adminUser = await User.create({
      name: 'Owais Admin',
      email: 'owais@example.com',
      password: 'owais123',
      role: 'admin'
    });
    
    console.log('Admin user created successfully:');
    console.log(`Name: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
  }
}

createAdminUser();