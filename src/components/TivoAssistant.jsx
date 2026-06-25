import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, X, Send, HelpCircle, ArrowRight, CornerDownLeft, Sparkles } from "lucide-react";
import tivoAvatar from "@/assets/tivo_flat_icon_1782228698511.png";
import { useUI } from "@/contexts/UIContext";

const SUGGESTIONS = {
  // Admin Contexts
  overview: [
    { label: "Show revenue breakdown", action: "changeTab:finance", text: "Show me the finance stats" },
    { label: "View projects list", action: "changeTab:projects", text: "Go to project listings" },
    { label: "Who is the top tech?", action: "query", text: "Who is the top technician?" },
  ],
  projects: [
    { label: "Add New Project", action: "openNewProject", text: "I want to add a new project" },
    { label: "How to set featured?", action: "query", text: "How do I set a project as featured on the landing page?" },
    { label: "Edit sorting order", action: "query", text: "How does project sorting order work?" },
  ],
  orders: [
    { label: "Show Pending Jobs", action: "filterOrders:pending", text: "Filter bookings by pending status" },
    { label: "How to bill client?", action: "query", text: "How do I create and send an invoice?" },
    { label: "View earnings ledger", action: "changeTab:finance", text: "Open the finance earnings tab" },
  ],
  support: [
    { label: "Show Disputed Holds", action: "filterSupport:disputed", text: "Filter support tickets by dispute status" },
    { label: "Explain frozen escrow", action: "query", text: "Why is commission frozen for disputes?" },
    { label: "View workmanship issues", action: "query", text: "How to resolve support tickets?" },
  ],
  team: [
    { label: "Invite Technician", action: "openInviteTech", text: "Invite a new technician to join the team" },
    { label: "How is pay calculated?", action: "query", text: "Explain how technician payout and commission works" },
  ],
  crm: [
    { label: "Sync All Leads", action: "triggerSync", text: "Synchronize all leads to Intermaven CRM" },
    { label: "Webhook Logs", action: "query", text: "Where can I view client webhook sync logs?" },
    { label: "Open Partner Portal", action: "changeTab:partner", text: "Take me to partner apps tab" },
  ],
  store: [
    { label: "Show Uniform Orders", action: "filterStore:uniform", text: "Show technician uniform onboarding orders" },
    { label: "Deduct uniform cost", action: "query", text: "Explain uniform paycheck deduction ledger entries" },
    { label: "Add Product Listing", action: "openNewProduct", text: "Add a new e-commerce product" },
  ],
  partner: [
    { label: "OIDC SSO Setup", action: "query", text: "Explain the OpenID Connect Single Sign-On flow" },
    { label: "Reload Partner App", action: "reloadIframe", text: "Reload the embedded micro-frontend iframe" },
  ],
  
  // Customer Contexts (Public Pages)
  home: [
    { label: "Estimate Quote Cost", action: "openQuoteModal", text: "How much does it cost to mount a TV?" },
    { label: "Book TV Mounting", action: "openBookingModal", text: "I want to book a TV mounting service" },
    { label: "View Our Services", action: "navigate:/services", text: "What services do you offer?" },
  ],
  services: [
    { label: "Do you hide wires?", action: "query", text: "Do you hide the TV power wires?" },
    { label: "Which mount is best?", action: "query", text: "Which TV mount type should I choose?" },
    { label: "Book Appointment", action: "openBookingModal", text: "I want to schedule an installation" },
  ],
  contact: [
    { label: "Business Hours", action: "query", text: "What are your operating hours?" },
    { label: "Service Locations", action: "query", text: "What cities do you service?" },
    { label: "File Repair Request", action: "navigate:/support", text: "I need to request support or repair work" },
  ],
  store_public: [
    { label: "E-Commerce TV Mounts", action: "query", text: "What wall mounts do you sell?" },
    { label: "Shipping Options", action: "query", text: "What are your delivery shipping speeds?" },
    { label: "Technician Sign In", action: "openAuthModal", text: "How do I log in to the system?" },
  ],
  support_public: [
    { label: "How to file ticket?", action: "query", text: "How do I submit a workmanship support ticket?" },
    { label: "Workmanship Warranty", action: "query", text: "Explain the 48-hour escrow safety guarantee" },
  ],
  dashboard_public: [
    { label: "Earnings Deductions", action: "query", text: "How do paycheck deductions for uniforms work?" },
    { label: "How-To Guides", action: "query", text: "Where can I find instructions to complete onboarding?" },
  ],
};

