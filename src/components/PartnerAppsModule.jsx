import React, { useState } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Share2, Palette, HardDrive, FileText, Users, Link as LinkIcon, ExternalLink, RefreshCw 
} from "lucide-react";

const APPS = [
  { id: "social", name: "Social AI", icon: Share2, color: "text-[#f43f5e]", desc: "Create viral social posts with AI" },
  { id: "brandkit", name: "Brand Kit AI", icon: Palette, color: "text-[#10b981]", desc: "Generate matching branding and assets" },
  { id: "filemanager", name: "File Manager", icon: HardDrive, color: "text-[#22d3ee]", desc: "Cloud files and assets drawer" },
  { id: "epk", name: "EPK Builder", icon: FileText, color: "text-[#a855f7]", desc: "Build electronic press kits" },
  { id: "crm", name: "Smart CRM", icon: Users, color: "text-[#eab308]", desc: "Consolidated lead dashboard" },
];

export default function PartnerAppsModule() {
  const { user, loginWithIntermaven, logout } = useClientAuth();
  const [activeApp, setActiveApp] = useState("social");

  // Determine Intermaven frontend base URL
  const intermavenUrl =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : "https://intermaven.io";

  // Check if user session has partner SSO token (logged in via Intermaven)
  const hasConnection = user && user.token && !user.id.startsWith("local_") && !user.id.startsWith("local_google_");

  if (!hasConnection) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 animate-pulse">
          <LinkIcon size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Connect Partner Account</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Partner micro-frontend tools require an active Intermaven account verification.
            Please connect your account to unlock AI Social posting, Brand Kit, and file managers.
          </p>
        </div>
        <Button 
          onClick={loginWithIntermaven} 
          className="w-full bg-[#10b981] hover:bg-[#10b981]/90 text-white font-semibold py-6 rounded-[3px] flex items-center justify-center gap-2"
        >
          <span>Connect with Intermaven</span>
          <ExternalLink size={16} />
        </Button>
      </div>
    );
  }

  const activeAppConfig = APPS.find((a) => a.id === activeApp) || APPS[0];
  const iframeSrc = `${intermavenUrl}/embed/${activeApp}?token=${encodeURIComponent(user.token)}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-[3px] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Partner Application Manager</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Access pluggable AI micro-frontends embedded directly from your connected Intermaven partner desk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Connected as: <strong className="text-foreground">{user.email}</strong></span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout} 
            className="text-xs text-destructive hover:bg-destructive/10 rounded-[3px]"
          >
            Disconnect
          </Button>
        </div>
      </div>

      {/* Main Apps Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Selector */}
        <div className="lg:col-span-3 space-y-2">
          {APPS.map((app) => {
            const Icon = app.icon;
            const isSelected = activeApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-[3px] border text-left transition-all duration-150 ${
                  isSelected
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} className={`mt-0.5 flex-shrink-0 ${app.color}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{app.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{app.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Embedded Iframe Container */}
        <div className="lg:col-span-9">
          <Card className="border border-border bg-card shadow-sm rounded-[3px] overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <activeAppConfig.icon size={14} className={activeAppConfig.color} />
                <span className="text-xs font-semibold">{activeAppConfig.name} Portal</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">Embedded micro-frontend</span>
                <button 
                  onClick={() => {
                    const iframe = document.getElementById("partner-app-iframe");
                    if (iframe) iframe.src = iframe.src;
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Reload Portal"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>
            <div className="relative w-full aspect-[4/3] min-h-[560px] bg-slate-950">
              <iframe
                id="partner-app-iframe"
                src={iframeSrc}
                title={activeAppConfig.name}
                className="absolute inset-0 w-full h-full border-none"
                allow="clipboard-write"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
