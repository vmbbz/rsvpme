
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

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

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Function to send RSVP notification email
async function sendRSVPNotificationEmail(guestData) {
  try {
    console.log('🔍 Starting email send process...');
    console.log('📧 Environment:', process.env.NODE_ENV);
    console.log('📧 Gmail user configured:', process.env.GMAIL_USER ? 'YES' : 'NO');
    console.log('📧 Gmail pass configured:', process.env.GMAIL_PASS ? 'YES' : 'NO');
    console.log('📧 RSVP email:', process.env.RSVP_EMAIL);
    
    const { name, answers } = guestData;
    
    const emailContent = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f5f2;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5d4037; font-style: italic; margin-bottom: 10px;">New RSVP Received</h1>
          <div style="width: 100px; height: 2px; background-color: #d7ccc8; margin: 0 auto;"></div>
        </div>
        
        <div style="background-color: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
          <h2 style="color: #5d4037; font-size: 24px; margin-bottom: 15px;">Guest Details</h2>
          
          <p style="margin: 10px 0; color: #3e2723;">
            <strong>Name:</strong> ${name}
          </p>
          
          ${answers && Object.keys(answers).length > 0 ? `
            <div style="margin-top: 20px;">
              <h3 style="color: #5d4037; font-size: 18px; margin-bottom: 10px;">Additional Information:</h3>
              ${Object.entries(answers).map(([key, value]) => `
                <p style="margin: 8px 0; color: #3e2723;">
                  <strong>${key}:</strong> ${value || 'Not specified'}
                </p>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #5d4037; font-style: italic; font-size: 14px;">
            Geraldine & Tapiwa's Wedding Celebration
          </p>
          <p style="color: #8d6e63; font-size: 12px; margin-top: 5px;">
            Received: ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.RSVP_EMAIL,
      subject: `New RSVP: ${name} - Geraldine & Tapiwa's Wedding`,
      html: emailContent
    };

    console.log('📧 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Verify transporter connection
    await transporter.verify();
    console.log('✅ Transporter verified successfully');

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', result);
    console.log(`📧 RSVP notification email sent for ${name}`);
  } catch (error) {
    console.error('❌ Failed to send RSVP email:', error);
    console.error('❌ Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
  }
}

let dbConnected = false;

// Optimized MongoDB connection for serverless environments
const connectDB = async (retryCount = 0) => {
  if (dbConnected) {
    return;
  }
  
  const maxRetries = 3;
  
  try {
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 10000, // Connection timeout
      heartbeatFrequencyMS: 10000, // Heartbeat frequency
      minPoolSize: 2 // Minimum number of connections in pool
    };
    
    await mongoose.connect(MONGO_URI, options);
    dbConnected = true;
    console.log('✅ Connected to MongoDB Atlas');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      dbConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
      dbConnected = false;
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      dbConnected = true;
    });
    
  } catch (error) {
    console.error(`❌ MongoDB connection failed (attempt ${retryCount + 1}/${maxRetries}):`, error);
    dbConnected = false;
    
    // Retry logic
    if (retryCount < maxRetries - 1) {
      console.log(`🔄 Retrying connection in 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectDB(retryCount + 1);
    } else {
      console.error('❌ Max retry attempts reached. Connection failed.');
      throw error;
    }
  }
};

// Initialize connection
connectDB().catch(console.error);

app.get('/api/state', async (req, res) => {
  try {
    // Ensure database connection
    if (!dbConnected) {
      await connectDB();
    }
    
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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Ensure database connection
    if (!dbConnected) {
      await connectDB();
    }
    
    res.json({
      status: 'ok',
      dbConnected: dbConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      dbConnected: dbConnected,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/state', async (req, res) => {
  try {
    const { newResponse, ...settingsData } = req.body;
    
    // Always try to send email first, regardless of DB connection
    if (newResponse) {
      console.log('📧 Attempting to send email notification...');
      await sendRSVPNotificationEmail(newResponse);
    }
    
    // Ensure database connection
    if (!dbConnected) {
      await connectDB();
    }
    
    if (dbConnected) {
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
      
      // Log new RSVP responses to database
      if (newResponse) {
        await Guest.create(newResponse);
        console.log(`📝 New RSVP from ${newResponse.name} - saved to database`);
      }
    } else {
      // Database not connected, but email was sent
      if (newResponse) {
        console.log(`⚠️ Database not connected, but email sent for ${newResponse.name}`);
      }
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server live on ${PORT}`));