export default function TivoAssistant({ activeTab = "overview", onAction }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { openQuoteModal, openBookingModal, openAuthModal } = useUI();

  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "tivo",
      text: "Beep boop! Hello! I am Tivo, your digital TV-headed assistant. 📺🔧 I'm here to help you navigate, answer installation questions, or manage the platform. Ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const isAdminPath = location.pathname.startsWith("/admin");
  const isSimulatorPath = location.pathname.startsWith("/apps/");

  // Safety Switch: Hide the global Tivo Assistant instance on admin or simulator pages
  // if no action callback is bound (preventing duplicate triggers).
  if ((isAdminPath || isSimulatorPath) && !onAction) {
    return null;
  }

  // Welcome Bubble Trigger: Pop up the bubble after 3 seconds of load time if drawer is closed
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowWelcomeBubble(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Resolve active section code
  let resolvedSection = activeTab;
  if (!isAdminPath) {
    const path = location.pathname;
    if (path === "/" || path === "") resolvedSection = "home";
    else if (path.startsWith("/services")) resolvedSection = "services";
    else if (path.startsWith("/contact")) resolvedSection = "contact";
    else if (path.startsWith("/store")) resolvedSection = "store_public";
    else if (path.startsWith("/support")) resolvedSection = "support_public";
    else if (path.startsWith("/dashboard") || path.startsWith("/join")) resolvedSection = "dashboard_public";
    else resolvedSection = "home";
  }

  const activeSuggestions = SUGGESTIONS[resolvedSection] || [
    { label: "How does CRM Sync work?", action: "query", text: "Explain partner CRM webhook synchronization" },
    { label: "SSO Login flow", action: "query", text: "Explain OpenID Connect login" },
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Context-aware alert when path changes
  useEffect(() => {
    if (isOpen && !isAdminPath) {
      const pathFriendlyNames = {
        "/": "Homepage",
        "/services": "Services page",
        "/about": "About page",
        "/team": "Team page",
        "/contact": "Contact page",
        "/store": "Hardware Shop",
        "/support": "Support Desk",
        "/dashboard": "Recruit Dashboard",
        "/join": "Recruiter Portal",
        "/projects": "Project Showcases",
      };
      
      const pathName = pathFriendlyNames[location.pathname] || "Atlanta TV Mount";
      
      // Inject path change system alert
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: "system",
          text: `Context shifted to: ${pathName}`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [location.pathname, isOpen]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const newUserMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulated LLM generation delay
    setTimeout(() => {
      const replyText = getTivoResponse(text, resolvedSection);
      const newTivoMessage = {
        id: `tivo-${Date.now()}`,
        sender: "tivo",
        text: replyText,
        timestamp: new Date(),
      };
      
      setIsTyping(false);
      setMessages((prev) => [...prev, newTivoMessage]);
    }, 600);
  };

  const getTivoResponse = (input, section) => {
    const query = input.toLowerCase();

    // General Greetings
    if (query.includes("hi") || query.includes("hello") || query.includes("hey") || query.includes("tivo")) {
      return "Hello! I am Tivo. 📺🤖 How can I help you today? Ask me about mounting types, hiding wires, shipping speeds, or support warranties.";
    }

    // Customer specific needs mappings
    if (query.includes("hide") || query.includes("conceal") || query.includes("wire") || query.includes("cable")) {
      return "We offer full cable management! You can select **On-Wall concealment** (using professional wire cover sleeves) or **In-Wall concealment** (running power and HDMI cords behind the drywall). Select your wire choice in the booking step.";
    }

    if (query.includes("mount") || query.includes("bracket") || query.includes("choose")) {
      return "We install three main mount types:\n1. **Full Motion (Swivel)**: Tilts and rotates, perfect for corner mounts and large rooms.\n2. **Tilting**: Great above fireplaces or high walls to reduce glare.\n3. **Fixed (Flat)**: Sits flush to the wall for a thin gallery appearance. We also supply heavy-duty wall mounts in our public shop!";
    }

    if (query.includes("drywall") || query.includes("hole") || query.includes("patch") || query.includes("repair")) {
      return "Our technicians carry patching compound, sandpapers, and priming tools. If we need to route cables behind your drywall, we patch the cuts cleanly. We can also repair previous mounting holes.";
    }

    if (query.includes("hours") || query.includes("time") || query.includes("schedule") || query.includes("days")) {
      return "We operate **7 days a week** from **8:00 AM to 8:00 PM**. You can book online anytime, select a date, and pick a preferred arrival window (Morning, Mid-day, Afternoon). We notify you when the technician is en route!";
    }

    if (query.includes("warranty") || query.includes("escrow") || query.includes("guarantee") || query.includes("protect")) {
      return "Every job is protected by our **48-hour workmanship guarantee**. When you make a booking, the payment is held in escrow. If any damage or issue occurs, file a support ticket within 48 hours to freeze the escrow payout until a technician resolves it.";
    }

    if (query.includes("location") || query.includes("where") || query.includes("area") || query.includes("city")) {
      return "We are based in **Atlanta, GA**, serving a 35-mile radius including Buckhead, Midtown, Alpharetta, Marietta, Smyrna, and Decatur. No travel fees within our service circle!";
    }

    if (query.includes("shipping") || query.includes("delivery") || query.includes("delivery speeds")) {
      return "For hardware orders, we offer:\n- **Standard**: 3-5 business days ($4.99)\n- **Next Day**: 1-2 business days ($14.99)\n- **Same Day**: Order before 12 PM for same-day arrival ($24.99).";
    }

    if (query.includes("uniform") || query.includes("deduction") || query.includes("paycheck")) {
      return "For recruits, uniform ordering (3 polo shirts + name tag) is step 6 of the checklist. The $30 base cost + selected shipping is logged as a paycheck deduction and automatically subtracted from your first earnings sheet.";
    }

    if (query.includes("sso") || query.includes("sync") || query.includes("webhook")) {
      return "Atlanta TV Mount is a partner platform linked with Intermaven. You can log in using your Intermaven account (SSO), and all booking inquiries or tickets are automatically synced to the unified partner CRM.";
    }

    // Context-sensitive fallbacks
    switch (section) {
      case "home":
        return "I can help you get an instant quote or schedule a mounting appointment. Try clicking 'Estimate Quote Cost' or 'Book TV Mounting' above!";
      case "services":
        return "Check out our service items. We mount TVs from 32\" to 100\" on drywall, brick, concrete, and wood studs. Tell me what wall surface you have!";
      case "store_public":
        return "Welcome to the shop! We carry premium wall mounts, soundbar brackets, and technician uniforms. Let me know if you need checkout support.";
      case "support_public":
        return "Need assistance? If you have an active booking, submit your issue here and our support agents will help you right away.";
      default:
        return "I am Tivo! Feel free to ask about our TV mounting packages, wire concealment, service locations, or booking process.";
    }
  };

  const handleSuggestionClick = (sug) => {
    const newUserMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: sug.text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    if (sug.action === "query") {
      setIsTyping(true);
      setTimeout(() => {
        const replyText = getTivoResponse(sug.text, resolvedSection);
        const newTivoMessage = {
          id: `tivo-${Date.now()}`,
          sender: "tivo",
          text: replyText,
          timestamp: new Date(),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, newTivoMessage]);
      }, 500);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        let actionConfirm = "Action completed.";
        
        if (sug.action.startsWith("changeTab:")) {
          onAction(sug.action);
          actionConfirm = `Navigated to the admin ${sug.action.split(":")[1].toUpperCase()} section.`;
        } else if (sug.action.startsWith("navigate:")) {
          const dest = sug.action.split(":")[1];
          navigate(dest);
          actionConfirm = `Navigated to page: ${dest}`;
        } else if (sug.action === "openBookingModal") {
          openBookingModal();
          actionConfirm = "Opened the booking scheduler modal! Select your TV size and add-on services.";
        } else if (sug.action === "openQuoteModal") {
          openQuoteModal();
          actionConfirm = "Opened the quote cost estimator modal! Click packages to see price estimates.";
        } else if (sug.action === "openAuthModal") {
          openAuthModal('login');
          actionConfirm = "Opened the registration / sign-in screen.";
        } else {
          if (onAction) {
            onAction(sug.action);
          }
          if (sug.action === "triggerSync") {
            actionConfirm = "CRM Webhook Sync triggered! Lead data synchronized to Intermaven.";
          } else if (sug.action === "reloadIframe") {
            actionConfirm = "Embedded Partner App Iframe reloaded.";
          } else if (sug.action === "openNewProject") {
            actionConfirm = "Opened the Add New Project dialog modal.";
          } else if (sug.action === "openInviteTech") {
            actionConfirm = "Opened the Recruit/Technician Invitation modal.";
          } else if (sug.action === "openNewProduct") {
            actionConfirm = "Opened the Add Product listing form.";
          }
        }
        
        const newTivoMessage = {
          id: `tivo-${Date.now()}`,
          sender: "tivo",
          text: `Beep! ${actionConfirm}`,
          timestamp: new Date(),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, newTivoMessage]);
      }, 500);
    }
  };

  return (
    <>
      {/* FLOATING WELCOME GREETING SPEECH BUBBLE */}
      {showWelcomeBubble && !isOpen && (
        <div className="fixed bottom-20 left-6 z-50 bg-[#0f172a] border border-slate-800 p-3.5 rounded-[3px] text-xs text-slate-200 shadow-2xl w-[290px] animate-slide-up flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex gap-2 items-center">
              <img src={tivoAvatar} alt="Tivo" className="w-5.5 h-5.5 object-contain rounded-[3px] bg-slate-950 p-0.5 border border-slate-800" />
              <span className="font-bold text-slate-100 text-[11px] tracking-wide">Tivo Assistant</span>
            </div>
            <button 
              onClick={() => setShowWelcomeBubble(false)}
              className="text-slate-400 hover:text-slate-100 p-0.5 rounded hover:bg-slate-800 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Hey! 📺 I'm Tivo. I can help you book TV mounting, estimate costs, or answer support and setup questions. Tap here to chat!
          </p>
          <button
            onClick={() => {
              setIsOpen(true);
              setShowWelcomeBubble(false);
            }}
            className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 mt-1 transition-colors self-start"
          >
            Start Chatting <ArrowRight size={10} />
          </button>
          {/* Triangle pointer pointing down towards button */}
          <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-800" />
          <div className="absolute -bottom-1.5 left-[25px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#0f172a]" />
        </div>
      )}

      {/* FLOATING ACTION TRIGGER (MODERN PILL-SHAPED BUTTON TO INDICATE CHAT ASSISTANT AT FIRST GLANCE) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowWelcomeBubble(false);
        }}
        className="fixed bottom-6 left-6 z-50 h-12 bg-slate-900 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 text-white rounded-[3px] shadow-2xl flex items-center gap-2.5 px-4 transition-all duration-200 group focus:outline-none hover:scale-[1.03]"
        title="Tivo Chat Assistant"
      >
        {isOpen ? (
          <>
            <X size={18} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-500">Close Assistant</span>
          </>
        ) : (
          <>
            <div className="relative flex items-center justify-center">
              <img src={tivoAvatar} alt="Tivo Avatar" className="w-8 h-8 object-contain rounded-[3px]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <span className="text-xs font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
              Ask Tivo <MessageSquare size={12} className="text-amber-500 animate-pulse" />
            </span>
          </>
        )}
      </button>

      {/* CHAT DRAWER PANEL (SLIDES FROM THE LEFT SIDE FOR NATURAL CONTEXT WITH BUTTON) */}
      {isOpen && (
        <div className="fixed top-0 left-0 h-full w-[380px] max-w-full bg-[#0a0f1d] border-r border-slate-800 shadow-2xl z-[9999] flex flex-col font-sans text-slate-200 animate-slide-in-left">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={tivoAvatar} alt="Tivo" className="w-9 h-9 object-contain rounded-[3px] bg-slate-950 p-0.5 border border-slate-800" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-950 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-100">Tivo Assistant</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[3px] bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20">AI</span>
                </div>
                <p className="text-[10px] text-slate-400">Offline Fallback NLP Engine</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-100 p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Context Banner */}
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Context: <strong className="text-amber-500 font-semibold">{resolvedSection.toUpperCase()}</strong></span>
            <span className="flex items-center gap-1"><Sparkles size={8} className="text-amber-500 animate-pulse" /> Client Assistance</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0f1d] scrollbar-thin">
            {messages.map((msg) => {
              if (msg.sender === "system") {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="text-[9px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-[3px] bg-slate-800/40 text-slate-500 border border-slate-800/60">
                      {msg.text}
                    </div>
                  </div>
                );
              }
              
              const isTivo = msg.sender === "tivo";
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isTivo ? "justify-start" : "justify-end"}`}>
                  {isTivo && (
                    <img src={tivoAvatar} alt="T" className="w-6 h-6 object-contain rounded-[3px] bg-slate-950 p-0.5 border border-slate-800 self-start" />
                  )}
                  <div className={`max-w-[80%] p-3 rounded-[3px] text-xs leading-relaxed ${
                    isTivo 
                      ? "bg-slate-900 border border-slate-800 text-slate-200" 
                      : "bg-[#10b981] text-slate-950 font-medium"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <img src={tivoAvatar} alt="T" className="w-6 h-6 object-contain rounded-[3px] bg-slate-950 p-0.5 border border-slate-800 self-start" />
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-[3px] flex items-center gap-1 w-16 justify-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Suggestions (Chips) */}
          <div className="p-3 bg-[#0d1428]/80 border-t border-slate-800 space-y-2">
            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 px-1">
              <HelpCircle size={10} className="text-amber-500" /> Suggested for this Page:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto p-0.5">
              {activeSuggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(sug)}
                  className="text-[10px] bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-slate-300 font-medium py-1 px-2 rounded-[3px] flex items-center gap-1 transition-all duration-100"
                >
                  <span>{sug.label}</span>
                  <ArrowRight size={8} className="text-slate-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer Input */}
          <div className="p-3 border-t border-slate-800 bg-[#0f172a]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-2 bg-[#090d16] border border-slate-800 rounded-[3px] px-2 py-1 focus-within:border-amber-500/50 transition-colors"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Tivo a question..."
                className="flex-1 bg-transparent border-none outline-none text-xs py-1.5 text-slate-200 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-1.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-30 disabled:bg-slate-800 disabled:text-slate-600 transition-all flex items-center justify-center"
              >
                <Send size={12} />
              </button>
            </form>
            <div className="flex justify-between items-center mt-2 px-1 text-[8px] text-slate-500">
              <span>Branded for Atlanta TV Mount PRO</span>
              <span className="flex items-center gap-0.5"><CornerDownLeft size={6} /> Press Enter to Send</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Drawer and Speech Bubble styles */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
