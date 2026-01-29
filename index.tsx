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
      
      <div className="space-y-24 relative px-4">
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
              className="flex items-start gap-8 cursor-pointer group"
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => setActiveIndex(idx)}
            >
              {/* Timeline Circle */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 z-10 border ${activeIndex === idx ? 'bg-vintage-plum text-white border-vintage-tan scale-110 shadow-xl' : 'bg-vintage-cream text-vintage-plum border-vintage-tan'}`}>
                  {item.icon === 'heart' && <Heart size={16} />}
                  {item.icon === 'chef-hat' && <ChefHat size={16} />}
                  {item.icon === 'music' && <Music size={16} />}
                  {item.icon === 'heart-handshake' && <HeartHandshake size={16} />}
                  {!['heart', 'chef-hat', 'music', 'heart-handshake'].includes(item.icon) && <Ribbon size={16} />}
                </div>
                {idx < schedule.length - 1 && (
                  <div className="w-[1px] h-24 bg-vintage-tan/20 mt-2" />
                )}
              </div>

              {/* Content and Image Container */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Text Content */}
                <div className="space-y-3">
                  <span className={`text-[12px] font-bold tracking-[0.4em] uppercase transition-colors duration-500 ${activeIndex === idx ? 'text-vintage-plum' : 'text-vintage-plum/30'}`}>
                    {item.time}
                  </span>
                  <h4 className={`text-3xl md:text-4xl font-serif italic transition-all duration-500 ${activeIndex === idx ? 'text-vintage-plum' : 'text-vintage-plum/40'}`}>
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
                        <p className="text-vintage-plum/70 text-base font-light leading-relaxed pt-4 max-w-sm italic">
                          {item.detail || "We invite you to join us for this special moment in our journey as we unite families and celebrate love."}
                        </p>
                        <div className="w-12 h-[1px] bg-vintage-tan mt-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dynamic Image - Appears Next to Active Entry */}
                <div className="relative h-64 md:h-80 lg:h-96">
                  <AnimatePresence mode="wait">
                    {activeIndex === idx && (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 1.05, x: -20 }}
                        className="relative h-full w-full"
                      >
                        <div className="relative h-full w-full p-2 border border-vintage-tan/30 rounded-[3rem] bg-vintage-cream/50">
                          <div className="absolute inset-2 border border-vintage-tan/10 rounded-[2.5rem] pointer-events-none" />
                          <motion.img 
                            src={`/images/schedule-${idx + 1}.jpeg`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full object-cover object-top rounded-[2.5rem] shadow-lux"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = HERO_IMAGES[idx % HERO_IMAGES.length];
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
    // Try multiple sources in order of preference
    const audioSources = [
      '/audio/wedding-music.mp3', // Local file (best option)
      'https://www.bensound.com/bensound-music/bensound-romantic.mp3' // Fallback
    ];
    
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.25;
    
    let currentSourceIndex = 0;
    
    const tryNextSource = () => {
      if (currentSourceIndex < audioSources.length) {
        console.log(`Trying audio source ${currentSourceIndex + 1}: ${audioSources[currentSourceIndex]}`);
        audio.src = audioSources[currentSourceIndex];
        currentSourceIndex++;
      } else {
        console.log('All audio sources failed');
      }
    };
    
    audio.addEventListener('error', () => {
      console.log(`Audio source ${currentSourceIndex} failed, trying next...`);
      tryNextSource();
    });
    
    audio.addEventListener('canplay', () => {
      console.log(`Audio loaded successfully from: ${audio.src}`);
    });
    
    // Start with first source
    tryNextSource();
    audioRef.current = audio;
    
    // Preload the audio
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
        console.log('Music play failed:', error);
        alert('Please click again to enable music - browser requires user interaction');
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
      
      {/* Editorial Hero - PLUM TEXT ON LILAC BG */}
      <section className="relative h-screen w-full overflow-hidden bg-vintage-bg flex flex-col items-center justify-start py-8 md:py-12">
        {/* Top Control Bar - Music at Top */}
        <div className="relative z-50 w-full max-w-5xl flex justify-between items-center px-12 mb-12">
           <button onClick={toggleMusic} className="w-14 h-14 rounded-full bg-vintage-cream/80 border-2 border-vintage-tan flex items-center justify-center hover:bg-vintage-tan hover:text-white transition-all shadow-lux group">
              <Music size={24} className={musicPlaying ? "text-vintage-plum group-hover:text-white" : "text-vintage-plum/40"} />
           </button>
           <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRSVP(true)} 
              disabled={!state.rsvpOpen}
              className={`py-4 px-10 rounded-full shadow-lux font-bold tracking-[0.4em] uppercase text-[10px] flex items-center justify-center gap-4 transition-all border-2 ${state.rsvpOpen ? 'bg-vintage-plum text-white border-vintage-tan' : 'bg-vintage-cream text-vintage-plum/40 border-vintage-plum/10 cursor-not-allowed'}`}
            >
              {state.rsvpOpen ? <><Zap size={16} fill="currentColor" /> RSVP</> : 'CLOSED'}
            </motion.button>
        </div>

        {/* Hero Image Container with Deep Plum Filters */}
        <div className="absolute inset-0 z-0 opacity-35">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImg} 
              src={HERO_IMAGES[currentImg]} 
              initial={{ opacity: 0, scale: 1.05 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 4 }} 
              className="absolute inset-0 w-full h-full object-cover object-top grayscale brightness-75 contrast-125" 
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-vintage-bg/40 via-transparent to-vintage-bg" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10 text-center px-6 max-w-5xl flex flex-col items-center mt-8 md:mt-0"
        >
          <p className="text-vintage-plum font-serif italic text-lg md:text-2xl mb-12 leading-relaxed text-visible-edge">
            “I have found the one whom my soul loves”
            <br/>
            <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-vintage-plum mt-5 inline-block drop-shadow-md">— Song of Solomon 3:4</span>
          </p>

          <div className="relative mb-12 flex flex-col items-center">
            {/* LARGE "I DO" SVG BACKGROUND EFFECT */}
            <p className="text-white/60 uppercase tracking-[0.6em] text-[10px] md:text-xs font-bold mb-10">Join us as we say</p>
            <h1 className="text-6xl md:text-[12rem] font-bold font-serif tracking-tighter select-none font-black relative text-center">
              <svg 
                className="w-[90%] h-[120px] md:h-[180px] mx-auto" 
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
                  y="70" 
                  dominantBaseline="central" 
                  textAnchor="middle" 
                  className="font-black"
                  fontSize="140"
                  fontFamily="Playfair Display, Georgia, serif"
                  fontWeight="700"
                  letterSpacing="-15"
                  fill="url(#floral)"
                  stroke="white"
                  strokeWidth="1"
                >
                  I DO
                </text>
              </svg>
            </h1>
            
          </div>

          <div className="ornamental-line mx-auto mb-8 max-w-xs" />
          
          <CountdownTimer targetDate="2026-05-16T12:00:00" />
        </motion.div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-xl md:max-w-4xl mx-auto px-6 space-y-64">
        
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

        {/* Guest Information - Updated with New Content */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="bg-vintage-cream/60 p-16 rounded-[4rem] shadow-lux border border-vintage-tan/20 space-y-10 relative">
              <div className="absolute top-6 right-8 text-black opacity-[0.05] font-serif italic text-7xl">01</div>
              <h4 className="text-3xl font-serif italic text-black/80 border-l-2 border-vintage-tan pl-8 text-visible-edge">Dress Code</h4>
              <p className="text-black/70 text-lg leading-relaxed italic text-visible-edge">
                Black tie - polished, glamorous and unforgettable. Bring the glam and we'll bring the love
              </p>
              <div className="pt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-black mb-4">RSVP Deadline</p>
                <p className="text-lg font-serif italic text-black/80">Kindly RSVP by 28 February 2026</p>
                <p className="text-sm text-black/60 italic mt-2">"Don't leave us hanging, invitations will only be valid once confirmed"</p>
              </div>
            </div>
            <div className="bg-vintage-plum p-16 rounded-[4rem] shadow-lux border border-vintage-tan/30 space-y-12 text-white relative overflow-hidden">
               <div className="absolute top-6 right-8 text-white opacity-[0.05] font-serif italic text-7xl">02</div>
              <div className="space-y-5">
                <p className="text-[11px] font-bold text-vintage-tan uppercase tracking-[0.5em]">Transportation</p>
                <p className="text-lg font-serif italic tracking-wide text-visible-edge">
                  Shuttles will be available from town and bride and groom's residences
                </p>
              </div>
              <div className="ornamental-line opacity-20" />
              <div className="space-y-5">
                <p className="text-[11px] font-bold text-vintage-tan uppercase tracking-[0.5em]">Contact</p>
                <p className="text-lg font-serif italic tracking-wide text-visible-edge">
                  For RSVP and inquiries, please contact the wedding team
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section - Moved to Second-to-Last */}
        <section className="relative">
          <div className="flex items-center gap-6 mb-16">
            <div className="p-4 rounded-full bg-vintage-cream border border-vintage-tan shadow-sm">
              <MapPin className="text-vintage-plum" size={24} />
            </div>
            <div>
              <h3 className="text-5xl font-serif italic text-vintage-plum">Directions & Location</h3>
              <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-vintage-tan mt-3">Find Your Way</p>
            </div>
          </div>
          <div className="aspect-video rounded-[4rem] overflow-hidden shadow-lux border border-vintage-tan/30 p-2 bg-vintage-cream">
            <div className="w-full h-full rounded-[3.5rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 border border-vintage-tan/10">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15197.808249852234!2d31.14488585!3d-17.72337775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1931a5758364843b%3A0x6b47c0b484594c35!2sVenue%20Umwinzii!5e0!3m2!1sen!2szw!4v1715600000000!5m2!1sen!2szw" className="w-full h-full border-0" />
            </div>
          </div>
        </section>
      </div>

      {/* Footer Concierge - Updated with Closing Line */}
      <footer className="mt-32 border-t border-vintage-tan/20 bg-vintage-cream/10 py-32 text-center space-y-24">
        <div className="space-y-10">
          <h3 className="text-7xl font-serif italic text-vintage-plum tracking-tight text-visible-edge">The Concierge</h3>
          <div className="ornamental-line mx-auto max-w-xs" />
          <p className="text-black/60 font-serif text-3xl italic max-w-2xl mx-auto px-6 text-visible-edge">
            Assisting you with every fine detail for the union.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-24 max-w-5xl mx-auto px-8">
          <button onClick={() => {}} className="flex flex-col items-center gap-8 group">
            <div className="w-24 h-24 rounded-full bg-vintage-cream flex items-center justify-center text-vintage-plum border border-vintage-tan group-hover:bg-vintage-plum group-hover:text-white transition-all shadow-lux">
              <MessageSquare size={32} />
            </div>
            <span className="text-[11px] font-bold text-vintage-plum uppercase tracking-[0.4em] text-visible-edge">Digital Chat</span>
          </button>
          
          <ElevenLabsVoice agentId={state.elevenLabsAgentId} />

          <button className="flex flex-col items-center gap-8 group">
            <div className="w-24 h-24 rounded-full bg-vintage-cream flex items-center justify-center text-vintage-plum border border-vintage-tan group-hover:bg-vintage-plum group-hover:text-white transition-all shadow-lux">
              <Phone size={32} />
            </div>
            <span className="text-[11px] font-bold text-vintage-plum uppercase tracking-[0.4em] text-visible-edge">Contact Team</span>
          </button>
        </div>
        
        <div className="pt-16">
          <p className="text-vintage-plum/80 font-serif text-2xl italic max-w-2xl mx-auto px-6">
            "Love, laughter and happily ever after - with you 💕"
          </p>
        </div>
      </footer>

      {/* RSVP Modal */}
      <AnimatePresence>
        {showRSVP && (
          <div className="fixed inset-0 z-[300] bg-vintage-plum/85 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-vintage-cream w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-12 md:p-24 shadow-lux border border-vintage-tan/40 relative">
              <div className="absolute inset-4 border border-vintage-tan/10 rounded-[3rem] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-20 sticky top-0 bg-vintage-cream pb-10 z-10">
                <div>
                  <h3 className="text-5xl font-serif italic text-vintage-plum flex items-center gap-6">
                    <Ticket className="text-vintage-tan" size={32} />
                    The RSVP
                  </h3>
                  <p className="text-vintage-tan text-[11px] font-bold uppercase tracking-[0.6em] mt-4">Confirm Your Presence</p>
                </div>
                <button onClick={() => setShowRSVP(false)} className="w-14 h-14 bg-vintage-plum text-white rounded-full flex items-center justify-center hover:scale-110 transition-all border border-vintage-tan/50 shadow-lg relative z-30">
                  <X size={28} />
                </button>
              </div>
              
              <form onSubmit={handleRSVPSubmit} className="space-y-14 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                  <div className="space-y-6">
                    <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-vintage-plum ml-8">Full Name</label>
                    <input name="name" required className="w-full bg-white/40 border border-vintage-tan/30 rounded-full p-6 text-xl focus:border-vintage-plum focus:ring-0 transition-all font-serif italic" placeholder="Enter name" />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-vintage-plum ml-8">WhatsApp Number</label>
                    <input name="phone" required className="w-full bg-white/40 border border-vintage-tan/30 rounded-full p-6 text-xl focus:border-vintage-plum focus:ring-0 transition-all font-serif italic" placeholder="+263..." />
                  </div>
                </div>

                {state.questions.map(q => (
                  <div key={q.fieldId} className="space-y-6">
                    <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-vintage-plum ml-8">{q.label}</label>
                    {q.type === 'boolean' ? (
                      <div className="flex gap-10">
                        {['Joyfully Attend', 'Decline'].map(v => (
                          <label key={v} className="flex-1 p-7 bg-white/40 border border-vintage-tan/20 rounded-full text-center cursor-pointer has-[:checked]:bg-vintage-plum has-[:checked]:text-white has-[:checked]:border-vintage-tan transition-all font-bold text-xs uppercase tracking-[0.4em]">
                            <input type="radio" name={q.fieldId} value={v} className="hidden" defaultChecked={v==='Joyfully Attend'} /> {v}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input name={q.fieldId} className="w-full bg-white/40 border border-vintage-tan/30 rounded-full p-6 text-xl focus:border-vintage-plum transition-all font-serif italic" placeholder="..." />
                    )}
                  </div>
                ))}
                
                <div className="pt-12">
                  <button type="submit" className="w-full py-8 bg-vintage-plum text-white rounded-full font-bold shadow-lux border border-vintage-tan/50 uppercase tracking-[0.8em] text-sm hover:scale-[1.02] transition-all">
                    Register Presence
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
      <div className="min-h-screen bg-vintage-plum flex items-center justify-center p-8">
        <div className="bg-vintage-cream p-20 rounded-[4rem] w-full max-w-sm text-center shadow-lux border border-vintage-tan/40 relative">
          <div className="absolute inset-4 border border-vintage-tan/10 rounded-[3rem] pointer-events-none" />
          <ShieldCheck className="mx-auto mb-12 text-vintage-plum" size={72} />
          <h2 className="text-4xl font-serif italic mb-3 text-vintage-plum">Registry OS</h2>
          <p className="text-vintage-tan text-[11px] mb-14 italic uppercase tracking-[0.5em] font-bold">Secure Access</p>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==='Enter' && (pass===state.adminPassword ? setAuthed(true) : alert('Incorrect Key'))} className="w-full bg-white/50 p-8 rounded-full text-center mb-10 focus:ring-1 focus:ring-vintage-plum outline-none border border-vintage-tan/30 text-3xl font-serif" placeholder="••••" />
          <button onClick={() => pass===state.adminPassword ? setAuthed(true) : alert('Incorrect Key')} className="w-full py-8 bg-vintage-plum text-white rounded-full font-bold uppercase tracking-[0.4em] text-[11px] border border-vintage-tan/50 shadow-lux hover:scale-[1.03] transition-all">Enter</button>
        </div>
      </div>
    );
  }

  const totals = { guests: state.responses.reduce((a,b) => a+b.guests, 0) };

  const addQuestion = async () => {
    const q = { fieldId: Date.now().toString(), label: 'New Requirement', type: 'text' as const, required: false };
    await API.updateState({ questions: [...state.questions, q] });
    refresh();
  };

  return (
    <div className="min-h-screen bg-vintage-bg font-sans flex flex-col md:flex-row">
      <nav className="w-full md:w-80 bg-vintage-plum text-white p-14 flex flex-col border-r border-vintage-tan/20 shadow-lux">
        <div className="flex items-center gap-5 mb-24">
          <Zap size={32} className="text-vintage-tan"/>
          <h1 className="text-3xl font-serif italic tracking-tight">Admin G&T</h1>
        </div>
        <div className="space-y-6 flex-1">
          {[
            { id: 'overview', icon: Coffee, label: 'Stats' },
            { id: 'guests', icon: Users, label: 'Guest List' },
            { id: 'builder', icon: FileText, label: 'RSVP Fields' },
            { id: 'logs', icon: ShieldCheck, label: 'Activity' },
            { id: 'settings', icon: Settings, label: 'General' }
          ].map(p => (
            <button key={p.id} onClick={() => setPanel(p.id as any)} className={`w-full text-left p-6 rounded-[2.5rem] flex items-center gap-5 transition-all border ${panel === p.id ? 'bg-vintage-cream text-vintage-plum font-bold shadow-lux border-vintage-tan' : 'text-white/40 border-transparent hover:text-white'}`}>
              <p.icon size={18} /> {p.label}
            </button>
          ))}
        </div>
        <div className="mt-24 p-8 bg-black/15 rounded-[3rem] border border-white/5 shadow-inner">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-vintage-tan mb-5">Venue Capacity</p>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-vintage-tan" style={{ width: `${Math.min(100, (totals.guests/state.maxGuests)*100)}%` }} />
          </div>
          <p className="text-sm mt-5 font-serif italic text-white/80">{totals.guests} <span className="text-vintage-tan mx-1">/</span> {state.maxGuests}</p>
        </div>
      </nav>

      <main className="flex-1 p-12 md:p-24 overflow-y-auto">
        <header className="flex justify-between items-center mb-28">
          <h2 className="text-7xl font-serif italic capitalize text-vintage-plum tracking-tight">{panel}</h2>
          <button onClick={() => API.updateState({ rsvpOpen: !state.rsvpOpen }).then(refresh)} className={`px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] border shadow-lux transition-all ${state.rsvpOpen ? 'bg-green-50/50 text-green-700 border-green-200' : 'bg-red-50/50 text-red-700 border-red-200'}`}>
            RSVPs: {state.rsvpOpen ? 'OPEN' : 'CLOSED'}
          </button>
        </header>

        {panel === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
            {[
              { label: 'Confirmed Guests', val: totals.guests, color: 'text-vintage-plum' },
              { label: 'Total Parties', val: state.responses.length, color: 'text-vintage-tan' },
              { label: 'AI Assistance', val: state.responses.filter(r=>r.aiInteracted).length, color: 'text-vintage-muted' }
            ].map((s, i) => (
              <div key={i} className="bg-vintage-cream p-14 rounded-[4rem] shadow-lux border border-vintage-tan/20 relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 opacity-5">
                   <Heart size={160} className="text-vintage-plum" />
                </div>
                <p className="text-[11px] font-bold uppercase text-vintage-plum/40 tracking-[0.4em] mb-6">{s.label}</p>
                <p className={`text-9xl font-serif italic ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
        )}

        {panel === 'guests' && (
          <div className="bg-white/40 rounded-[4rem] shadow-lux overflow-hidden border border-vintage-tan/20 backdrop-blur-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-vintage-cream/80 text-[10px] uppercase font-bold text-vintage-plum tracking-[0.4em] border-b border-vintage-tan/20">
                  <th className="p-12">Name</th>
                  <th className="p-12">Party</th>
                  <th className="p-12">Interaction</th>
                </tr>
              </thead>
              <tbody>
                {state.responses.map((r, i) => (
                  <tr key={i} className="border-b border-vintage-tan/5 hover:bg-vintage-bg/10 transition-colors">
                    <td className="p-12">
                      <p className="font-serif italic text-3xl text-vintage-plum">{r.name}</p>
                      <p className="text-vintage-tan font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">{r.phone}</p>
                    </td>
                    <td className="p-12">
                      <span className="px-8 py-3 bg-vintage-cream/60 rounded-full font-serif italic text-vintage-plum border border-vintage-tan/30 text-xl shadow-sm">
                        {r.guests}
                      </span>
                    </td>
                    <td className="p-12">
                       {r.aiInteracted ? (
                         <span className="bg-vintage-plum text-white text-[9px] font-bold px-6 py-2 rounded-full uppercase tracking-[0.3em] border border-vintage-tan/50 shadow-sm">Voice Assistant</span>
                       ) : (
                         <span className="bg-vintage-cream text-vintage-plum/40 text-[9px] font-bold px-6 py-2 rounded-full uppercase tracking-[0.3em] border border-vintage-tan/10">Manual Registry</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {panel === 'builder' && (
          <div className="max-w-4xl space-y-12">
            <button onClick={addQuestion} className="w-full py-8 bg-vintage-plum text-white rounded-[3rem] font-bold border border-vintage-tan/40 flex items-center justify-center gap-5 uppercase tracking-[0.4em] text-[11px] shadow-lux hover:scale-[1.01] transition-all"><Plus size={20}/> Add Requirement Field</button>
            <div className="space-y-8">
              {state.questions.map((q, i) => (
                <div key={q.fieldId} className="p-12 bg-vintage-cream/80 rounded-[4rem] shadow-lux border border-vintage-tan/20 flex items-center justify-between group backdrop-blur-sm">
                  <div className="flex-1 mr-12">
                    <input value={q.label} onChange={async (e) => {
                      const nq = [...state.questions]; nq[i].label = e.target.value; await API.updateState({questions: nq}); refresh();
                    }} className="w-full bg-white/60 p-6 rounded-[2rem] font-serif italic text-2xl text-vintage-plum border border-vintage-tan/20 focus:border-vintage-plum transition-all" />
                  </div>
                  <div className="flex gap-6">
                    <select value={q.type} onChange={async (e) => {
                      const nq = [...state.questions]; nq[i].type = e.target.value as any; await API.updateState({questions: nq}); refresh();
                    }} className="bg-white/60 p-6 rounded-[2rem] text-[11px] uppercase font-bold border border-vintage-tan/20 text-vintage-plum shadow-sm">
                      <option value="text">Text</option>
                      <option value="select">Select</option>
                      <option value="boolean">Boolean</option>
                    </select>
                    <button onClick={async () => {
                      const nq = state.questions.filter(x=>x.fieldId!==q.fieldId); await API.updateState({questions: nq}); refresh();
                    }} className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={20}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {panel === 'logs' && (
          <div className="space-y-16 max-w-5xl">
            {/* Admin Activity Logs */}
            <div className="space-y-8">
              <h3 className="text-4xl font-serif italic text-vintage-plum border-b border-vintage-tan/30 pb-4">Admin Activity</h3>
              {state.adminLogs?.map((log, i) => (
                <div key={`admin-${i}`} className="p-10 bg-vintage-plum/10 rounded-[3rem] border border-vintage-plum/20 flex gap-8 items-center shadow-lux backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-vintage-plum text-white flex items-center justify-center border border-vintage-tan shadow-lg">
                    <Settings size={24}/>
                  </div>
                  <div className="flex-1">
                    <p className="font-serif italic text-2xl text-vintage-plum capitalize">{log.field.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-vintage-plum/60 text-sm mt-2 font-mono">
                      {log.oldValue} → {log.newValue}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.5em] text-vintage-tan font-bold bg-white/60 px-6 py-2 rounded-full border border-vintage-tan/20 shadow-sm">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {(!state.adminLogs || state.adminLogs.length === 0) && (
                <p className="text-vintage-plum/40 text-center italic py-12">No admin activity yet</p>
              )}
            </div>

            {/* Guest AI Logs */}
            <div className="space-y-8">
              <h3 className="text-4xl font-serif italic text-vintage-plum border-b border-vintage-tan/30 pb-4">Guest Interactions</h3>
              {state.aiLogs.map((log, i) => (
                <div key={`guest-${i}`} className="p-12 bg-vintage-cream/90 rounded-[4rem] border border-vintage-tan/30 flex gap-12 items-center shadow-lux backdrop-blur-sm">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center border ${log.type==='voice' ? 'bg-vintage-plum text-white border-vintage-tan shadow-lg' : 'bg-white text-vintage-tan border-vintage-tan/20 shadow-sm'}`}>
                    <Mic size={28}/>
                  </div>
                  <div className="flex-1">
                    <p className="font-serif italic text-3xl text-vintage-plum">{log.guestPhone}</p>
                    <p className="text-vintage-plum/70 text-xl mt-3 font-light">"{log.summary}"</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.5em] text-vintage-tan font-bold bg-white/60 px-8 py-3 rounded-full border border-vintage-tan/20 shadow-sm">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {state.aiLogs.length === 0 && (
                <p className="text-vintage-plum/40 text-center italic py-12">No guest interactions yet</p>
              )}
            </div>
          </div>
        )}

        {panel === 'settings' && (
          <div className="max-w-4xl bg-vintage-cream/80 p-20 rounded-[5rem] shadow-lux border border-vintage-tan/30 space-y-20 backdrop-blur-sm relative">
            <div className="absolute inset-6 border border-vintage-tan/10 rounded-[4rem] pointer-events-none" />
            <div className="space-y-8">
              <label className="text-[11px] font-bold uppercase tracking-[0.5em] text-vintage-plum/40 ml-10">Voice Agent Context (ElevenLabs)</label>
              <input value={state.elevenLabsAgentId} onChange={e => API.updateState({elevenLabsAgentId: e.target.value}).then(refresh)} className="w-full bg-white/60 p-8 rounded-[3rem] border border-vintage-tan/30 text-xl font-serif italic focus:border-vintage-plum transition-all shadow-sm" placeholder="agent-id-xxx" />
            </div>
            <div className="grid grid-cols-2 gap-16">
              <div className="space-y-8">
                <label className="text-[11px] font-bold uppercase tracking-[0.5em] text-vintage-plum/40 ml-10">Venue Capacity</label>
                <input type="number" value={state.maxGuests} onChange={e => API.updateState({maxGuests: parseInt(e.target.value)}).then(refresh)} className="w-full bg-white/60 p-8 rounded-[3rem] border border-vintage-tan/30 text-2xl font-serif italic shadow-sm" />
              </div>
              <div className="space-y-8">
                <label className="text-[11px] font-bold uppercase tracking-[0.5em] text-vintage-plum/40 ml-10">Admin Key</label>
                <input value={state.adminPassword} onChange={e => API.updateState({adminPassword: e.target.value}).then(refresh)} className="w-full bg-white/60 p-8 rounded-[3rem] border border-vintage-tan/30 text-2xl font-serif italic shadow-sm" />
              </div>
            </div>
            <div className="space-y-8">
              <label className="text-[11px] font-bold uppercase tracking-[0.5em] text-vintage-plum/40 ml-10">The Wedding Theme Description</label>
              <textarea value={state.mood} onChange={e => API.updateState({mood: e.target.value}).then(refresh)} className="w-full bg-white/60 p-10 rounded-[4rem] border border-vintage-tan/30 text-xl leading-relaxed h-48 focus:border-vintage-plum transition-all shadow-sm font-serif italic" />
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
    <div className="h-screen bg-vintage-bg flex items-center justify-center font-serif text-4xl italic animate-pulse text-vintage-plum">
      <div className="flex flex-col items-center gap-16">
        <div className="p-8 rounded-full border border-vintage-tan/40 shadow-lux">
          <Sparkles size={48} className="text-vintage-plum" />
        </div>
        <span className="text-vintage-plum tracking-[1.2em] text-[12px] font-bold uppercase">Preparing the Union...</span>
      </div>
    </div>
  );

  return path === '/admin' ? <AdminView state={state} refresh={refresh} /> : <HomeView state={state} refresh={refresh} />;
};

createRoot(document.getElementById('root')!).render(<App />);