
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding';

app.use(cors());
// Fixed: Explicitly provide a path to resolve the "NextHandleFunction not assignable to PathParams" type error
// This ensures the middleware is correctly matched to the RequestHandler parameter in Express overloads.
app.use('/', express.json());

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
  schedule: [{ time: String, event: String, icon: String, detail: String }],
  questions: [QuestionSchema],
  lodgingInfo: [{ name: String, desc: String, url: String }],
  travelInfo: String,
  mood: String,
  religion: String,
});

const GuestSchema = new mongoose.Schema({
  name: String,
  attendingWith: String,
  guests: Number,
  answers: Map,
  timestamp: { type: Number, default: Date.now },
  aiInteracted: { type: Boolean, default: false },
});

const LogSchema = new mongoose.Schema({
  guestName: String,
  summary: String,
  type: { type: String, enum: ['text', 'voice', 'whatsapp'] },
  timestamp: { type: Number, default: Date.now },
});

const AdminLogSchema = new mongoose.Schema({
  action: String,
  field: String, 
  oldValue: String,
  newValue: String,
  timestamp: { type: Number, default: Date.now },
  userAgent: String,
  ip: String
});

const Settings = mongoose.model('Settings', SettingsSchema);
const Guest = mongoose.model('Guest', GuestSchema);
const Log = mongoose.model('Log', LogSchema);
const AdminLog = mongoose.model('AdminLog', AdminLogSchema);

let dbConnected = false;
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    dbConnected = true;
  })
  .catch(err => {
    console.error('Mongo Connection Error:', err);
  });

app.get('/api/state', async (req, res) => {
  try {
    if (dbConnected) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({
          rsvpOpen: true,
          maxGuests: 250,
          adminPassword: '1234',
          elevenLabsAgentId: '',
          schedule: [
            { time: '12:00 PM - 1:00 PM', event: 'Arrival of Guests', icon: 'heart', detail: 'Welcome to the celebration! Guests arrive and are greeted with refreshments as we gather for this special day.' },
            { time: '1:00 PM - 3:00 PM', event: 'Wedding Ceremony', icon: 'heart-handshake', detail: 'The sacred exchange of vows and rings in the presence of God and loved ones. The moment we become one.' },
            { time: '3:00 PM - 4:00 PM', event: 'Cocktail Hour', icon: 'chef-hat', detail: 'Enjoy cocktails and hors d\'oeuvres as we capture beautiful memories and celebrate the newlyweds.' },
            { time: '4:00 PM onwards', event: 'Wedding Reception', icon: 'music', detail: 'A grand celebration with dining, dancing, heartfelt toasts, and the beginning of our forever together.' }
          ],
          questions: [
            { fieldId: '1', label: 'Dietary Requirements', type: 'text', required: false },
            { fieldId: '2', label: 'Will you be attending?', type: 'boolean', required: true }
          ],
          lodgingInfo: [
            { name: "Meikles Hotel", desc: "A historic luxury choice in Harare central.", url: "#" },
            { name: "Cresta Lodge", desc: "Tranquil setting, perfect for wedding guests.", url: "#" }
          ],
          travelInfo: "Arrival: Robert Gabriel Mugabe International Airport (HRE). Venue Umwinzii is located in the northern suburbs of Harare. We recommend using In-Drive or pre-arranged shuttles.",
          mood: "Black Tie / Formal • Palette: Lilac, Lavender, and Gold",
          religion: "Christian Tradition"
        });
      }
      
      const guests = await Guest.find().sort({ timestamp: -1 });
      const logs = await Log.find().sort({ timestamp: -1 }).limit(50);
      const adminLogs = await AdminLog.find().sort({ timestamp: -1 }).limit(100);
      
      return res.json({
        ...settings.toObject(),
        responses: guests,
        aiLogs: logs,
        adminLogs: adminLogs
      });
    } else {
      // Basic fallback mock if DB fails
      return res.json({ rsvpOpen: true, schedule: [], questions: [], lodgingInfo: [], travelInfo: "", mood: "", responses: [], aiLogs: [] });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/state', async (req, res) => {
  try {
    if (dbConnected) {
      const { newResponse, ...settingsData } = req.body;
      
      // Log admin settings changes
      if (Object.keys(settingsData).length > 0) {
        // Get current settings for comparison
        const currentSettings = await Settings.findOne() || {};
        
        for (const [field, newValue] of Object.entries(settingsData)) {
          const oldValue = currentSettings[field];
          
          // Only log if value actually changed
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            await AdminLog.create({
              action: 'SETTINGS_UPDATE',
              field: field,
              oldValue: JSON.stringify(oldValue),
              newValue: JSON.stringify(newValue),
              userAgent: req.get('User-Agent'),
              ip: req.ip || req.connection.remoteAddress
            });
            
            console.log(`🔧 Admin updated ${field}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
          }
        }
        
        await Settings.findOneAndUpdate({}, { $set: settingsData }, { upsert: true });
      }
      
      // Log new RSVP responses
      if (newResponse) {
        await Guest.create(newResponse);
        console.log(`📝 New RSVP from ${newResponse.name} (attending with: ${newResponse.attendingWith || 'alone'})`);
      }
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server live on ${PORT}`));
