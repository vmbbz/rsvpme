import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding';

const SettingsSchema = new mongoose.Schema({
  rsvpOpen: { type: Boolean, default: true },
  maxGuests: { type: Number, default: 200 },
  adminPassword: { type: String, default: '1234' },
  elevenLabsAgentId: { type: String, default: '' },
  schedule: [{ time: String, event: String, icon: String, detail: String }],
  questions: [{ fieldId: String, label: String, type: String, options: [String], required: Boolean }],
  lodgingInfo: [{ name: String, desc: String, url: String }],
  travelInfo: String,
  mood: String,
  religion: String,
});

const Settings = mongoose.model('Settings', SettingsSchema);

async function checkPassword() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    let settings = await Settings.findOne();
    if (!settings) {
      console.log('No settings found, creating default...');
      settings = await Settings.create({
        rsvpOpen: true,
        maxGuests: 250,
        adminPassword: '1234',
        elevenLabsAgentId: '',
        schedule: [],
        questions: [],
        lodgingInfo: [],
        travelInfo: "",
        mood: "",
        religion: ""
      });
    }
    
    console.log('Current admin password:', settings.adminPassword);
    
    // Optional: Reset to 1234
    // await Settings.updateOne({}, { adminPassword: '1234' });
    // console.log('Password reset to 1234');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkPassword();
