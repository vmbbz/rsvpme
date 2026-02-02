import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Heart, Calendar, MapPin, Clock, Plane, MessageCircle, ChevronRight, 
  Settings, Users, FileText, Plus, Trash2, CheckCircle, X, Phone, Send, 
  Loader2, Lock, Menu, MoreVertical, Mic, MessageSquare, ShieldCheck, Zap, Coffee,
  Info, Database, Globe, ArrowRight, Sparkles, Instagram, Music, HeartHandshake, Ribbon, ChefHat, Ticket, ChevronDown, Car
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
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    try {
      if (!schedule || schedule.length === 0) {
        setHasError(true);
      } else {
        setHasError(false);
      }
    } catch (error) {
      console.error('Timeline error:', error);
      setHasError(true);
    }
  }, [schedule]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (hasError) {
    return (
      <div className="space-y-16 py-20 relative">
        <div className="flex items-center gap-6 mb-16 px-4">
          <div className="p-4 rounded-full bg-vintage-cream border border-vintage-tan shadow-sm">
            <Clock className="text-vintage-plum" size={24} />
          </div>
          <div>
            <h3 className="text-5xl font-serif italic text-vintage-plum">The Celebration</h3>
            <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-vintage-tan mt-3">A Chronicle of Joy</p>
          </div>
        </div>
        
        <div className="bg-vintage-cream/60 rounded-[2rem] p-12 text-center border border-vintage-tan/30">
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-vintage-plum/10 flex items-center justify-center">
              <Calendar className="text-vintage-plum" size={32} />
            </div>
            <h4 className="text-2xl font-serif italic text-vintage-plum">Schedule Loading</h4>
            <p className="text-vintage-plum/70 max-w-md mx-auto">
              The wedding schedule is currently being updated. Please check back soon for the complete celebration timeline.
            </p>
            <div className="pt-4">
              <p className="text-sm text-vintage-plum/50">
                Saturday 16 May 2026 • 12 Noon Sharp • Umwinzii, Harare
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      
      <div className="space-y-32 relative px-4 md:px-6">
        {/* Continuous Timeline Line */}
        <div className={`absolute ${isMobile ? 'left-[20px]' : 'left-[24px]'} top-0 bottom-0 w-[1px] bg-vintage-tan/40`} />
        
        {schedule.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div 
              className="flex flex-col cursor-pointer group"
              onMouseEnter={() => !isMobile && setActiveIndex(idx)}
              onTouchStart={() => isMobile && setActiveIndex(idx)}
              onClick={() => setActiveIndex(idx)}
            >
              {/* Timeline Circle and Time/Title Row */}
              <div className="flex items-start gap-6 mb-6">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-700 z-10 border ${activeIndex === idx ? 'bg-vintage-plum text-white border-vintage-tan scale-110 shadow-xl' : 'bg-vintage-cream text-vintage-plum border-vintage-tan'}`}>
                    {item.icon === 'heart' && <Heart size={isMobile ? 14 : 16} />}
                    {item.icon === 'chef-hat' && <ChefHat size={isMobile ? 14 : 16} />}
                    {item.icon === 'music' && <Music size={isMobile ? 14 : 16} />}
                    {item.icon === 'heart-handshake' && <HeartHandshake size={isMobile ? 14 : 16} />}
                    {!['heart', 'chef-hat', 'music', 'heart-handshake'].includes(item.icon) && <Ribbon size={isMobile ? 14 : 16} />}
                  </div>
                </div>
                
                {/* Time & Title */}
                <div className="flex-1">
                  <span className={`text-[12px] font-bold tracking-[0.4em] uppercase transition-colors duration-500 ${activeIndex === idx ? 'text-vintage-plum' : 'text-vintage-plum/30'}`}>
                    {item.time}
                  </span>
                  <h4 className={`text-xl md:text-2xl lg:text-4xl font-serif italic transition-all duration-500 ${activeIndex === idx ? 'text-vintage-plum' : 'text-vintage-plum/40'}`}>
                    {item.event}
                  </h4>
                </div>
              </div>

              {/* Content and Image */}
              <div className={`${isMobile ? 'ml-14' : 'ml-18'} space-y-6`}>
                {/* Detail Text */}
                <div>
                  <p className="text-vintage-plum/70 text-sm md:text-base font-light leading-relaxed italic max-w-sm">
                    {item.detail || "We invite you to join us for this special moment in our journey as we unite families and celebrate love."}
                  </p>
                  <div className="w-12 h-[1px] bg-vintage-tan mt-4" />
                </div>

                {/* Image */}
                <div className="relative w-full max-w-md aspect-video rounded-[1rem] overflow-hidden border border-vintage-tan/30 bg-vintage-cream/30 shadow-lux mx-auto">
                   {!imageLoaded[idx] && (
                     <div className="absolute inset-0 bg-vintage-cream/50 animate-pulse flex items-center justify-center">
                       <div className="w-8 h-8 border-2 border-vintage-tan/30 border-t-vintage-plum rounded-full animate-spin"></div>
                     </div>
                   )}
                   <img 
                    src={`/images/schedule-${idx + 1}.jpeg`}
                    className={`w-full h-full object-cover object-top hover:scale-105 transition-transform duration-1000 ${imageLoaded[idx] ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(prev => ({ ...prev, [idx]: true }))}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Try fallback to hero images
                      if (target.src.includes('schedule-')) {
                        target.src = HERO_IMAGES[idx % HERO_IMAGES.length];
                      } else {
                        // Final fallback - show placeholder
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex items-center justify-center h-full bg-vintage-cream/50">
                              <div class="text-center">
                                <Calendar class="mx-auto mb-2 text-vintage-plum/50" size={32} />
                                <p class="text-vintage-plum/50 text-sm">Image unavailable</p>
                              </div>
                            </div>
                          `;
                        }
                      }
                      setImageLoaded(prev => ({ ...prev, [idx]: true }));
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
      '/audio/wedding-music-trim.mp3' 
    ];
    
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.25;
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audio.muted = false; // Ensure not muted
    
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
    
    // Aggressive autoplay strategy
    const attemptAutoplay = async () => {
      try {
        // First try muted autoplay (browsers allow this)
        audio.muted = true;
        await audio.play();
        console.log('Muted autoplay successful');
        
        // Then unmute after a short delay
        setTimeout(() => {
          audio.muted = false;
          setMusicPlaying(true);
          console.log('Music unmuted and playing');
        }, 500);
      } catch (error) {
        console.log('Muted autoplay blocked, trying direct approach');
        
        // Try direct autoplay
        audio.muted = false;
        audio.play().then(() => {
          setMusicPlaying(true);
          console.log('Direct autoplay successful');
        }).catch(() => {
          console.log('Direct autoplay blocked, will try on interaction');
          
          // Multiple delayed attempts
          const delays = [100, 500, 1000, 2000, 3000];
          delays.forEach(delay => {
            setTimeout(() => {
              if (!musicPlaying) {
                audio.play().then(() => {
                  setMusicPlaying(true);
                  console.log(`Delayed autoplay successful at ${delay}ms`);
                }).catch(() => {
                  console.log(`Delayed autoplay failed at ${delay}ms`);
                });
              }
            }, delay);
          });
        });
      }
    };
    
    // Attempt autoplay immediately
    attemptAutoplay();
    
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
        console.log('Music autoplay prevented, will play on user interaction');
      }
    }
  };

  useEffect(() => {
    const startMusicOnInteraction = () => {
      if (audioRef.current && !musicPlaying) {
        audioRef.current.play().then(() => {
          setMusicPlaying(true);
        }).catch(() => {
          console.log('Music autoplay blocked');
        });
      }
      // Remove listeners after first attempt to avoid multiple triggers
      document.removeEventListener('click', startMusicOnInteraction);
      document.removeEventListener('touchstart', startMusicOnInteraction);
      document.removeEventListener('scroll', startMusicOnInteraction);
      document.removeEventListener('visibilitychange', startMusicOnInteraction);
    };

    // Add multiple event listeners for better autoplay chances
    document.addEventListener('click', startMusicOnInteraction);
    document.addEventListener('touchstart', startMusicOnInteraction);
    document.addEventListener('scroll', startMusicOnInteraction, { once: true });
    document.addEventListener('visibilitychange', startMusicOnInteraction);
    
    // Also try on mouse movement (less aggressive)
    const mouseHandler = () => {
      if (!musicPlaying && audioRef.current) {
        audioRef.current.play().then(() => {
          setMusicPlaying(true);
          document.removeEventListener('mousemove', mouseHandler);
        }).catch(() => {});
      }
    };
    setTimeout(() => {
      document.addEventListener('mousemove', mouseHandler, { once: true });
    }, 2000);
    
    return () => {
      document.removeEventListener('click', startMusicOnInteraction);
      document.removeEventListener('touchstart', startMusicOnInteraction);
      document.removeEventListener('scroll', startMusicOnInteraction);
      document.removeEventListener('visibilitychange', startMusicOnInteraction);
      document.removeEventListener('mousemove', mouseHandler);
    };
  }, [musicPlaying]);

  const handleRSVPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const answers: Record<string, string> = {};
    state.questions.forEach(q => answers[q.label] = fd.get(q.fieldId) as string);
    
    await API.updateState({ 
      newResponse: {
        name: fd.get('name'),
        attendingWith: fd.get('attendingWith'),
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
              className="absolute inset-0 w-full h-full object-cover object-top scale-100 grayscale opacity-50" 
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-vintage-bg/20 via-transparent to-vintage-bg/60" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.5 }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]"
        >
          <div className="space-y-8 md:space-y-12">
            <p className="text-vintage-plum font-serif italic text-xl md:text-3xl leading-relaxed text-visible-edge drop-shadow-lg">
              "I have found the one whom my soul loves"
              <br/>
              <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-vintage-plum/80 mt-6 inline-block">— Song of Solomon 3:4</span>
            </p>

            <div className="space-y-6">
              <p className="text-white/90 uppercase tracking-[0.8em] text-[10px] font-bold">Join us as we say</p>
              <h1 className="text-8xl md:text-[12rem] font-bold font-serif tracking-tighter select-none relative text-center text-vintage-plum drop-shadow-2xl">
                I DO
              </h1>
            </div>

            <div className="ornamental-line mx-auto max-w-sm" />
            
            <CountdownTimer targetDate="2026-05-16T12:00:00" />
          </div>
        </motion.div>
      </section>

      <div className="max-w-xl md:max-w-4xl mx-auto px-4 md:px-6 space-y-64 mt-32">
        
        {/* Journey Invitation - NATURAL DISCOVERY VIA SCROLL */}
        <section id="journey-invitation" className="relative z-10 -mt-16 -mx-2 md:mx-0">
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
                    opacity: 1,
                    filter: isJourneyHovered ? "grayscale(0%)" : "grayscale(100%)"
                  }} 
                  exit={{ opacity: 0 }} 
                  transition={{ duration: 1.5 }} 
                  className="w-full h-full object-cover object-top" 
                />
              </AnimatePresence>
          </div>
          
            <div className="relative flex flex-col items-center justify-center p-6 md:p-16 text-center space-y-8 md:space-y-6 z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-center md:gap-8 w-full mb-4 md:mb-0">
                <div className="space-y-2 md:space-y-1 md:text-center">
                  <p className="font-serif italic text-3xl md:text-6xl tracking-tight text-vintage-plum drop-shadow-lg text-center md:text-left">Geraldine Rumbidzai</p>
                  <p className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.4em] text-black text-center md:text-left">3rd born of Mr and Mrs Kagowa</p>
                </div>
                
                <div className="text-3xl md:text-5xl font-serif italic text-vintage-plum/40 text-center md:text-center my-4 md:my-0">— and —</div>

                <div className="space-y-2 md:space-y-1 md:text-center">
                  <p className="font-serif italic text-3xl md:text-6xl tracking-tight text-vintage-plum drop-shadow-lg text-center md:text-left">Brighton Tapiwa</p>
                  <p className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.4em] text-black text-center md:text-left">1st born of Mr and Mrs Mutsekwa</p>
                </div>
              </div>
              
              <div className="ornamental-line max-w-xs mb-2 md:mb-0" />

              <p className="text-xl md:text-2xl font-normal leading-relaxed max-w-lg tracking-wide text-vintage-plum/90 italic drop-shadow-md mb-4 md:mb-0">
                Together with their families invite you to celebrate their marriage
              </p>
　　 　 　 　
              <div className="space-y-2 md:space-y-1 mb-4 md:mb-0">
                <p className="text-3xl md:text-5xl font-serif italic text-vintage-plum drop-shadow-lg"><span className="md:hidden">Sat</span><span className="hidden md:inline">Saturday</span> 16 May 2026</p>
                <p className="text-[13px] md:text-[14px] font-bold uppercase tracking-[0.6em] text-black">12 Noon Sharp</p>
              </div>

              <div className="pt-3 md:pt-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.4em] text-black mb-1">The Venue</p>
                <p className="text-3xl md:text-4xl font-serif italic text-vintage-plum drop-shadow-lg">Umwinzii, Harare</p>
              </div>
　
　
              {/* Compact Quick Info Bar */}
              <div className="mt-3 pt-3 border-t border-vintage-plum/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="space-y-1">
                  <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-black">RSVP Contact</p>
                  <a href="tel:+263772100875" className="text-base font-serif italic text-black hover:text-vintage-plum transition-colors cursor-pointer">Yvonne • +263 7 72100875</a>
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-black">Dress Code</p>
                  <p className="text-base font-serif italic text-black">Black Tie</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-black">RSVP By</p>
                  <p className="text-base font-serif italic text-black">28 Feb 2026</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Gift Information Section */}
        <section className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1.2 }}
            className="bg-gradient-to-br from-vintage-cream/80 to-vintage-bg/40 rounded-[3rem] p-8 md:p-16 border border-vintage-tan/30 shadow-lux relative overflow-hidden"
          >
            {/* Decorative corner elements */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-vintage-plum/20 rounded-tl-2xl" />
            <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-vintage-plum/20 rounded-tr-2xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-vintage-plum/20 rounded-bl-2xl" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-vintage-plum/20 rounded-br-2xl" />
            
            <div className="relative z-10 text-center space-y-8">
              {/* Gift Icon */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vintage-plum/10 to-vintage-tan/10 flex items-center justify-center border-2 border-vintage-tan/30 shadow-inner">
                  <HeartHandshake className="text-vintage-plum" size={32} />
                </div>
                <h3 className="text-3xl md:text-4xl font-serif italic text-vintage-plum">Gift Registry</h3>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vintage-plum/10 to-vintage-tan/10 flex items-center justify-center border-2 border-vintage-tan/30 shadow-inner">
                  <HeartHandshake className="text-vintage-plum" size={32} />
                </div>
              </div>
              
              {/* Main Message */}
              <div className="max-w-2xl mx-auto space-y-6">
                <p className="text-xl md:text-2xl font-serif italic text-vintage-plum/90 leading-relaxed">
                  Your presence at our celebration is the greatest gift we could ever wish for.
                </p>
                
                <div className="ornamental-line max-w-xs mx-auto" />
                
                <p className="text-lg md:text-xl font-light text-vintage-plum/80 leading-relaxed">
                  For those who wish to honor us with a gift, we would graciously appreciate cash contributions to help us begin our new journey together.
                </p>
                
                <div className="bg-vintage-plum/5 rounded-2xl p-6 md:p-8 border border-vintage-tan/20">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Ribbon className="text-vintage-plum" size={20} />
                    <span className="text-sm font-bold uppercase tracking-[0.4em] text-vintage-plum">Gift Details</span>
                    <Ribbon className="text-vintage-plum" size={20} />
                  </div>
                  <p className="text-base md:text-lg text-vintage-plum/80 italic">
                    Elegant envelopes and a gift register will be available at the venue for your convenience. Parents and close family members will have the privilege to share their heartfelt speeches and present their gifts during the celebration.
                  </p>
                </div>
                
                <p className="text-sm md:text-base font-light text-vintage-plum/60 italic">
                  With love and deepest gratitude,<br />
                  Geraldine & Tapiwa
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Transportation Details */}
        <section className="relative z-10">
          <div className="bg-vintage-cream/60 rounded-[2rem] p-8 md:p-12 border border-vintage-tan/30 text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-vintage-plum/10 flex items-center justify-center">
                <Car className="text-vintage-plum" size={20} />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif italic text-vintage-plum">Transportation</h3>
            </div>
            <p className="text-vintage-plum/80 italic text-base md:text-lg">Shuttles available from town and residences</p>
          </div>
        </section>

        {/* Wedding Details Section */}
        <section className="space-y-32">
          {/* Interactive Timeline */}
          <InteractiveTimeline schedule={state.schedule} />
        </section>
      </div>

      {/* Simple Footer */}
      <footer className="mt-32 border-t border-vintage-tan/20 bg-vintage-cream/10 py-16 text-center">
        <p className="text-vintage-plum/60 font-serif text-lg italic px-6">
          "Love, laughter and happily ever after with you 💕"
        </p>
      </footer>

      {/* Floating RSVP Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRSVP(true)} 
          disabled={!state.rsvpOpen}
          className={`py-4 px-8 rounded-full shadow-lux font-bold tracking-[0.4em] uppercase text-[10px] flex items-center justify-center gap-3 border-2 ${state.rsvpOpen ? 'bg-vintage-plum text-white border-vintage-tan' : 'bg-vintage-cream text-vintage-plum/40 border-vintage-plum/10'}`}
        >
          {state.rsvpOpen ? <><Zap size={16} fill="currentColor" /> RSVP</> : 'CLOSED'}
        </motion.button>
      </div>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-8 z-40">
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ y: -2 }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="w-12 h-12 rounded-full bg-vintage-cream/80 border-2 border-vintage-tan flex items-center justify-center shadow-lux"
        >
          <ChevronDown className="text-vintage-plum" size={20} />
        </motion.button>
      </div>
      <AnimatePresence>
        {showRSVP && (
          <div className="fixed inset-0 z-[300] bg-vintage-plum/85 backdrop-blur-xl flex items-center justify-center p-2 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-vintage-cream w-full max-w-md rounded-[1.5rem] p-4 md:p-6 shadow-lux border border-vintage-tan/30 relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setShowRSVP(false)} className="absolute top-2 right-2 w-8 h-8 bg-vintage-plum text-white rounded-full flex items-center justify-center shadow-lg z-10"><X size={16} /></button>
              
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-serif italic text-vintage-plum mb-1">The RSVP</h3>
                <p className="text-vintage-tan text-[8px] font-bold uppercase tracking-[0.4em]">Kindly respond by Feb 2026</p>
              </div>
              
              <form onSubmit={handleRSVPSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-vintage-plum ml-3">Full Name</label>
                  <input name="name" required className="w-full bg-white/40 border border-vintage-tan/30 rounded-full p-3 text-md font-serif italic" placeholder="..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-vintage-plum ml-3">Who are you attending with?</label>
                  <input name="attendingWith" required className="w-full bg-white/40 border border-vintage-tan/30 rounded-full p-3 text-md font-serif italic" placeholder="Names of guests you're coming with..." />
                </div>

                {state.questions.map(q => (
                  <div key={q.fieldId} className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-vintage-plum ml-3">{q.label}</label>
                    <input name={q.fieldId} className="w-full bg-white/40 border border-vintage-tan/30 rounded-full p-3 text-md font-serif italic" placeholder="..." />
                  </div>
                ))}
                
                <button type="submit" className="w-full py-3 bg-vintage-plum text-white rounded-full font-bold uppercase tracking-[0.5em] text-xs shadow-lux border border-vintage-tan/30">
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
                  <p className="text-vintage-tan font-bold mt-1 text-[10px] uppercase tracking-[0.2em]">{r.attendingWith || 'Attending alone'}</p>
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