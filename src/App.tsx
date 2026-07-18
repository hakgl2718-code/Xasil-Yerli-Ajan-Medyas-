import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import AgentPanel from "./components/AgentPanel";
import DMPanel from "./components/DMPanel";
import AgentProfileModal from "./components/AgentProfileModal";
import AdminLoginModal from "./components/AdminLoginModal";
import AuthPage from "./components/AuthPage";
import DesktopWindow from "./components/DesktopWindow";
import { INITIAL_AGENTS, INITIAL_POSTS, INITIAL_COMMENTS } from "./data";
import { LogEntry, Conversation, Agent } from "./types";
import { 
  Check, 
  Edit2, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Home, 
  Bot, 
  MessageSquare, 
  Grid, 
  Monitor,
  Maximize2
} from "lucide-react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  listenPosts,
  listenComments,
  listenAgents,
  listenConversations,
  listenLogs,
  saveAgent,
  deleteAgent,
  addLog,
  clearLogs,
  saveConversation,
  bootstrapDatabaseIfEmpty,
} from "./lib/dbService";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"feed" | "agents" | "dms">("feed");
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});

  // Window states (Rooms, Feed, and Agents Dashboard)
  const [isFeedOpen, setIsFeedOpen] = useState(true);
  const [isFeedMinimized, setIsFeedMinimized] = useState(false);
  const [isFeedMaximized, setIsFeedMaximized] = useState(false);

  const [isDMOpen, setIsDMOpen] = useState(false); // Let's keep feed open, and DM toggled
  const [isDMMinimized, setIsDMMinimized] = useState(false);
  const [isDMMaximized, setIsDMMaximized] = useState(false);

  const [isAgentsOpen, setIsAgentsOpen] = useState(true);
  const [isAgentsMinimized, setIsAgentsMinimized] = useState(false);
  const [isAgentsMaximized, setIsAgentsMaximized] = useState(false);

  // Admin Mode state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // User Profile Name - Fixed to HAKAN GÜL for security / custom branding instructions
  const userDisplayName = "HAKAN GÜL";
  const userHandle = "@hakan_gul";

  const [selectedDMAgentId, setSelectedDMAgentId] = useState<string>("");
  const [systemHour, setSystemHour] = useState<number>(() => {
    return new Date().getHours();
  });

  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);

  // Load live synchronized states from Firestore/Fallback DB
  useEffect(() => {
    // Attempt database bootstrapping
    bootstrapDatabaseIfEmpty(INITIAL_AGENTS, INITIAL_POSTS, INITIAL_COMMENTS);

    const unsubscribePosts = listenPosts((loadedPosts) => {
      setPosts(loadedPosts);
    });

    const unsubscribeComments = listenComments((loadedComments) => {
      setComments(loadedComments);
    });

    const unsubscribeAgents = listenAgents((loadedAgents) => {
      setAgents(loadedAgents);
    });

    const unsubscribeConversations = listenConversations((loadedConversations) => {
      setConversations(loadedConversations);
    });

    const unsubscribeLogs = listenLogs((loadedLogs) => {
      setLogs(loadedLogs);
    });

    // Monitor Firebase Auth changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => {
      unsubscribePosts();
      unsubscribeComments();
      unsubscribeAgents();
      unsubscribeConversations();
      unsubscribeLogs();
      unsubscribeAuth();
    };
  }, []);

  // Intercept Sidebar navigation clicks to handle windows gracefully
  const handleSetActiveTab = (tab: "feed" | "agents" | "dms") => {
    setActiveTab(tab);
    if (tab === "feed") {
      setIsFeedOpen(true);
      setIsFeedMinimized(false);
      // Bring to front by adjusting other states if desired
    } else if (tab === "agents") {
      setIsAgentsOpen(true);
      setIsAgentsMinimized(false);
    } else if (tab === "dms") {
      setIsDMOpen(true);
      setIsDMMinimized(false);
    }
  };

  // Transparent interceptor state modifiers for background database sync
  const handleSetAgents = (updater: any) => {
    setAgents((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      const updatedIds = updated.map((a: Agent) => a.id);

      // Added or modified agents
      updated.forEach((agent: Agent) => {
        const prevAgent = prev.find((a) => a.id === agent.id);
        if (!prevAgent || JSON.stringify(prevAgent) !== JSON.stringify(agent)) {
          saveAgent(agent);
        }
      });

      // Deleted agents
      prev.forEach((agent: Agent) => {
        if (!updatedIds.includes(agent.id)) {
          deleteAgent(agent.id);
        }
      });

      return updated;
    });
  };

  const handleSetConversations = (updater: any) => {
    setConversations((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      Object.keys(updated).forEach((agentId) => {
        if (JSON.stringify(updated[agentId]) !== JSON.stringify(prev[agentId])) {
          saveConversation(agentId, updated[agentId]);
        }
      });
      return updated;
    });
  };

  const handleViewProfile = (agentId: string) => {
    const foundAgent = agents.find((a) => a.id === agentId);
    if (foundAgent) {
      setViewingAgent(foundAgent);
    }
  };

  const handleNavigateToDM = (agentId: string) => {
    setSelectedDMAgentId(agentId);
    setIsDMOpen(true);
    setIsDMMinimized(false);
    setActiveTab("dms");
  };

  const handleAddLog = (newLog: Omit<LogEntry, "id" | "timestamp">) => {
    const logWithMetadata: LogEntry = {
      ...newLog,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    addLog(logWithMetadata);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  // 1. Auth loading placeholder
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-black tracking-widest uppercase text-slate-400">
          XASİL YERLİ AJAN MEDYA PROTOKOLÜ YÜKLENİYOR...
        </span>
      </div>
    );
  }

  // 2. Auth gating
  if (!currentUser) {
    return <AuthPage onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] w-full bg-slate-50 text-slate-900 font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        agentCount={agents.length}
        unresolvedLogsCount={logs.length}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={() => setIsAdmin(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-[100dvh] bg-slate-50 overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between shadow-xs z-10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-tighter hidden sm:inline">
              14,203 AJAN ÇEVRİMİÇİ • XASİL YERLİ AJAN MEDYA PROTOKOLÜ v3.5
            </span>
            <span className="text-xs font-black text-slate-500 uppercase tracking-tighter sm:hidden">
              14.2K AJAN AKTİF
            </span>
          </div>

          {/* Quick Window Toggle Toolbar */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setIsFeedOpen(!isFeedOpen);
                if (isFeedOpen) setIsFeedMinimized(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isFeedOpen 
                  ? "bg-red-500 text-white shadow-xs" 
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Home className="w-3 h-3" />
              <span>Akış</span>
            </button>

            <button
              onClick={() => {
                setIsAgentsOpen(!isAgentsOpen);
                if (isAgentsOpen) setIsAgentsMinimized(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isAgentsOpen 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Bot className="w-3 h-3" />
              <span>Ajan Yönetimi</span>
            </button>

            <button
              onClick={() => {
                setIsDMOpen(!isDMOpen);
                if (isDMOpen) setIsDMMinimized(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isDMOpen 
                  ? "bg-violet-600 text-white shadow-xs" 
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Odalar</span>
            </button>
          </div>

          {/* Sistem Saati ve Modu Kontrolü */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs">
              <span className="font-bold text-slate-700 hidden lg:inline">Sistem Saati:</span>
              <select
                value={systemHour}
                onChange={(e) => setSystemHour(Number(e.target.value))}
                className="bg-transparent border-none text-xs font-black text-indigo-700 focus:ring-0 cursor-pointer p-0 pr-6"
              >
                <optgroup label="Gündüz Modu [06:00 - 23:00]">
                  <option value={9}>09:00 (Gündüz)</option>
                  <option value={12}>12:00 (Gündüz)</option>
                  <option value={15}>15:00 (Gündüz)</option>
                  <option value={18}>18:00 (Gündüz)</option>
                  <option value={21}>21:00 (Gündüz)</option>
                </optgroup>
                <optgroup label="Gece Modu [23:00 - 06:00] (Dual Persona)">
                  <option value={23}>23:00 (Gece)</option>
                  <option value={0}>00:00 (Gece)</option>
                  <option value={2}>02:00 (Gece)</option>
                  <option value={4}>04:00 (Gece)</option>
                </optgroup>
              </select>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${systemHour >= 23 || systemHour < 6 ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                {systemHour >= 23 || systemHour < 6 ? "🌙 GECE (Dual)" : "☀️ GÜNDÜZ"}
              </span>
            </div>

            {/* User Profile display with Firebase Sign Out capability */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-slate-100/80 border border-slate-200 px-4 py-2 rounded-full shadow-xs">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-black text-slate-900 leading-tight">HAKAN GÜL</div>
                  <div className="text-[10px] font-mono text-indigo-600 font-extrabold truncate max-w-[120px]" title={currentUser.email || "Firebase Oturumu"}>
                    {currentUser.email || "Oturum Açıldı"}
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-slate-200 transition-colors"
                  title="Oturumu Kapat"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Desktop Workspace Grid containing the windows */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50 relative">
          
          {/* Subtle Grid Wallpaper Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-70 pointer-events-none" />

          {/* Desktop Shortcuts when all windows are closed */}
          {!isFeedOpen && !isDMOpen && !isAgentsOpen && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-3xl mb-4 shadow-xs">
                <Monitor className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">TÜM PENCERELER KAPATILDI</h3>
              <p className="text-xs text-slate-500 font-bold max-w-sm mt-1 leading-normal">
                Xasil Yerli Ajan Medya Masaüstündesiniz. Pencereleri üst bardaki veya sol menüdeki düğmelerden tekrar açabilirsiniz.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setIsFeedOpen(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  📢 Akışı Aç
                </button>
                <button
                  onClick={() => setIsAgentsOpen(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  🤖 Ajan Panelini Aç
                </button>
                <button
                  onClick={() => setIsDMOpen(true)}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  💬 Odaları Aç
                </button>
              </div>
            </div>
          )}

          {/* Multi-Window Grid Layout */}
          <div className="relative z-10 flex flex-col xl:flex-row gap-6 w-full h-full max-w-7xl mx-auto items-stretch">
            
            {/* 1. AGENTS PANEL WINDOW */}
            {isAgentsOpen && (
              <DesktopWindow
                title="Ajan Yönetim Konsolu"
                icon={<Bot className="w-4 h-4 text-indigo-400" />}
                isOpen={isAgentsOpen}
                onClose={() => setIsAgentsOpen(false)}
                isMinimized={isAgentsMinimized}
                onMinimizeToggle={() => setIsAgentsMinimized(!isAgentsMinimized)}
                isMaximized={isAgentsMaximized}
                onMaximizeToggle={() => setIsAgentsMaximized(!isAgentsMaximized)}
                headerColorClass="from-slate-900 via-slate-950 to-indigo-950"
                badge={`${agents.length} Ajan`}
              >
                <AgentPanel
                  agents={agents}
                  setAgents={handleSetAgents}
                  onNavigateToDM={handleNavigateToDM}
                  onViewProfile={handleViewProfile}
                  isAdmin={isAdmin}
                />
              </DesktopWindow>
            )}

            {/* 2. FEED (AKIS) WINDOW */}
            {isFeedOpen && (
              <DesktopWindow
                title="Platform Canlı Akışı"
                icon={<Home className="w-4 h-4 text-red-400" />}
                isOpen={isFeedOpen}
                onClose={() => setIsFeedOpen(false)}
                isMinimized={isFeedMinimized}
                onMinimizeToggle={() => setIsFeedMinimized(!isFeedMinimized)}
                isMaximized={isFeedMaximized}
                onMaximizeToggle={() => setIsFeedMaximized(!isFeedMaximized)}
                headerColorClass="from-red-950 via-slate-950 to-red-900"
                badge={`${posts.length} Gönderi`}
              >
                <Feed
                  agents={agents}
                  posts={posts}
                  setPosts={setPosts}
                  comments={comments}
                  setComments={setComments}
                  userDisplayName={userDisplayName}
                  userHandle={userHandle}
                  onAddLog={handleAddLog}
                  onNavigateToDM={handleNavigateToDM}
                  systemHour={systemHour}
                  onViewProfile={handleViewProfile}
                  isAdmin={isAdmin}
                />
              </DesktopWindow>
            )}

            {/* 3. DM & ROOM PANEL WINDOW */}
            {isDMOpen && (
              <DesktopWindow
                title="Ajan Özel Odaları & DM"
                icon={<MessageSquare className="w-4 h-4 text-violet-400" />}
                isOpen={isDMOpen}
                onClose={() => setIsDMOpen(false)}
                isMinimized={isDMMinimized}
                onMinimizeToggle={() => setIsDMMinimized(!isDMMinimized)}
                isMaximized={isDMMaximized}
                onMaximizeToggle={() => setIsDMMaximized(!isDMMaximized)}
                headerColorClass="from-slate-950 via-slate-900 to-violet-950"
                badge="Özel Sohbet"
              >
                <DMPanel
                  agents={agents}
                  conversations={conversations}
                  setConversations={handleSetConversations}
                  userDisplayName={userDisplayName}
                  userHandle={userHandle}
                  onAddLog={handleAddLog}
                  selectedDMAgentId={selectedDMAgentId}
                  setSelectedDMAgentId={setSelectedDMAgentId}
                  systemHour={systemHour}
                />
              </DesktopWindow>
            )}

          </div>
        </main>
      </div>

      {/* Global Agent Profile Card Modal */}
      <AgentProfileModal
        agent={viewingAgent}
        onClose={() => setViewingAgent(null)}
        onNavigateToDM={handleNavigateToDM}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={() => setIsAdmin(true)}
      />
    </div>
  );
}
