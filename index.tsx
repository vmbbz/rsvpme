import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Heart, Calendar, MapPin, Clock, Plane, MessageCircle, ChevronRight, 
  Settings, Users, FileText, Plus, Trash2, CheckCircle, X, Phone, Send, 
  Loader2, Lock, Menu, MoreVertical, Mic, MessageSquare, ShieldCheck, Zap, Coffee,
  Info, Database, Globe, ArrowRight, Sparkles, Instagram, Music, HeartHandshake, Ribbon, ChefHat, Ticket, ChevronDown
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
  adminLogs: any[];
  lodgingInfo: { name: string; desc: string; url: string }[];
  travelInfo: string;
  mood: string;
  religion: string;
};

/**
 * API SERVICE
 */
const API = {
  baseUrl: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api',
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
  "/images/hero-7.jpeg",
  "/images/hero-3.jpeg",
];

// --- COMPONENTS ---

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-4 md:gap-8 justify-center mt-12">
      {[
        { label: 'Days', val: timeLeft.days },
        { label: 'Hours', val: timeLeft.hours },
        { label: 'Mins', val: timeLeft.minutes },
        { label: 'Secs', val: timeLeft.seconds }
      ].map((t, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <span className="text-3xl md:text-5xl font-serif italic text-vintage-plum drop-shadow-sm text-visible-edge">{t.val}</span>
          <span className="text-[10px] uppercase tracking-[0.4em] text-vintage-plum/70 font-bold text-visible-edge">{t.label}</span>
        </div>
      ))}
    </div>
  );
};

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
    <button onClick={toggleCall} className="flex flex-col items-center gap-6 group">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lux border ${active ? 'bg-red-500 text-white border-white animate-pulse' : 'bg-vintage-cream text-vintage-plum border-vintage-tan group-hover:bg-vintage-plum group-hover:text-white'}`}>
        {active ? <X size={28} /> : <Mic size={28} />}
      </div>
      <span className="text-[11px] font-bold text-vintage-plum uppercase tracking-[0.3em]">{active ? 'End Call' : 'Concierge Call'}</span>
    </button>
  );
};

const InteractiveTimeline = ({ schedule }: { schedule: AppState['schedule'] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-16 py-20 relative">
      <div className="flex items-center gap-6 mb-16 px-4">
        <div className="p-4 rounded-full bg-vintage-cream border border-vintage-tan shadow-sm">
          <Clock className="text-vintage-plum" size={24} />
        </div>
        <div>
          <h3 className="text-5xl md:text-6xl font-serif italic text-vintage-plum">The Celebration</h3>
          <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-vintage-tan mt-3">A Chronicle of Joy</p>
        </div>
      </div>
      
      <div className="space-y-32 relative px-4">
        {/* Continuous Timeline Line */}
        <div className="absolute left-[24px] top-0 bottom-0 w-[1px] bg-vintage-tan/40" />
        
        {schedule.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div 
              className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16 cursor-pointer group"
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => setActiveIndex(idx)}
            >
              {/* Timeline Indicator Column */}
              <div className="flex items-center lg:items-start gap-8 w-full lg:w-auto">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 z-10 border ${activeIndex === idx ? 'bg-vintage-plum text-white border-vintage-tan scale-110 shadow-xl' : 'bg-vintage-cream text-vintage-plum border-vintage-tan'}`}>
                    {item.icon === 'heart' && <Heart size={16} />}
                    {item.icon === 'chef-hat' && <ChefHat size={16} />}
                    {item.icon === 'music' && <Music size={16} />}
                    {item.icon === 'heart-handshake' && <HeartHandshake size={16} />}
                    {!['heart', 'chef-hat', 'music', 'heart-handshake'].includes(item.icon) && <Ribbon size={16} />}
                  </div>
                </div>
                
                {/* Time & Title - Always Visible */}
                <div className="space-y-1 lg:hidden">
                  <span className="text-[12px] font-bold tracking-[0.4em] uppercase text-vintage-plum/60">
                    {item.time}
                  </span>
                  <h4 className="text-3xl font-serif italic text-vintage-plum">
                    {item.event}
                  </h4>
                </div>
              </div>

              {/* Grid Container for Layout */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start w-full ml-14 lg:ml-0">
                {/* Text Content */}
                <div className="space-y-4">
                  <div className="hidden lg:block space-y-2">
                    <span className={`text-[12px] font-bold tracking-[0.4em] uppercase transition-colors duration-500 ${activeIndex === idx ? 'text-vintage-plum' : 'text-vintage-plum/30'}`}>
                      {item.time}
                    </span>
                    <h4 className={`text-4xl font-serif italic transition-all duration-500 ${activeIndex === idx ? 'text-vintage-plum' : 'text-vintage-plum/40'}`}>
                      {item.event}
                    </h4>
                  </div>
                  
                  {/* Detail - Visible on Mobile by default, Animated on Desktop */}
                  <div className="block lg:block">
                    <p className="text-vintage-plum/70 text-lg font-light leading-relaxed italic max-w-sm">
                      {item.detail || "We invite you to join us for this special moment in our journey as we unite families and celebrate love."}
                    </p>
                    <div className="w-12 h-[1px] bg-vintage-tan mt-6" />
                  </div>
                </div>

                {/* Always Visible Image for Vertical Flow / Timeline Flow */}
                <div className="relative w-full aspect-video lg:aspect-square rounded-[2.5rem] overflow-hidden border border-vintage-tan/30 bg-vintage-cream/30 shadow-lux">
                   <img 
                    src={`/images/schedule-${idx + 1}.jpeg`}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-1000"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = HERO_IMAGES[idx % HERO_IMAGES.length];
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const HomeView = ({ state, refresh }: { state: AppState, refresh: () => void }) => {
  const [showRSVP, setShowRSVP] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [journeyImg, setJourneyImg] = useState(0);
  const [isJourneyHovered, setIsJourneyHovered] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentImg(p => (p + 1) % HERO_IMAGES.length), 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setJourneyImg(p => (p + 1) % 4), 7000);
    return () => clearInterval(timer);
  }, []);

  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioSources = [
      'https://www.bensound.com/bensound-music/bensound-romantic.mp3', 
      '/audio/wedding-music.mp3' 
    ];
    
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.25;
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    
    let currentSourceIndex = 0;
    
    const tryNextSource = () => {
      if (currentSourceIndex < audioSources.length) {
        audio.src = audioSources[currentSourceIndex];
        currentSourceIndex++;
      }
    };
    
    audio.addEventListener('error', () => tryNextSource());
    tryNextSource();
    audioRef.current = audio;
    audio.load();
    
    return () => { 
      audio.pause(); 
      audio.src = ''; 
    };
  }, []);

  const toggleMusic = async () => {
    if (audioRef.current) {
      try {
        if (musicPlaying) { 
          audioRef.current.pause(); 
          setMusicPlaying(false); 
        } else { 
          await audioRef.current.play(); 
          setMusicPlaying(true); 
        }
      } catch (error) {
        alert('Please click again to enable music');
      }
    }
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
    alert("Response received! Geraldine & Tapiwa are so excited to see you.");
  };

  return (
    <div className="bg-vintage-bg min-h-screen font-sans text-vintage-plum pb-40 overflow-x-hidden selection:bg-vintage-plum selection:text-white">
      
      {/* Editorial Hero */}
      <section className="relative h-screen w-full overflow-hidden bg-vintage-bg flex flex-col items-center justify-start py-8 md:py-12">
        <div className="relative z-50 w-full max-w-5xl flex justify-between items-center px-10 mb-12">
           <button onClick={toggleMusic} className="w-14 h-14 rounded-full bg-vintage-cream/80 border-2 border-vintage-tan flex items-center justify-center shadow-lux group">
              <Music size={24} className={musicPlaying ? "text-vintage-plum group-hover:text-white" : "text-vintage-plum/40"} />
           </button>
           <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRSVP(true)} 
              disabled={!state.rsvpOpen}
              className={`py-4 px-10 rounded-full shadow-lux font-bold tracking-[0.4em] uppercase text-[10px] flex items-center justify-center gap-4 border-2 ${state.rsvpOpen ? 'bg-vintage-plum text-white border-vintage-tan' : 'bg-vintage-cream text-vintage-plum/40 border-vintage-plum/10'}`}
            >
              {state.rsvpOpen ? <><Zap size={16} fill="currentColor" /> RSVP</> : 'CLOSED'}
            </motion.button>
        </div>

        <div className="absolute inset-0 z-0 opacity-40">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImg} 
              src={HERO_IMAGES[currentImg]} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 4 }} 
              className="absolute inset-0 w-full h-full object-cover object-top grayscale" 
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-vintage-bg/40 via-transparent to-vintage-bg" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.5 }}
          className="relative z-10 text-center px-6 max-w-5xl flex flex-col items-center"
        >
          <p className="text-vintage-plum font-serif italic text-lg md:text-2xl mb-12 leading-relaxed text-visible-edge">
            “I have found the one whom my soul loves”
            <br/>
            <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-vintage-plum mt-5 inline-block">— Song of Solomon 3:4</span>
          </p>

          <div className="relative mb-12 flex flex-col items-center">
            <p className="text-white/60 uppercase tracking-[0.6em] text-[10px] font-bold mb-10">Join us as we say</p>
            <h1 className="text-7xl md:text-[10rem] font-bold font-serif tracking-tighter select-none relative text-center text-vintage-plum">
              I DO
            </h1>
          </div>

          <div className="ornamental-line mx-auto mb-8 max-w-xs" />
          <CountdownTimer targetDate="2026-05-16T12:00:00" />
        </motion.div>
      </section>

      <div className="max-w-xl md:max-w-4xl mx-auto px-6 space-y-64 mt-32">
        
        {/* Journey Invitation - NATURAL DISCOVERY VIA SCROLL */}
        <section id="journey-invitation" className="relative z-10 -mt-16">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1.2 }}
            onMouseEnter={() => setIsJourneyHovered(true)}
            onMouseLeave={() => setIsJourneyHovered(false)}
            className="rounded-[3rem] overflow-hidden shadow-lux relative border border-vintage-tan/30 bg-vintage-cream"
          >
            {/* Thinner inner frame */}
            <div className="absolute inset-4 border border-vintage-tan/10 rounded-[2.5rem] z-20 pointer-events-none" />
            
            <div className="absolute inset-0 z-0 opacity-50">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={journeyImg} 
                  src={journeyImg === 0 ? "/images/hero-2.jpeg" : journeyImg === 1 ? "/images/hero-4.jpeg" : journeyImg === 2 ? "/images/hero-5.jpeg" : "/images/hero-6.jpeg"} 
                  initial={{ opacity: 0 }} 
                  animate={{ 
                    opacity: 0.6,
                    filter: isJourneyHovered ? "grayscale(0%)" : "grayscale(100%)"
                  }} 
                  exit={{ opacity: 0 }} 
                  transition={{ duration: 1.5 }} 
                  className="w-full h-full object-cover object-top" 
                />
              </AnimatePresence>
            </div>

            <div className="relative flex flex-col items-center justify-center p-16 md:p-28 text-center text-vintage-plum space-y-14 z-10">
              <div className="space-y-5">
                <p className="font-serif italic text-4xl md:text-6xl tracking-tight text-visible-edge">Geraldine Rumbidzai</p>
                <p className="text-[12px] font-bold uppercase tracking-[0.5em] text-black opacity-80">3rd born of Mr and Mrs Kagowa</p>
              </div>
              
              <div className="text-4xl font-serif italic text-black/20">— and —</div>

              <div className="space-y-5">
                <p className="font-serif italic text-4xl md:text-6xl tracking-tight text-visible-edge">Brighton Tapiwa</p>
                <p className="text-[12px] font-bold uppercase tracking-[0.5em] text-black opacity-80">1st born of Mr and Mrs Mutsekwa</p>
              </div>

              <div className="ornamental-line max-w-xs" />

              <p className="text-lg font-light leading-relaxed max-w-md tracking-wide text-black/70 italic text-visible-edge">
                Together with their families invite you to celebrate their marriage
              </p>
              
              <div className="space-y-4">
                <p className="text-4xl md:text-5xl font-serif italic text-visible-edge">Saturday 16 May 2026</p>
                <p className="text-[14px] font-bold uppercase tracking-[0.8em] text-black/80">12 Noon Sharp</p>
              </div>

              <div className="pt-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.6em] text-black/40 mb-4">The Venue</p>
                <p className="text-3xl font-serif italic border-b border-vintage-tan/40 pb-3 px-6 inline-block text-visible-edge">Umwinzii, Harare</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Interactive Timeline */}
        <section>
          <InteractiveTimeline schedule={state.schedule} />
        </section>

        {/* Guest Information */}
        <section>
          <div className="flex items-center gap-6 mb-16">
            <div className="p-4 rounded-full bg-vintage-cream border border-vintage-tan shadow-sm">
              <Plane className="text-vintage-plum" size={24} />
            </div>
            <div>
              <h3 className="text-5xl font-serif italic text-vintage-plum">Important Details</h3>
              <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-vintage-tan mt-3">Dress Code & Logistics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-vintage-cream/60 p-12 rounded-[3.5rem] shadow-lux border border-vintage-tan/20 space-y-8 relative">
              <h4 className="text-3xl font-serif italic text-vintage-plum border-l-2 border-vintage-tan pl-6">Dress Code</h4>
              <p className="text-vintage-plum/80 text-lg leading-relaxed italic">
                Black tie - polished, glamorous and unforgettable. Bring the glam and we'll bring the love
              </p>
              <div className="pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-vintage-plum/40 mb-3">RSVP Deadline</p>
                <p className="text-lg font-serif italic">Kindly RSVP by 28 February 2026</p>
              </div>
            </div>
            <div className="bg-vintage-plum p-12 rounded-[3.5rem] shadow-lux border border-vintage-tan/30 space-y-10 text-white relative">
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-vintage-tan uppercase tracking-[0.5em]">Transportation</p>
                <p className="text-lg font-serif italic tracking-wide">
                  Shuttles will be available from town and bride and groom's residences
                </p>
              </div>
              <div className="ornamental-line opacity-20" />
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-vintage-tan uppercase tracking-[0.5em]">Contact</p>
                <p className="text-lg font-serif italic tracking-wide">
                  For RSVP and inquiries, please contact the wedding team
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="relative">
          <div className="flex items-center gap-6 mb-16">
            <div className="p-4 rounded-full bg-vintage-cream border border-vintage-tan shadow-sm">
              <MapPin className="text-vintage-plum" size={24} />
            </div>
            <div>
              <h3 className="text-5xl font-serif italic text-vintage-plum">Location</h3>
              <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-vintage-tan mt-3">Find Your Way</p>
            </div>
          </div>
          <div className="aspect-video rounded-[3rem] overflow-hidden shadow-lux border border-vintage-tan/30 p-2 bg-vintage-cream">
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15197.808249852234!2d31.14488585!3d-17.72337775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1931a5758364843b%3A0x6b47c0b484594c35!2sVenue%20Umwinzii!5e0!3m2!1sen!2szw!4v1715600000000!5m2!1sen!2szw" className="w-full h-full border-0" />
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-48 border-t border-vintage-tan/20 bg-vintage-cream/10 py-32 text-center space-y-24">
        <div className="space-y-8">
          <h3 className="text-6xl font-serif italic text-vintage-plum tracking-tight">The Concierge</h3>
          <p className="text-vintage-plum/60 font-serif text-2xl italic max-w-2xl mx-auto px-6">
            Assisting you with every fine detail for the union.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-4xl mx-auto px-8">
          <button className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-vintage-cream flex items-center justify-center text-vintage-plum border border-vintage-tan shadow-lux">
              <MessageSquare size={28} />
            </div>
            <span className="text-[11px] font-bold text-vintage-plum uppercase tracking-[0.4em]">Digital Chat</span>
          </button>
          
          <ElevenLabsVoice agentId={state.elevenLabsAgentId} />

          <button className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-vintage-cream flex items-center justify-center text-vintage-plum border border-vintage-tan shadow-lux">
              <Phone size={28} />
            </div>
            <span className="text-[11px] font-bold text-vintage-plum uppercase tracking-[0.4em]">Contact Team</span>
          </button>
        </div>
        
        <div className="pt-12">
          <p className="text-white font-serif text-xl italic px-6">
            "Love, laughter and happily ever after 💕"
          </p>
        </div>
      </footer>

      {/* RSVP Modal */}
      <AnimatePresence>
        {showRSVP && (
          <div className="fixed inset-0 z-[300] bg-vintage-plum/85 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-vintage-cream w-full max-w-2xl rounded-[3rem] p-10 md:p-20 shadow-lux border border-vintage-tan/30 relative">
              <button onClick={() => setShowRSVP(false)} className="absolute top-8 right-8 w-12 h-12 bg-vintage-plum text-white rounded-full flex items-center justify-center shadow-lg"><X size={24} /></button>
              
              <div className="mb-16">
                <h3 className="text-5xl font-serif italic text-vintage-plum mb-4">The RSVP</h3>
                <p className="text-vintage-tan text-[10px] font-bold uppercase tracking-[0.5em]">Kindly respond by Feb 2026</p>
              </div>
              
              <form onSubmit={handleRSVPSubmit} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-vintage-plum ml-6">Full Name</label>
                  <input name="name" required className="w-full bg-white/40 border border-vintage-tan/30 rounded-full p-6 text-xl font-serif italic" placeholder="..." />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-vintage-plum ml-6">WhatsApp Number</label>
                  <input name="phone" required className="w-full bg-white/40 border border-vintage-tan/30 rounded-full p-6 text-xl font-serif italic" placeholder="..." />
                </div>

                {state.questions.map(q => (
                  <div key={q.fieldId} className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-vintage-plum ml-6">{q.label}</label>
                    <input name={q.fieldId} className="w-full bg-white/40 border border-vintage-tan/30 rounded-full p-6 text-xl font-serif italic" placeholder="..." />
                  </div>
                ))}
                
                <button type="submit" className="w-full py-6 bg-vintage-plum text-white rounded-full font-bold uppercase tracking-[0.6em] text-xs shadow-lux border border-vintage-tan/30">
                  Confirm Attendance
                </button>
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
  const [pass, setPass] = useState('');

  if (!authed) {
    return (
      <div className="min-h-screen bg-vintage-plum flex items-center justify-center p-8">
        <div className="bg-vintage-cream p-16 rounded-[3.5rem] w-full max-w-sm text-center border border-vintage-tan/40">
          <ShieldCheck className="mx-auto mb-10 text-vintage-plum" size={60} />
          <h2 className="text-3xl font-serif italic mb-10 text-vintage-plum">Registry OS</h2>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==='Enter' && (pass===state.adminPassword ? setAuthed(true) : alert('Incorrect'))} className="w-full bg-white/50 p-6 rounded-full text-center mb-10 border border-vintage-tan/30 text-2xl font-serif" placeholder="••••" />
          <button onClick={() => pass===state.adminPassword ? setAuthed(true) : alert('Incorrect')} className="w-full py-6 bg-vintage-plum text-white rounded-full font-bold uppercase tracking-[0.4em] text-[10px]">Access Portal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-bg p-12 md:p-24 overflow-y-auto">
      <h1 className="text-6xl font-serif italic text-vintage-plum mb-16 capitalize">Guest Registry</h1>
      <div className="bg-white/40 rounded-[3rem] shadow-lux overflow-hidden border border-vintage-tan/20 backdrop-blur-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-vintage-cream/80 text-[10px] uppercase font-bold text-vintage-plum tracking-[0.4em] border-b border-vintage-tan/20">
              <th className="p-10">Guest Details</th>
              <th className="p-10 text-center">Party Size</th>
              <th className="p-10">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.responses.map((r, i) => (
              <tr key={i} className="border-b border-vintage-tan/5 hover:bg-white/20 transition-colors">
                <td className="p-10">
                  <p className="font-serif italic text-3xl text-vintage-plum">{r.name}</p>
                  <p className="text-vintage-tan font-bold mt-1 text-[10px] uppercase tracking-[0.2em]">{r.phone}</p>
                </td>
                <td className="p-10 text-center">
                  <span className="text-2xl font-serif italic text-vintage-plum">{r.guests}</span>
                </td>
                <td className="p-10">
                  <span className={`text-[9px] font-bold px-5 py-2 rounded-full uppercase tracking-[0.3em] ${r.aiInteracted ? 'bg-vintage-plum text-white' : 'bg-vintage-cream text-vintage-plum/40'}`}>
                    {r.aiInteracted ? 'Voice Agent' : 'Manual Registration'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    <div className="h-screen bg-vintage-bg flex items-center justify-center text-vintage-plum">
      <div className="flex flex-col items-center gap-12">
        <Sparkles size={48} className="animate-pulse" />
        <span className="tracking-[1em] text-[10px] font-bold uppercase">Geraldine & Tapiwa</span>
      </div>
    </div>
  );

  return path === '/admin' ? <AdminView state={state} refresh={refresh} /> : <HomeView state={state} refresh={refresh} />;
};

createRoot(document.getElementById('root')!).render(<App />);