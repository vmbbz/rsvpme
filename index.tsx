
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Heart, Calendar, MapPin, Clock, Plane, MessageCircle, ChevronRight, 
  Settings, Users, FileText, Plus, Trash2, CheckCircle, X, Phone, Send, 
  Loader2, Lock, Menu, MoreVertical, Mic, MessageSquare, ShieldCheck, Zap, Coffee,
  Info, Database, Globe, ArrowRight, Sparkles, Instagram, Music, HeartHandshake, Ribbon, ChefHat, Ticket
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { Conversation } from "@elevenlabs/client";

/** 
 * TYPES 
 */
type AppState = {
  rsvpOpen: boolean;
  maxGuests: number;
  adminPassword: string;
  elevenLabsAgentId: string;
  schedule: { time: string; event: string; icon: string; detail?: string }[];
  questions: { fieldId: string; label: string; type: 'text' | 'select' | 'boolean'; options?: string[]; required: boolean }[];
  responses: any[];
  aiLogs: any[];
  lodgingInfo: { name: string; desc: string; url: string }[];
  travelInfo: string;
  mood: string;
  religion: string;
};

/**
 * API SERVICE
 */
const API = {
  baseUrl: 'http://localhost:3001/api',
  async getState(): Promise<AppState> {
    const res = await fetch(`${this.baseUrl}/state`);
    return res.json();
  },
  async updateState(data: any) {
    await fetch(`${this.baseUrl}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
};

const HERO_IMAGES = [
  "/images/hero-1.jpeg",
  "/images/hero-2.jpeg",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200",
];

// --- COMPONENTS ---

const ElevenLabsVoice = ({ agentId }: { agentId: string }) => {
  const [active, setActive] = useState(false);
  const convRef = useRef<any>(null);

  const toggleCall = async () => {
    if (active) {
      await convRef.current?.endSession();
      setActive(false);
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      convRef.current = await Conversation.startSession({
        agentId,
        onConnect: () => setActive(true),
        onDisconnect: () => setActive(false),
        onError: () => alert("Voice Agent offline.")
      } as any);
    } catch (e) { alert("Mic access needed."); }
  };

  return (
    <button onClick={toggleCall} className="flex flex-col items-center gap-4 group">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${active ? 'bg-red-500 text-white animate-pulse' : 'bg-stone-50 text-stone-900 group-hover:bg-stone-900 group-hover:text-white'}`}>
        {active ? <X size={32} /> : <Mic size={32} />}
      </div>
      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{active ? 'End Call' : 'Call AI'}</span>
    </button>
  );
};

const AIChatModal = ({ onClose, state }: { onClose: () => void, state: AppState }) => {
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! I'm Geraldine & Bright's Wedding Assistant. How can I help?" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const txt = input; setInput('');
    setMessages(prev => [...prev, { role: 'user', text: txt }]);
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: ${JSON.stringify(state)}. User Query: ${txt}`,
        config: { systemInstruction: "You are the AI Wedding Booker. Be helpful, elegant, and provide travel/schedule info." }
      });
      setMessages(prev => [...prev, { role: 'ai', text: res.text || "Thinking..." }]);
    } catch (e) { setMessages(prev => [...prev, { role: 'ai', text: "Connection slow. Try again!" }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center">
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-xl h-[85vh] sm:h-[700px] rounded-t-[3rem] sm:rounded-[3rem] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-serif italic">AI Concierge</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-500 mt-1">● Online Support</p>
          </div>
          <button onClick={onClose} className="p-2"><X size={28} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-stone-50/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-5 rounded-[2rem] max-w-[85%] text-sm leading-relaxed ${m.role === 'user' ? 'bg-stone-900 text-white rounded-tr-none shadow-lg' : 'bg-white border border-stone-100 text-stone-800 rounded-tl-none shadow-sm'}`}>{m.text}</div>
            </div>
          ))}
          {loading && <Loader2 className="animate-spin mx-auto text-stone-300" />}
        </div>
        <div className="p-8 border-t bg-white flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-stone-100 border-none rounded-full px-8 py-5 text-sm focus:ring-2 focus:ring-stone-900" placeholder="Ask about travel, schedule, or RSVPs..." />
          <button onClick={handleSend} className="w-14 h-14 bg-stone-900 text-white rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg"><Send size={20} /></button>
        </div>
      </motion.div>
    </div>
  );
};

