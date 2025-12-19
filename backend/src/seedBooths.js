import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Booth from './models/Booth.js';
import Event from './models/Event.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function seedBooths() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Clear existing booths
    await Booth.deleteMany({});
    console.log('🧹 Cleared existing booths');
    
    // Get all events
    const events = await Event.find();
    if (events.length === 0) {
      console.log('❌ No events found. Please create events first.');
      process.exit(1);
    }
    
    console.log(`📍 Found ${events.length} events`);
    
    // Create sample booths for each event
    let totalBooths = 0;
    for (const event of events) {
      console.log(`\n📍 Creating booths for event: ${event.title}`);
      
      const boothData = [];
      
      // Create 3 rows with 5 booths each
      for (let row = 1; row <= 3; row++) {
        for (let number = 1; number <= 5; number++) {
          boothData.push({
            eventId: event._id,
            number: `${row}${String(number).padStart(2, '0')}`,
            row: `Row ${row}`,
            size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)]
          });
        }
      }
      
      // Insert booths for this event
      const booths = await Booth.insertMany(boothData);
      totalBooths += booths.length;
      console.log(`  ✅ Created ${booths.length} booths for this event`);
    }
    
    console.log(`\n🎉 Booth seeding completed successfully!`);
    console.log(`📊 Total booths created: ${totalBooths}`);
    
  } catch (error) {
    console.error('❌ Error seeding booths:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed function
seedBooths();