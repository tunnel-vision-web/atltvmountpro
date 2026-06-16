import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import usePageTitle from "@/hooks/usePageTitle";
import {
  Search,
  Calendar,
  Clock,
  Navigation,
  MessageSquare,
  History,
  MapPin,
  ChevronRight,
  Star,
  Send,
  Plus,
  CheckCircle2,
  Tv,
  Wrench,
  Hammer,
  Paintbrush,
  DollarSign,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";

const MOCK_MESSAGES = [
  { sender: "tech", text: "Hi! I am Alex from Atlanta TV Mount Pro. I am loading your Full-Motion wall mount and HDMI cables into the truck now.", time: "12:30 PM" },
  { sender: "customer", text: "Great, thanks! Just a heads up, the gate code is #4821. You can park in the driveway.", time: "12:32 PM" },
  { sender: "tech", text: "Received! Gate code #4821. I'm hitting the road now and should be there in about 10 minutes.", time: "12:35 PM" }
];

const MOCK_GPS_PATH = [
  { x: 40, y: 60, status: "Departed Buckhead depot" },
  { x: 90, y: 80, status: "Driving down Peachtree Rd" },
  { x: 130, y: 110, status: "Passing Piedmont Park (6 mins away)" },
  { x: 180, y: 90, status: "Turning onto Ponce De Leon Ave" },
  { x: 230, y: 125, status: "Approaching Virginia Highland (2 mins away)" },
  { x: 280, y: 115, status: "Technician has arrived at your location!" },
];

export default function CustomerAppPage() {
  usePageTitle("Customer App - Atlanta TV Mount Pro");

  const [activeTab, setActiveTab] = useState("track"); // 'book' | 'track' | 'history'
  const [gpsStep, setGpsStep] = useState(0);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [simulatedBookings, setSimulatedBookings] = useState([]);
  
  const chatEndRef = useRef(null);

  // Auto-animate GPS tech truck tracker
  useEffect(() => {
    const interval = setInterval(() => {
      setGpsStep((prev) => (prev < MOCK_GPS_PATH.length - 1 ? prev + 1 : 0));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load history from local storage bookings
  useEffect(() => {
    const syncHistory = () => {
      const stored = JSON.parse(localStorage.getItem("atltvmountpro_local_bookings") || "[]");
      const invoices = JSON.parse(localStorage.getItem("atltv_invoices") || "[]");

      const mapped = stored.map((b) => {
        const inv = invoices.find(i => i.bookingId === b.id) || {};
        return {
          id: b.id,
          service_type: b.service_type,
          preferred_date: b.preferred_date,
          status: b.status,
          total: inv.total || 128, // fallback
          invoiceNumber: inv.number || "INV-MOCK",
          hardwareText: b.hardwareItems ? b.hardwareItems.map(h => h.name).join(", ") : "None",
        };
      });
      setSimulatedBookings(mapped);
    };
    
    syncHistory();
    const interval = setInterval(syncHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = { sender: "customer", text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");

    // Simulate tech reply after 2.5 seconds
    setTimeout(() => {
      const techReplies = [
        "Sounds good! Let me know if you need me to bring any extra HDMI covers.",
        "Understood, I am en route now. See you shortly!",
        "Excellent. I have the TV wall mount and anchors ready.",
        "On it! Map route says I'm 5 minutes away."
      ];
      const randomReply = techReplies[Math.floor(Math.random() * techReplies.length)];
      const techMsg = { sender: "tech", text: randomReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages((prev) => [...prev, techMsg]);
      toast.success("New message from Alex Mercer (Tech)");
    }, 2500);
  };

  const getGpsStatusText = () => {
    return MOCK_GPS_PATH[gpsStep].status;
  };

  return (
    <div className="bg-slate-950 min-h-screen py-10 flex items-center justify-center px-4">
      {/* ── DEVICE WRAPPER (ANDROID MOCK) ── */}
      <div className="relative w-full max-w-[390px] h-[780px] bg-zinc-900 rounded-[52px] border-[12px] border-zinc-800 shadow-2xl overflow-hidden flex flex-col outline outline-2 outline-white/5">
        
        {/* Android Punch Hole Camera */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 border border-zinc-900" />
        
        {/* Status Bar */}
        <div className="pt-2 px-6 flex justify-between items-center text-[10px] text-zinc-400 font-semibold z-10 select-none bg-zinc-900 shrink-0">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex gap-1 items-center">
            <span className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-primary font-bold">5G</span>
            <div className="w-4 h-2 bg-zinc-700 rounded-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 bg-primary w-[85%]" />
            </div>
          </div>
        </div>

        {/* ── APP HEADER ── */}
        <header className="pt-4 pb-3 px-5 border-b border-white/5 bg-zinc-900 flex justify-between items-center z-10 shrink-0">
          <div>
            <span className="text-[9px] uppercase font-bold text-primary tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-primary" /> Atlanta TV Mount Pro
            </span>
            <h1 className="text-sm font-black text-white">
              {activeTab === "track" && "Track Technician"}
              {activeTab === "book" && "Book Handyman"}
              {activeTab === "history" && "Receipts & History"}
            </h1>
          </div>
        </header>

        {/* ── APP BODY ── */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 flex flex-col pb-20">
          <AnimatePresence mode="wait">
            
            {/* TAB: GPS TRACKER */}
            {activeTab === "track" && (
              <motion.div
                key="track"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col flex-1"
              >
                {/* Simulated Map Container */}
                <div className="relative w-full h-[240px] bg-zinc-900 overflow-hidden border-b border-white/5">
                  
                  {/* SVG City Road Layout Map Mock */}
                  <svg className="w-full h-full text-zinc-700 filter opacity-60" viewBox="0 0 350 240">
                    {/* Grid streets */}
                    <path d="M10 20 L340 20 M10 80 L340 80 M10 140 L340 140 M10 200 L340 200" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
                    <path d="M40 10 L40 230 M130 10 L130 230 M230 10 L230 230 M310 10 L310 230" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
                    {/* diagonal highway */}
                    <path d="M0 220 L350 30" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
                    <path d="M0 220 L350 30" stroke="#e6b377" strokeWidth="1.5" strokeDasharray="5 4" />
                    
                    {/* Parks & building blocks */}
                    <rect x="55" y="35" width="60" height="35" fill="#14532d" opacity="0.2" rx="4" />
                    <rect x="145" y="95" width="70" height="35" fill="#27272a" rx="4" />
                    <rect x="245" y="35" width="50" height="35" fill="#27272a" rx="4" />
                    <rect x="55" y="155" width="60" height="35" fill="#27272a" rx="4" />

                    {/* Customer Destination Marker */}
                    <circle cx="280" cy="115" r="10" fill="#3b82f6" opacity="0.3" />
                    <circle cx="280" cy="115" r="4" fill="#3b82f6" />
                    <text x="275" y="100" fill="#3b82f6" fontSize="8" fontWeight="bold">My Property</text>
                  </svg>

                  {/* Dynamic Tech Truck Indicator */}
                  <motion.div
                    animate={{ x: MOCK_GPS_PATH[gpsStep].x, y: MOCK_GPS_PATH[gpsStep].y }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    className="absolute -ml-3 -mt-3 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg z-20 border border-white/20"
                  >
                    <Navigation className="w-4.5 h-4.5 rotate-90 animate-pulse" />
                  </motion.div>

                  {/* GPS Floating Status Badge */}
                  <div className="absolute bottom-3 left-3 right-3 bg-zinc-950/90 border border-white/10 px-3 py-2 rounded-xl text-[10px] text-white flex items-center justify-between shadow-md backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" /> {getGpsStatusText()}
                    </span>
                    <span className="text-emerald-400 font-bold shrink-0">ETA: {Math.max(1, 6 - gpsStep)} mins</span>
                  </div>
                </div>

                {/* Tech Profile Panel */}
                <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-zinc-900/40">
                  <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
                      alt="Tech profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">Alex Mercer</p>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Handyman & Mounting Specialist</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-primary font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-primary text-primary" /> 4.93
                      </span>
                      <span className="text-[9px] text-zinc-500">• 84 completed jobs</span>
                    </div>
                  </div>
                  <a href="tel:770-374-3203" className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all border border-white/5">
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>

                {/* Live Chat Widget */}
                <div className="flex-1 flex flex-col p-4 bg-zinc-950/20 max-h-[300px]">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5 pl-1">
                    On-Site Dispatch Chat
                  </p>
                  
                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mb-3">
                    {messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${m.sender === "customer" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                            m.sender === "customer"
                              ? "bg-primary text-primary-foreground rounded-tr-none"
                              : "bg-zinc-800/80 text-white rounded-tl-none border border-white/5"
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[8px] text-zinc-500 mt-1 pl-1 pr-1">{m.time}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Message technician..."
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl transition-all shrink-0 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB: BOOK SERVICES & ACCESSORIES */}
            {activeTab === "book" && (
              <motion.div
                key="book"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-4"
              >
                <div className="bg-zinc-900 border border-white/5 p-5 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                    <Tv className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Need a Service booked?</h3>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                      Schedule professional TV mounting or handyman repairs directly on the main site.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Trigger main booking modal via context
                      toast.info("Opening Booking Modal on the website...");
                      window.parent.postMessage({ type: "open-booking" }, "*");
                    }}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold py-2.5 rounded-xl transition-all"
                  >
                    Launch Booking Modal
                  </button>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Hardware Delivery Catalog</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 border border-white/5 p-3 rounded-xl space-y-1.5 text-[10px]">
                      <p className="font-semibold text-white truncate">Full Motion Wall Mount</p>
                      <p className="text-primary font-bold">$89</p>
                      <p className="text-zinc-500">Dual arm, swivels up to 90 degrees.</p>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 p-3 rounded-xl space-y-1.5 text-[10px]">
                      <p className="font-semibold text-white truncate">Tilting Wall Bracket</p>
                      <p className="text-primary font-bold">$59</p>
                      <p className="text-zinc-500">Sleek tilt mount to reduce glares.</p>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 p-3 rounded-xl space-y-1.5 text-[10px]">
                      <p className="font-semibold text-white truncate">HDMI 2.1 Cable (10ft)</p>
                      <p className="text-primary font-bold">$19</p>
                      <p className="text-zinc-500">Supports 4K/120Hz & 8K displays.</p>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 p-3 rounded-xl space-y-1.5 text-[10px]">
                      <p className="font-semibold text-white truncate">Cable concealing kit</p>
                      <p className="text-primary font-bold">$69</p>
                      <p className="text-zinc-500">In-wall double grommet power kit.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: RECEIPTS & BOOKING HISTORY */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-3"
              >
                {simulatedBookings.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="p-4 bg-white/5 rounded-2xl w-fit mx-auto text-zinc-500">
                      <History className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">No booking history</p>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Any completed appointments and invoices will be cataloged here.
                      </p>
                    </div>
                  </div>
                ) : (
                  simulatedBookings.map((b, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900 border border-white/5 p-4 rounded-xl space-y-2.5 text-xs text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-primary/25 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                          {b.service_type}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          b.status === "Completed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-zinc-400 space-y-1">
                        <p>Date: {b.preferred_date}</p>
                        <p>Invoice: {b.invoiceNumber}</p>
                        <p className="text-primary">Hardware: {b.hardwareText}</p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                        <p className="font-black text-white">${b.total}</p>
                        {b.status === "Completed" && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Digital Receipt Generated
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* ── APP FOOTER / NAVIGATION ── */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-zinc-900 border-t border-white/5 flex justify-around items-center z-10">
          <button
            onClick={() => setActiveTab("track")}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeTab === "track" ? "text-primary font-bold" : "text-zinc-500 hover:text-white"
            }`}
          >
            <Navigation className="w-4.5 h-4.5" />
            <span>Track Tech</span>
          </button>
          <button
            onClick={() => setActiveTab("book")}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeTab === "book" ? "text-primary font-bold" : "text-zinc-500 hover:text-white"
            }`}
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Book</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeTab === "history" ? "text-primary font-bold" : "text-zinc-500 hover:text-white"
            }`}
          >
            <History className="w-4.5 h-4.5" />
            <span>Receipts</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
