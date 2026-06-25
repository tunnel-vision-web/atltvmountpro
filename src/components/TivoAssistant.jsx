import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, HelpCircle, ArrowRight, CornerDownLeft, Sparkles, RefreshCw } from "lucide-react";
import tivoAvatar from "@/assets/tivo_flat_icon_1782228698511.png";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = {
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
};

export default function TivoAssistant({ activeTab, onAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "tivo",
      text: "Beep boop! Hello! I am Tivo, your digital TV-headed assistant. 📺🔧 I'm here to help you manage the Atlanta TV Mount PRO admin desk! Ask me anything.",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const activeSuggestions = SUGGESTIONS[activeTab] || [
    { label: "How does CRM Sync work?", action: "query", text: "Explain partner CRM webhook synchronization" },
    { label: "SSO Login flow", action: "query", text: "Explain OpenID Connect login" },
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Context-aware alert when activeTab changes
  useEffect(() => {
    if (isOpen) {
      const tabFriendlyNames = {
        overview: "Overview Dashboard",
        projects: "Projects Manager",
        orders: "Bookings & Job Orders",
        support: "Support Tickets & Disputes",
        team: "Technician & Team Directory",
        crm: "Partner CRM Sync Settings",
        profile: "User Profiles & Permissions",
        finance: "Escrow Ledger & Earnings",
        cms: "Content Management (CMS)",
        media: "Media Asset Library",
        store: "Store & Uniform Management",
        partner: "Partner App Portal",
      };
      
      const tabName = tabFriendlyNames[activeTab] || activeTab;
      
      // Inject tab change system alert
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: "system",
          text: `Context shifted to: ${tabName}`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [activeTab]);

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
      const replyText = getTivoResponse(text, activeTab);
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

  const getTivoResponse = (input, tab) => {
    const query = input.toLowerCase();

    if (query.includes("hi") || query.includes("hello") || query.includes("hey") || query.includes("tivo")) {
      return "Hello! I am Tivo. 📺🤖 How's your admin day going? You can ask me how to manage technicians, track paycheck deductions, handle dispute holds, or connect with Intermaven.";
    }

    if (query.includes("sync") || query.includes("webhook") || query.includes("crm")) {
      return "We automatically sync all booking_created, quote_created, and ticket_created events directly to Intermaven's server-to-server webhook endpoint (`/api/crm/ingest`). It matches emails to consolidate customer history in the partner desk database.";
    }

    if (query.includes("escrow") || query.includes("freeze") || query.includes("dispute")) {
      return "When a recruit/technician job is completed, payment commission is held in escrow. If a workmanship dispute is filed (Support Tickets), the hold is locked as 'Frozen' for 48 hours to allow review. If resolved, it releases to earnings; if not, it stays frozen until admin resolution.";
    }

    if (query.includes("uniform") || query.includes("polo") || query.includes("paycheck") || query.includes("onboarding")) {
      return "New technicians are required to wear branded uniforms. During step 6 of onboarding, recruits select size and shipping options. The uniform kit cost ($30 + shipping fee) is recorded as a paycheck deduction on their account and automatically subtracted from their first payout.";
    }

    if (query.includes("sso") || query.includes("login") || query.includes("credential") || query.includes("openid") || query.includes("oidc")) {
      return "Single Sign-On (SSO) links our site to Intermaven. It uses an OIDC redirect handshake. Registered partner clients and techs can sign in via the 'Connect with Intermaven' gateway, generating an auth token used for micro-frontend embeds.";
    }

    if (query.includes("project") || query.includes("featured") || query.includes("sorting")) {
      return "In the Projects tab, you can add TV mounting showcase jobs. Enabling the 'Featured Landing' flag adds them to the homepage carousel slider. The 'Sort Order' field determines the relative priority sequence.";
    }

    if (query.includes("top technician") || query.includes("top tech")) {
      return "To see the top performing technicians, check the leaderboards in the Finance or Team tab. John Handyman currently has the highest job completion rating this month!";
    }

    // Default tab contexts if no keywords matched
    switch (tab) {
      case "overview":
        return "You're viewing the main dashboard. It aggregates booking volumes, revenue stats, active support tickets, and technician metrics. Let me know if you want to navigate anywhere else!";
      case "store":
        return "In the Store Manager, you can edit product listings, add new inventory items, track customer orders, and manage uniform onboarding shipments.";
      case "partner":
        return "This panel hosts Intermaven apps (Social AI, Brand Kit, CRM, Files) headlessly. It uses secure OIDC auth token parameters. If you see authorization errors, try reloading the portal using my reload action.";
      case "cms":
        return "The CMS page editor allows you to edit website text dynamically. Select the page (Home, About, Contact) from the dropdown, customize the hero headings, and click Save to instantly update the public site.";
      default:
        return "I'm analyzing the codebase! Ask me about OIDC configurations, CRM webhook sync, workmanship escrow holds, uniform payroll deductions, or tab controls.";
    }
  };

  const handleSuggestionClick = (sug) => {
    // Print the user's click action in the chat
    const newUserMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: sug.text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Handle deep linked action
    if (sug.action === "query") {
      setIsTyping(true);
      setTimeout(() => {
        const replyText = getTivoResponse(sug.text, activeTab);
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
      // Trigger callback in parent component
      setIsTyping(true);
      setTimeout(() => {
        onAction(sug.action);
        
        let actionConfirm = "Action triggered successfully.";
        if (sug.action.startsWith("changeTab:")) {
          actionConfirm = `Navigation action completed. Switched to the ${sug.action.split(":")[1].toUpperCase()} tab.`;
        } else if (sug.action === "triggerSync") {
          actionConfirm = "CRM Webhook Sync triggered! Lead data synchronized to Intermaven.";
        } else if (sug.action === "reloadIframe") {
          actionConfirm = "Embedded Partner App Iframe reloaded.";
        } else if (sug.action === "openNewProject") {
          actionConfirm = "Opened the Add New Project dialog modal.";
        } else if (sug.action === "openInviteTech") {
          actionConfirm = "Opened the Recruit/Technician Invitation modal.";
        }
        
        const newTivoMessage = {
          id: `tivo-${Date.now()}`,
          sender: "tivo",
          text: `Beep! ${actionConfirm} Is there anything else you need help with?`,
          timestamp: new Date(),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, newTivoMessage]);
      }, 500);
    }
  };

  return (
    <>
      {/* FLOATING ACTION TRIGGER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-slate-900 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 text-white rounded-[3px] shadow-2xl flex items-center justify-center transition-all duration-200 group focus:outline-none"
        title="Tivo Admin Assistant"
      >
        {isOpen ? (
          <X size={24} className="text-amber-500 transition-transform duration-200" />
        ) : (
          <div className="relative flex items-center justify-center">
            <img src={tivoAvatar} alt="Tivo Avatar" className="w-10 h-10 object-contain rounded-[3px]" />
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
        )}
      </button>

      {/* CHAT DRAWER PANEL */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-[380px] max-w-full bg-[#0a0f1d] border-l border-slate-800 shadow-2xl z-40 flex flex-col font-sans text-slate-200 animate-slide-in-right">
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
            <span>Active Section: <strong className="text-amber-500 font-semibold">{activeTab.toUpperCase()}</strong></span>
            <span className="flex items-center gap-1"><Sparkles size={8} className="text-amber-500 animate-pulse" /> Context-Aware Mode</span>
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
              <HelpCircle size={10} className="text-amber-500" /> Suggested for this Tab:
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
      
      {/* Slide-in styles */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
