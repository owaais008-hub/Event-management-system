import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Event from './models/Event.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function getEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ Connected to MongoDB');
    
    // Get all events
    const events = await Event.find();
    
    console.log('📋 Events:');
    events.forEach(event => {
      console.log(`  - ID: ${event._id}`);
      console.log(`    Title: ${event.title}`);
      console.log(`    Date: ${event.date}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the function
getEvents();