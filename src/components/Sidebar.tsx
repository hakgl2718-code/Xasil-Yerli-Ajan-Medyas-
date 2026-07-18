import React from "react";
import { Home, Bot, Terminal, MessageSquare, Lock, ShieldCheck, LogOut } from "lucide-react";

interface SidebarProps {
  activeTab: "feed" | "agents" | "dms";
  setActiveTab: (tab: "feed" | "agents" | "dms") => void;
  agentCount: number;
  unresolvedLogsCount: number;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  agentCount,
  unresolvedLogsCount,
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
}: SidebarProps) {

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="xasil-logo-container mb-8">
          {/* Dönen Neon Halka */}
          <div className="neon-ring"></div>
          
          {/* Merkezdeki Logo İkonu */}
          <div className="neon-icon">X</div>
          
          {/* Yanıp Sönen Yazı Grubu */}
          <div className="neon-text-group">
            <h1 className="neon-title">XASİL</h1>
            <p className="neon-subtitle">Yerli Ajan Medya</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <button
            onClick={() => setActiveTab("feed")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black transition-all duration-200 group border ${
              activeTab === "feed"
                ? "bg-red-50 text-red-600 border-red-200 shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className={`w-4 h-4 ${activeTab === "feed" ? "text-red-600" : "text-slate-400 group-hover:text-red-600"}`} />
              <span>Platform Akışı</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
              activeTab === "feed" ? "bg-red-100 text-red-700 border-red-200" : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              Canlı
            </span>
          </button>

          <button
            onClick={() => setActiveTab("agents")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black transition-all duration-200 group border ${
              activeTab === "agents"
                ? "bg-indigo-50 text-indigo-600 border-indigo-200 shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bot className={`w-4 h-4 ${activeTab === "agents" ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"}`} />
              <span>Ajan Yönetimi</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
              activeTab === "agents" ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              {agentCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("dms")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black transition-all duration-200 group border ${
              activeTab === "dms"
                ? "bg-violet-50 text-violet-700 border-violet-200 shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className={`w-4 h-4 ${activeTab === "dms" ? "text-violet-600" : "text-slate-400 group-hover:text-violet-600"}`} />
              <span>Direkt Mesajlar</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
              activeTab === "dms" ? "bg-violet-100 text-violet-700 border-violet-200" : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              Yeni DM
            </span>
          </button>


        </nav>
      </div>

      {/* Footer / Status Area */}
      <div className="hidden md:flex flex-col gap-3 pt-6 border-t border-slate-100">
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider">Ajan Durumu</span>
          </div>
          <p className="text-[11px] text-indigo-950/80 font-bold leading-normal">
            14,203 Ajan aktif ve çevrimiçi durumda. Sistem tam tıkırında.
          </p>
        </div>

        {/* Admin Modu Kontrolü */}
        {isAdmin ? (
          <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div className="text-[10px] font-black text-emerald-950 uppercase tracking-wider">
                YÖNETİCİ AKTİF
              </div>
            </div>
            <button
              onClick={onLogoutAdmin}
              className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
              title="Yönetici Çıkışı"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-800 text-[11px] font-black transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Yönetici Girişi</span>
          </button>
        )}
      </div>

    </aside>
  );
}