const InteractiveTimeline = ({ schedule }: { schedule: AppState['schedule'] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-16 py-20">
      <div className="flex items-center gap-6 mb-16 px-4">
        <Clock className="text-stone-300" size={32} />
        <div>
          <h3 className="text-4xl md:text-5xl font-serif italic text-stone-900">The Day's Flow</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mt-2">A Timeless Chronicle</p>
        </div>
      </div>
      
      <div className="relative px-4">
        <div className="absolute left-[24px] top-0 bottom-0 w-px bg-stone-100" />
        
        <div className="space-y-24">
          {schedule.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative pl-16 group cursor-pointer"
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => setActiveIndex(idx)}
            >
              <div className={`absolute left-0 top-1 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 z-10 border-4 border-white ${activeIndex === idx ? 'bg-stone-900 text-white scale-125 shadow-2xl' : 'bg-stone-50 text-stone-300'}`}>
                {item.icon === 'heart' && <Heart size={16} />}
                {item.icon === 'chef-hat' && <ChefHat size={16} />}
                {item.icon === 'music' && <Music size={16} />}
                {item.icon === 'heart-handshake' && <HeartHandshake size={16} />}
                {!['heart', 'chef-hat', 'music', 'heart-handshake'].includes(item.icon) && <Ribbon size={16} />}
              </div>

              <div className="flex flex-col gap-2">
                <span className={`text-[11px] font-bold tracking-[0.3em] uppercase transition-colors duration-500 ${activeIndex === idx ? 'text-stone-900' : 'text-stone-300'}`}>
                  {item.time}
                </span>
                <h4 className={`text-3xl md:text-4xl font-serif italic transition-all duration-500 ${activeIndex === idx ? 'text-stone-900 translate-x-2' : 'text-stone-400 hover:text-stone-600'}`}>
                  {item.event}
                </h4>
                <AnimatePresence>
                  {activeIndex === idx && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-stone-500 text-sm font-light leading-relaxed pt-4 max-w-md italic">
                        {item.detail || "Experience a moment of pure celebration as we gather to witness the beautiful union of Geraldine and Bright in the heart of Harare."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HomeView = ({ state, refresh }: { state: AppState, refresh: () => void }) => {
  const [showRSVP, setShowRSVP] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [journeyImg, setJourneyImg] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 200]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentImg(p => (p + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setJourneyImg(p => (p + 1) % 3), 7000);
    return () => clearInterval(timer);
  }, []);

  // Auto-play wedding music
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('https://www.bensound.com/bensound-music/bensound-romantic.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    
    // Set initial state to false - don't autoplay
    setMusicPlaying(false);
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.pause();
        setMusicPlaying(false);
      } else {
        audioRef.current.play();
        setMusicPlaying(true);
      }
    }
  };

  const getJourneyImage = (index: number) => {
    // Try .jpeg first since that's what you have
    return `/images/hero-${index + 1}.jpeg`;
  };

  const handleRSVPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const answers: Record<string, string> = {};
    state.questions.forEach(q => answers[q.label] = fd.get(q.fieldId) as string);
    
    await API.updateState({ 
      newResponse: {
        name: fd.get('name'),
        phone: fd.get('phone'),
        guests: parseInt(fd.get('count') as string || '1'),
        answers
      }
    });
    setShowRSVP(false);
    refresh();
    alert("Response received! We are so excited to see you.");
  };

  return (
    <div className="bg-stone-50 min-h-screen font-sans text-stone-900 pb-40 overflow-x-hidden selection:bg-stone-900 selection:text-white">
      {/* Editorial Hero */}
      <section className="relative h-[110vh] w-full overflow-hidden bg-stone-950 flex flex-col items-center justify-center">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImg} 
              src={HERO_IMAGES[currentImg]} 
              initial={{ opacity: 0, scale: 1.15 }} 
              animate={{ opacity: 0.35, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              transition={{ duration: 2.5 }} 
              className="absolute inset-0 w-full h-full object-cover grayscale" 
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/20 via-transparent to-stone-950" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10 text-center px-6"
        >
          <p className="text-white/40 uppercase tracking-[0.6em] text-[10px] md:text-xs font-bold mb-10">You are cordially invited</p>
          <h1 className="text-8xl md:text-[14rem] font-serif italic leading-[0.7] tracking-tighter select-none font-black relative">
            <svg 
              className="w-full h-[120px] md:h-[180px]" 
              viewBox="0 0 600 150" 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="floral" patternUnits="userSpaceOnUse" width="800" height="200">
                  <image 
                    href="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200" 
                    x="0" 
                    y="0" 
                    width="800" 
                    height="200" 
                    preserveAspectRatio="xMidYMid slice"
                  />
                </pattern>
              </defs>
              <text 
                x="300" 
                y="75" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                className="font-black"
                fontSize="160"
                fontFamily="Playfair Display, Georgia, serif"
                fill="url(#floral)"
                stroke="white"
                strokeWidth="1"
              >
                I DO
              </text>
            </svg>
          </h1>
          <div className="h-px w-24 bg-white/20 mx-auto my-12" />
          <h2 className="text-white text-3xl md:text-5xl font-serif italic mt-6">Geraldine <span className="text-yellow-300">&</span> Bright</h2>
          <p className="text-white/60 text-[11px] mt-6 tracking-[0.4em] font-bold uppercase">DECEMBER 17, 2026 • HARARE</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-12 flex flex-col items-center gap-4 text-white/30"
        >
          <button 
            onClick={toggleMusic}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
          >
            {musicPlaying ? <Music size={20} /> : <Music size={20} className="opacity-50" />}
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Music</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-4 text-white/30"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* Main Container */}
      <div className="max-w-xl md:max-w-2xl mx-auto px-6 space-y-48">
        
        {/* Intro Reveal */}
        <section className="relative z-10 -mt-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1.5 }}
            className="aspect-[3/4] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative border-[12px] border-white group bg-white"
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={journeyImg} 
                src={getJourneyImage(journeyImg)} 
                initial={{ opacity: 0, scale: 1.1 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 1.5 }} 
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[3s] scale-105 group-hover:scale-100" 
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-end p-16 text-center">
              <span className="text-white/40 text-[10px] uppercase tracking-[0.5em] font-bold mb-4">The Journey</span>
              <h2 className="text-white text-4xl md:text-5xl font-serif italic">A Symphony of Love</h2>
            </div>
          </motion.div>
        </section>

        {/* Interactive Timeline */}
        <section>
          <InteractiveTimeline schedule={state.schedule} />
        </section>

        {/* Location & Map */}
        <section>
          <div className="flex items-center gap-6 mb-16">
            <MapPin className="text-stone-300" size={32} />
            <div>
              <h3 className="text-4xl font-serif italic text-stone-900">Venue Umwinzii</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mt-2">The Emerald Oasis</p>
            </div>
          </div>
          <div className="aspect-video rounded-[3rem] overflow-hidden shadow-lux border-8 border-white grayscale hover:grayscale-0 transition-all duration-1000">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15197.808249852234!2d31.14488585!3d-17.72337775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1931a5758364843b%3A0x6b47c0b484594c35!2sVenue%20Umwinzii!5e0!3m2!1sen!2szw!4v1715600000000!5m2!1sen!2szw" className="w-full h-full border-0" />
          </div>
        </section>

        {/* Lodging */}
        <section className="space-y-16">
          <div className="flex items-center gap-6">
            <Heart className="text-stone-300" size={32} />
            <div>
              <h3 className="text-4xl font-serif italic">Accommodation</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mt-2">Where to Rest</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {state.lodgingInfo.map((l, i) => (
              <motion.div 
                key={i} 
                whileHover={{ x: 10 }}
                className="bg-white p-10 rounded-[3rem] shadow-sm border border-stone-100 flex justify-between items-center group transition-all"
              >
                <div>
                  <h4 className="text-2xl font-serif italic text-stone-900">{l.name}</h4>
                  <p className="text-sm text-stone-400 mt-2 italic">{l.desc}</p>
                </div>
                <button className="w-14 h-14 bg-stone-50 rounded-full flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-all shadow-sm"><ChevronRight size={24}/></button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Aesthetic Block - Restored Wording */}
        <section className="bg-stone-950 text-white p-16 md:p-24 rounded-[5rem] space-y-16 shadow-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 text-white/5 font-serif text-[15rem] leading-none select-none italic translate-x-12 -translate-y-12">B&G</div>
          <div className="space-y-6 relative z-10">
            <Plane className="text-stone-800" size={60} />
            <h3 className="text-5xl font-serif italic leading-tight">Travel & Precision Mood</h3>
            <p className="text-stone-400 text-lg font-light leading-relaxed max-w-md">{state.travelInfo}</p>
          </div>
          <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/10 relative z-10">
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em]">Visual Code</p>
              <p className="text-xl font-serif italic text-stone-200">{state.mood}</p>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em]">Heritage</p>
              <p className="text-xl font-serif italic text-stone-200">{state.religion}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Concierge Hub - Restored Wording */}
      <footer className="mt-80 border-t border-stone-200 bg-white py-48 text-center space-y-24">
        <div className="space-y-6">
          <h3 className="text-6xl font-serif italic text-stone-900">The Concierge</h3>
          <p className="text-stone-400 font-serif text-2xl italic opacity-60">We are here to assist with every detail.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 max-w-4xl mx-auto px-6">
          <button onClick={() => setShowChat(true)} className="flex flex-col items-center gap-4 group">
            <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center text-stone-900 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-xl">
              <MessageSquare size={32} />
            </div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">AI Chat</span>
          </button>
          
          <ElevenLabsVoice agentId={state.elevenLabsAgentId} />

          <button className="flex flex-col items-center gap-4 group">
            <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center text-stone-900 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-xl">
              <Phone size={32} />
            </div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">The Couple</span>
          </button>
        </div>
      </footer>

      {/* Persistent RSVP Signature Bar */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-[150] px-6">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRSVP(true)} 
          disabled={!state.rsvpOpen}
          className={`w-full max-w-xs py-6 px-8 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] font-bold tracking-[0.4em] uppercase text-[10px] flex items-center justify-center gap-4 transition-all border border-white/20 ${state.rsvpOpen ? 'bg-stone-900 text-white' : 'bg-stone-300 text-stone-500 cursor-not-allowed'}`}
        >
          {state.rsvpOpen ? (
            <>
              <Zap size={16} fill="currentColor" /> 
              RSVP
            </>
          ) : 'RSVPs Paused'}
        </motion.button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showChat && <AIChatModal state={state} onClose={() => setShowChat(false)} />}
        {showRSVP && (
          <div className="fixed inset-0 z-[300] bg-stone-950/95 backdrop-blur-3xl flex items-center justify-center p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-8 md:p-12 shadow-2xl">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white pb-4">
                <div>
                  <h3 className="text-4xl font-serif italic text-stone-900 flex items-center gap-3">
                    <Ticket className="text-yellow-500" size={28} />
                    Registry
                  </h3>
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Confirm Attendance</p>
                </div>
                <button onClick={() => setShowRSVP(false)} className="w-12 h-12 bg-stone-50 rounded-full text-stone-400 flex items-center justify-center hover:text-stone-900 hover:bg-red-50 transition-all">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleRSVPSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400 ml-6 flex items-center gap-2">
                      <Users className="text-yellow-500" size={16} />
                      Full Name
                    </label>
                    <input name="name" required className="w-full bg-stone-50 border border-stone-200 rounded-full p-4 text-lg focus:border-yellow-500 transition-all" placeholder="Full name" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400 ml-6 flex items-center gap-2">
                      <Phone className="text-yellow-500" size={16} />
                      Phone
                    </label>
                    <input name="phone" required className="w-full bg-stone-50 border border-stone-200 rounded-full p-4 text-lg focus:border-yellow-500 transition-all" placeholder="+263..." />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400 ml-6 flex items-center gap-2">
                    <Users className="text-yellow-500" size={16} />
                    Party Count
                  </label>
                  <input name="count" type="number" defaultValue="1" min="1" className="w-full bg-stone-50 border border-stone-200 rounded-full p-4 text-lg focus:border-yellow-500 transition-all" />
                </div>
                {state.questions.map(q => (
                  <div key={q.fieldId} className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400 ml-6 flex items-center gap-2">
                      <FileText className="text-yellow-500" size={16} />
                      {q.label}
                    </label>
                    {q.type === 'select' ? (
                      <select name={q.fieldId} className="w-full bg-stone-50 border border-stone-200 rounded-full p-4 text-lg appearance-none focus:border-yellow-500 transition-all">
                        {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : q.type === 'boolean' ? (
                      <div className="flex gap-6">
                        {['Yes', 'No'].map(v => (
                          <label key={v} className="flex-1 p-4 bg-stone-50 border border-stone-200 rounded-[2.5rem] text-center cursor-pointer has-[:checked]:bg-stone-900 has-[:checked]:text-white transition-all font-bold tracking-widest hover:border-yellow-500">
                            <input type="radio" name={q.fieldId} value={v} className="hidden" defaultChecked={v==='Yes'} /> {v}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input name={q.fieldId} className="w-full bg-stone-50 border border-stone-200 rounded-full p-4 text-lg focus:border-yellow-500 transition-all" placeholder="..." />
                    )}
                  </div>
                ))}
                <div className="pt-8">
                  <button type="submit" className="w-full py-6 px-12 bg-stone-900 text-white rounded-full font-bold shadow-2xl text-base uppercase tracking-[0.4em] hover:scale-105 transition-all flex items-center justify-center gap-3">
                    <Ticket size={18} />
                    Confirm Registry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminView = ({ state, refresh }: { state: AppState, refresh: () => void }) => {
  const [authed, setAuthed] = useState(false);
  const [panel, setPanel] = useState<'overview'|'guests'|'logs'|'settings'|'builder'>('overview');
  const [pass, setPass] = useState('');

  if (!authed) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-8">
        <div className="bg-white p-14 rounded-[4.5rem] w-full max-w-sm text-center shadow-3xl">
          <ShieldCheck className="mx-auto mb-10 text-stone-100" size={80} />
          <h2 className="text-3xl font-serif italic mb-2">Master Key</h2>
          <p className="text-stone-400 text-sm mb-12 italic">Authenticating the Portal</p>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==='Enter' && (pass===state.adminPassword ? setAuthed(true) : alert('Wrong Key'))} className="w-full bg-stone-50 p-7 rounded-[2.5rem] text-center mb-8 border-none focus:ring-2 focus:ring-stone-900" placeholder="••••" />
          <button onClick={() => pass===state.adminPassword ? setAuthed(true) : alert('Wrong Key')} className="w-full py-7 bg-stone-900 text-white rounded-full font-bold shadow-lg">Enter OS</button>
        </div>
      </div>
    );
  }

  const totals = { guests: state.responses.reduce((a,b) => a+b.guests, 0) };

  const addQuestion = async () => {
    const q = { fieldId: Date.now().toString(), label: 'New Requirement', type: 'text', required: false };
    await API.updateState({ questions: [...state.questions, q] });
    refresh();
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col md:flex-row">
      <nav className="w-full md:w-80 bg-stone-900 text-white p-12 flex flex-col">
        <div className="flex items-center gap-3 mb-24"><Zap size={28} /><h1 className="text-2xl font-serif italic">Registry OS</h1></div>
        <div className="space-y-4 flex-1">
          {[
            { id: 'overview', icon: Coffee, label: 'Stats' },
            { id: 'guests', icon: Users, label: 'Guest Ledger' },
            { id: 'builder', icon: FileText, label: 'Form Builder' },
            { id: 'logs', icon: ShieldCheck, label: 'AI Activity' },
            { id: 'settings', icon: Settings, label: 'Core Setup' }
          ].map(p => (
            <button key={p.id} onClick={() => setPanel(p.id as any)} className={`w-full text-left p-6 rounded-[2rem] flex items-center gap-4 transition-all ${panel === p.id ? 'bg-white text-stone-900 font-bold shadow-xl' : 'text-stone-500 hover:text-white'}`}>
              <p.icon size={20} /> {p.label}
            </button>
          ))}
        </div>
        <div className="mt-20 p-8 bg-white/5 rounded-[3rem] border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4">Capacity</p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-white" style={{ width: `${Math.min(100, (totals.guests/state.maxGuests)*100)}%` }} /></div>
          <p className="text-sm mt-3 font-medium">{totals.guests} / {state.maxGuests}</p>
        </div>
      </nav>

      <main className="flex-1 p-12 md:p-24 overflow-y-auto">
        <header className="flex justify-between items-center mb-20">
          <h2 className="text-6xl font-serif italic capitalize">{panel}</h2>
          <button onClick={() => API.updateState({ rsvpOpen: !state.rsvpOpen }).then(refresh)} className={`px-12 py-5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm ${state.rsvpOpen ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            Status: {state.rsvpOpen ? 'Open' : 'Closed'}
          </button>
        </header>

        {panel === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-stone-100"><p className="text-[11px] font-bold uppercase text-stone-400 mb-2">Confirmed</p><p className="text-8xl font-serif italic">{totals.guests}</p></div>
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-stone-100"><p className="text-[11px] font-bold uppercase text-stone-400 mb-2">AI Interacted</p><p className="text-8xl font-serif italic text-blue-500">{state.responses.filter(r=>r.aiInteracted).length}</p></div>
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-stone-100"><p className="text-[11px] font-bold uppercase text-stone-400 mb-2">Alerts</p><p className="text-8xl font-serif italic text-red-400">{state.responses.filter(r=>r.answers && Object.values(r.answers).some(v=>!!v)).length}</p></div>
          </div>
        )}

        {panel === 'guests' && (
          <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-stone-100">
            <table className="w-full text-left">
              <thead><tr className="bg-stone-50 text-[10px] uppercase font-bold text-stone-400 tracking-widest"><th className="p-10">Guest</th><th className="p-10">Party</th><th className="p-10">Details</th></tr></thead>
              <tbody>
                {state.responses.map((r, i) => (
                  <tr key={i} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="p-10"><p className="font-bold text-xl">{r.name}</p><p className="text-stone-400 text-sm">{r.phone}</p></td>
                    <td className="p-10"><span className="px-6 py-2 bg-stone-100 rounded-full font-bold">{r.guests}</span></td>
                    <td className="p-10">
                      <div className="flex gap-2 flex-wrap">
                        {r.aiInteracted && <span className="bg-blue-50 text-blue-500 text-[9px] font-bold px-3 py-1 rounded-full uppercase">Voice Assisted</span>}
                        {r.answers && Object.entries(r.answers).map(([k,v]) => v && (
                          <span key={k} className="bg-stone-50 border px-3 py-1 rounded-full text-[9px] text-stone-500 uppercase font-bold">{v as string}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {panel === 'builder' && (
          <div className="max-w-2xl space-y-8">
            <button onClick={addQuestion} className="w-full py-6 bg-stone-900 text-white rounded-[2rem] font-bold flex items-center justify-center gap-3"><Plus size={20}/> Add Registry Field</button>
            <div className="space-y-4">
              {state.questions.map((q, i) => (
                <div key={q.fieldId} className="p-8 bg-white rounded-[3rem] shadow-sm border border-stone-100 flex items-center justify-between group">
                  <div className="flex-1 mr-6">
                    <input value={q.label} onChange={async (e) => {
                      const nq = [...state.questions]; nq[i].label = e.target.value; await API.updateState({questions: nq}); refresh();
                    }} className="w-full bg-stone-50 p-4 rounded-2xl font-bold border-none" />
                  </div>
                  <div className="flex gap-4">
                    <select value={q.type} onChange={async (e) => {
                      const nq = [...state.questions]; nq[i].type = e.target.value as any; await API.updateState({questions: nq}); refresh();
                    }} className="bg-stone-50 p-4 rounded-2xl text-xs uppercase font-bold border-none">
                      <option value="text">Text</option>
                      <option value="select">Select</option>
                      <option value="boolean">Boolean</option>
                    </select>
                    <button onClick={async () => {
                      const nq = state.questions.filter(x=>x.fieldId!==q.fieldId); await API.updateState({questions: nq}); refresh();
                    }} className="w-12 h-12 bg-red-50 text-red-400 rounded-full flex items-center justify-center"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {panel === 'logs' && (
          <div className="space-y-6">
            {state.aiLogs.map((log, i) => (
              <div key={i} className="p-8 bg-white rounded-[3rem] border border-stone-100 flex gap-8 items-center shadow-sm">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${log.type==='voice' ? 'bg-blue-50 text-blue-500' : 'bg-stone-50 text-stone-400'}`}><Mic size={24}/></div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{log.guestPhone}</p>
                  <p className="text-stone-500 text-sm mt-1">{log.summary}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-stone-300 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

        {panel === 'settings' && (
          <div className="max-w-2xl bg-white p-14 rounded-[4.5rem] shadow-2xl space-y-12">
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase text-stone-400 ml-6">ElevenLabs Agent ID</label>
              <input value={state.elevenLabsAgentId} onChange={e => API.updateState({elevenLabsAgentId: e.target.value}).then(refresh)} className="w-full bg-stone-50 p-7 rounded-[2.5rem] border-none" placeholder="agent-id-xxx" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase text-stone-400 ml-6">Max Capacity</label>
                <input type="number" value={state.maxGuests} onChange={e => API.updateState({maxGuests: parseInt(e.target.value)}).then(refresh)} className="w-full bg-stone-50 p-7 rounded-[2.5rem] border-none" />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase text-stone-400 ml-6">Dashboard Key</label>
                <input value={state.adminPassword} onChange={e => API.updateState({adminPassword: e.target.value}).then(refresh)} className="w-full bg-stone-50 p-7 rounded-[2.5rem] border-none" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase text-stone-400 ml-6">Precision Mood</label>
              <textarea value={state.mood} onChange={e => API.updateState({mood: e.target.value}).then(refresh)} className="w-full bg-stone-50 p-7 rounded-[2.5rem] border-none h-32" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App = () => {
  const [state, setState] = useState<AppState|null>(null);
  const [path, setPath] = useState(window.location.pathname);

  const refresh = async () => {
    try { const data = await API.getState(); setState(data); }
    catch(e) { console.error("Refresh failed", e); }
  };

  useEffect(() => {
    refresh();
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  if (!state) return (
    <div className="h-screen bg-stone-50 flex items-center justify-center font-serif text-3xl italic animate-pulse">
      <div className="flex flex-col items-center gap-10">
        <Sparkles size={40} className="text-stone-300" />
        <span className="text-stone-400 tracking-widest text-[11px] font-bold uppercase">Preparing the Celebration...</span>
      </div>
    </div>
  );

  return path === '/admin' ? <AdminView state={state} refresh={refresh} /> : <HomeView state={state} refresh={refresh} />;
};

createRoot(document.getElementById('root')!).render(<App />);
