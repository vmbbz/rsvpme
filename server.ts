
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding';

app.use(cors() as any);
app.use(express.json() as any);

// Mock data for production without MongoDB
const mockState = {
  rsvpOpen: true,
  maxGuests: 200,
  adminPassword: '1234',
  elevenLabsAgentId: '',
  schedule: [
    { time: '2:00 PM', event: 'Guests Arrive', icon: 'Users' },
    { time: '3:00 PM', event: 'Ceremony Begins', icon: 'Heart' },
    { time: '4:00 PM', event: 'Reception & Dining', icon: 'ChefHat' },
    { time: '6:00 PM', event: 'Celebration & Dancing', icon: 'Music' }
  ],
  questions: [
    { fieldId: 'dietary', label: 'Dietary Restrictions', type: 'text', required: false, options: [] },
    { fieldId: 'attendance', label: 'Will you attend?', type: 'boolean', required: true, options: [] }
  ],
  lodgingInfo: [
    { name: 'Holiday Inn', desc: 'Comfortable stay near venue', url: '#' },
    { name: 'Airbnb Options', desc: 'Various local accommodations', url: '#' }
  ],
  travelInfo: 'Venue Umwinzii is located in Harare, easily accessible by car or taxi.',
  mood: 'Romantic and joyful',
  religion: 'Traditional Christian ceremony',
  responses: [],
  aiLogs: []
};

// --- MONGODB SCHEMAS ---

const QuestionSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true, enum: ['text', 'select', 'boolean'] },
  options: [{ type: String }],
  required: { type: Boolean, default: false }
});

const SettingsSchema = new mongoose.Schema({
  rsvpOpen: { type: Boolean, default: true },
  maxGuests: { type: Number, default: 200 },
  adminPassword: { type: String, default: '1234' },
  elevenLabsAgentId: { type: String, default: '' },
  schedule: [{ time: String, event: String, icon: String }],
  questions: [QuestionSchema],
  lodgingInfo: [{ name: String, desc: String, url: String }],
  travelInfo: String,
  mood: String,
  religion: String,
});

const GuestSchema = new mongoose.Schema({
  name: String,
  phone: String,
  guests: Number,
  answers: Map,
  timestamp: { type: Number, default: Date.now },
  aiInteracted: { type: Boolean, default: false },
});

const LogSchema = new mongoose.Schema({
  guestPhone: String,
  summary: String,
  type: { type: String, enum: ['text', 'voice', 'whatsapp'] },
  timestamp: { type: Number, default: Date.now },
});

const Settings = mongoose.model('Settings', SettingsSchema);
const Guest = mongoose.model('Guest', GuestSchema);
const Log = mongoose.model('Log', LogSchema);

// --- DB CONNECTION ---
let dbConnected = false;
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    dbConnected = true;
    
    // Drop the entire collection to clear all bad data
    try {
      await Settings.collection.drop();
      console.log('Dropped Settings collection');
    } catch (err) {
      console.log('Collection does not exist, will create new one');
    }
  })
  .catch(err => {
    console.error('Mongo Connection Error:', err);
    console.log('Running without database - using in-memory storage');
  });

// --- API ENDPOINTS ---

// GET state - always return mock data for production stability
app.get('/api/state', async (req: Request, res: Response) => {
  try {
    return res.json(mockState);
  } catch (error) {
    console.error('Error in /api/state:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST state - handle updates (mock implementation)
app.post('/api/state', async (req: Request, res: Response) => {
  try {
    console.log('Received state update:', req.body);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/state:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/webhook/elevenlabs', async (req: Request, res: Response) => {
  const { tool_name, parameters } = req.body;
  const settings = await Settings.findOne();

  switch (tool_name) {
    case 'get_wedding_info':
      return res.json({
        schedule: settings?.schedule,
        mood: settings?.mood,
        location: "Venue Umwinzii, Harare"
      });

    case 'add_rsvp':
      const g = await Guest.create({
        name: parameters.name,
        phone: parameters.phone,
        guests: parameters.guests || 1,
        answers: parameters.answers || {},
        aiInteracted: true
      });
      await Log.create({
        guestPhone: parameters.phone,
        summary: `Voice RSVP for ${parameters.name} (${parameters.guests} ppl)`,
        type: 'voice'
      });
      return res.json({ status: "success" });

    default:
      return res.status(404).json({ error: "Unknown tool" });
  }
});

app.listen(PORT, () => console.log(`Server live on ${PORT}`));
