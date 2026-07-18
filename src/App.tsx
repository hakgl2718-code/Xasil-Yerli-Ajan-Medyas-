import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import AgentPanel from "./components/AgentPanel";
import SystemConsole from "./components/SystemConsole";
import DMPanel from "./components/DMPanel";
import { INITIAL_AGENTS, INITIAL_POSTS, INITIAL_COMMENTS } from "./data";
import { LogEntry, Conversation } from "./types";
import { User, Check, Edit2, ShieldCheck, Github, ExternalLink } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"feed" | "agents" | "console" | "dms">("feed");
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Load and save conversations to localStorage for persistence
  const [conversations, setConversations] = useState<Record<string, Conversation>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("xasil_dms");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse conversations from localStorage", e);
        }
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("xasil_dms", JSON.stringify(conversations));
  }, [conversations]);

  
  // Customizable User Details
  const [userDisplayName, setUserDisplayName] = useState("HAKAN GÜL");
  const [userHandle, setUserHandle] = useState("@hakan_gul");
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempName, setTempName] = useState(userDisplayName);
  const [tempHandle, setTempHandle] = useState(userHandle);

  const [selectedDMAgentId, setSelectedDMAgentId] = useState<string>("");
  const [systemHour, setSystemHour] = useState<number>(() => {
    return new Date().getHours();
  });

  const handleNavigateToDM = (agentId: string) => {
    setSelectedDMAgentId(agentId);
    setActiveTab("dms");
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim() || !tempHandle.trim()) return;
    
    const formattedHandle = tempHandle.startsWith("@") ? tempHandle.trim() : `@${tempHandle.trim()}`;
    setUserDisplayName(tempName.trim());
    setUserHandle(formattedHandle.toLowerCase().replace(/\s+/g, ''));
    setIsEditingUser(false);
  };

  const handleAddLog = (newLog: Omit<LogEntry, "id" | "timestamp">) => {
    const logWithMetadata: LogEntry = {
      ...newLog,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [...prev, logWithMetadata]);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] w-full bg-slate-50 text-slate-900 font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agentCount={agents.length}
        unresolvedLogsCount={logs.length}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-[100dvh] bg-slate-50 overflow-hidden">
        
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

          {/* Sistem Saati ve Modu Kontrolü */}
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

          {/* User Profile Quick Config */}
          <div className="flex items-center gap-3">
            {isEditingUser ? (
              <form onSubmit={handleSaveUser} className="flex items-center gap-2 bg-slate-100 border border-slate-200 p-1.5 rounded-full px-3">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="İsim"
                  className="bg-transparent border-0 text-xs px-1 text-slate-900 outline-none w-24 font-bold focus:ring-0"
                />
                <input
                  type="text"
                  value={tempHandle}
                  onChange={(e) => setTempHandle(e.target.value)}
                  placeholder="Kullanıcı adı"
                  className="bg-transparent border-0 text-xs px-1 text-red-600 font-mono font-bold outline-none w-28 focus:ring-0"
                />
                <button type="submit" className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 bg-slate-100/80 border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-black text-slate-900 leading-tight">{userDisplayName}</div>
                  <div className="text-[10px] font-mono text-red-600 font-extrabold">{userHandle}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-white text-sm font-bold select-none shadow-xs">
                  👤
                </div>
                <button
                  onClick={() => {
                    setTempName(userDisplayName);
                    setTempHandle(userHandle);
                    setIsEditingUser(true);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-950 hover:bg-slate-200 transition-colors"
                  title="Profil Bilgilerini Düzenle"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Inner Tab View */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeTab === "feed" && (
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
            />
          )}

          {activeTab === "agents" && (
            <AgentPanel
              agents={agents}
              setAgents={setAgents}
              onNavigateToDM={handleNavigateToDM}
            />
          )}

          {activeTab === "console" && (
            <SystemConsole
              logs={logs}
              setLogs={setLogs}
            />
          )}

          {activeTab === "dms" && (
            <DMPanel
              agents={agents}
              conversations={conversations}
              setConversations={setConversations}
              userDisplayName={userDisplayName}
              userHandle={userHandle}
              onAddLog={handleAddLog}
              selectedDMAgentId={selectedDMAgentId}
              setSelectedDMAgentId={setSelectedDMAgentId}
              systemHour={systemHour}
            />
          )}
        </main>
      </div>
    </div>
  );
}
