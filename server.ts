
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding';

app.use(cors() as any);
app.use(express.json() as any);

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

// FIX: Use explicit Request and Response types from express
app.get('/api/state', async (req: Request, res: Response) => {
  if (!dbConnected) {
    // Return mock data when DB is not connected
    return res.json({
      rsvpOpen: true,
      maxGuests: 200,
      adminPassword: '1234',
      elevenLabsAgentId: '',
      schedule: [
        { time: '12:00', event: 'Marriage Ceremony', icon: 'heart' },
        { time: '14:00', event: 'Cocktails & Bites', icon: 'champagne-glasses' },
        { time: '15:30', event: 'Wedding Reception', icon: 'music' },
        { time: '23:30', event: 'Vote of Thanks', icon: 'heart-handshake' }
      ],
      questions: [
        { fieldId: '1', label: 'Dietary Allergies', type: 'text', required: false },
        { fieldId: '2', label: 'Preferred Drink', type: 'select', options: ['Red Wine', 'White Wine', 'Beer', 'Spirit', 'Soft Drink'], required: true },
        { fieldId: '3', label: 'Local Accommodation Help?', type: 'boolean', required: true }
      ],
      lodgingInfo: [
        { name: "Cresta Jameson", desc: "Heart of Harare vibrant lifestyle.", url: "#" },
        { name: "Cresta Lodge", desc: "4KM from CBD, quiet and scenic.", url: "#" },
        { name: "Airbnb Options", desc: "Borrowdale & Helensvale areas are closest.", url: "#" }
      ],
      travelInfo: "Arrival: Robert Gabriel Mugabe International Airport (HRE). Transit: We suggest In-Drive app or pre-booked taxis.",
      mood: "Classic Elegance with Modern Zimbabwean Roots",
      religion: "Christian Ceremony",
      responses: [],
      aiLogs: []
    });
  }

  let settings = await Settings.findOne();
  if (!settings) {
    try {
      settings = await Settings.create({
        schedule: [
          { time: '12:00', event: 'Marriage Ceremony', icon: 'heart' },
          { time: '14:00', event: 'Cocktails & Bites', icon: 'chef-hat' },
          { time: '15:30', event: 'Wedding Reception', icon: 'music' },
          { time: '23:30', event: 'Vote of Thanks', icon: 'heart-handshake' }
        ],
        // FIX: Renamed 'id' to 'fieldId'
        questions: [
          { fieldId: '1', label: 'Dietary Allergies', type: 'text', required: false },
          { fieldId: '2', label: 'Preferred Drink', type: 'select', options: ['Red Wine', 'White Wine', 'Beer', 'Spirit', 'Soft Drink'], required: true },
          { fieldId: '3', label: 'Local Accommodation Help?', type: 'boolean', required: true }
        ],
        lodgingInfo: [
          { name: "Cresta Jameson", desc: "Heart of Harare vibrant lifestyle.", url: "#" },
          { name: "Cresta Lodge", desc: "4KM from CBD, quiet and scenic.", url: "#" },
          { name: "Airbnb Options", desc: "Borrowdale & Helensvale areas are closest.", url: "#" }
        ],
        travelInfo: "Arrival: Robert Gabriel Mugabe International Airport (HRE). Transit: We suggest In-Drive app or pre-booked taxis.",
        mood: "Classic Elegance with Modern Zimbabwean Roots",
        religion: "Christian Ceremony"
      });
    } catch (error) {
      console.error('Error creating settings:', error);
      // Fallback to mock data if DB creation fails
      return res.json({
        rsvpOpen: true,
        maxGuests: 200,
        adminPassword: '1234',
        elevenLabsAgentId: '',
        schedule: [
          { time: '12:00', event: 'Marriage Ceremony', icon: 'heart' },
          { time: '14:00', event: 'Cocktails & Bites', icon: 'chef-hat' },
          { time: '15:30', event: 'Wedding Reception', icon: 'music' },
          { time: '23:30', event: 'Vote of Thanks', icon: 'heart-handshake' }
        ],
        questions: [
          { fieldId: '1', label: 'Dietary Allergies', type: 'text', required: false },
          { fieldId: '2', label: 'Preferred Drink', type: 'select', options: ['Red Wine', 'White Wine', 'Beer', 'Spirit', 'Soft Drink'], required: true },
          { fieldId: '3', label: 'Local Accommodation Help?', type: 'boolean', required: true }
        ],
        lodgingInfo: [
          { name: "Cresta Jameson", desc: "Heart of Harare vibrant lifestyle.", url: "#" },
          { name: "Cresta Lodge", desc: "4KM from CBD, quiet and scenic.", url: "#" },
          { name: "Airbnb Options", desc: "Borrowdale & Helensvale areas are closest.", url: "#" }
        ],
        travelInfo: "Arrival: Robert Gabriel Mugabe International Airport (HRE). Transit: We suggest In-Drive app or pre-booked taxis.",
        mood: "Classic Elegance with Modern Zimbabwean Roots",
        religion: "Christian Ceremony",
        responses: [],
        aiLogs: []
      });
    }
  }
  const responses = await Guest.find().sort({ timestamp: -1 });
  const aiLogs = await Log.find().sort({ timestamp: -1 }).limit(50);
  
  res.json({ ...settings.toObject(), responses, aiLogs });
});

app.post('/api/state', async (req: Request, res: Response) => {
  const { responses, aiLogs, newResponse, ...settingsData } = req.body;
  
  if (Object.keys(settingsData).length > 0) {
    try {
      const existing = await Settings.findOne();
      if (existing) {
        // Merge with existing data to preserve schema
        await Settings.findByIdAndUpdate(existing._id, { $set: settingsData });
      } else {
        // Create new document with proper schema
        await Settings.create(settingsData);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  if (newResponse) {
    await Guest.create(newResponse);
  }

  res.json({ success: true });
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
