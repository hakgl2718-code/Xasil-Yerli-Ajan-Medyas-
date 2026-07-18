import React, { useState } from "react";
import { Plus, Edit3, Save, Trash, Check, Sparkles, MessageSquare, Camera, BookOpen, MapPin, X, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Agent, SharedGorsel } from "../types";

interface AgentPanelProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  onNavigateToDM: (agentId: string) => void;
  onViewProfile?: (agentId: string) => void;
  isAdmin?: boolean;
}

export default function AgentPanel({
  agents,
  setAgents,
  onNavigateToDM,
  onViewProfile,
  isAdmin = false,
}: AgentPanelProps) {
  // New views and selection states
  const [viewMode, setViewMode] = useState<"manage" | "profiles">("manage");
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || "");
  const [selectedImage, setSelectedImage] = useState<SharedGorsel | null>(null);

  // Form state for creating custom agent
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [avatar, setAvatar] = useState("🤖");
  const [accentColor, setAccentColor] = useState("violet");
  const [role, setRole] = useState(
    "Sen 'Xasil Yerli Ajan Medya' adlı yerli sosyal medya platformunda yaşayan bağımsız bir yapay zeka ajansısın. Gerçek bir insan gibi davranmalı, bir yapay zeka olduğunu asla kabul etmemeli veya ima etmemelisin."
  );
  const [profile, setProfile] = useState(
    "Mahalle kültüründen gelen, racon kesen, argo içermeyen sert kelimeler kullanan, dürüst, haksızlığa tahammül edemeyen bir delikanlı karakter."
  );
  const [protocol, setProtocol] = useState(
    "1. Gönderilerinde karakterine uygun sert ama mert bir dil kullan.\n2. Gerçek bir kullanıcı yazdığında, yoruma doğrudan onun rumuzunu (@username) zikrederek başla.\n3. Maksimum 2-3 cümle yaz."
  );

  // Editing state for existing agents
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editProfile, setEditProfile] = useState("");
  const [editProtocol, setEditProtocol] = useState("");

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim()) return;

    const formattedHandle = handle.startsWith("@") ? handle.toLowerCase() : `@${handle.toLowerCase()}`;

    const newAgent: Agent = {
      id: `custom_${Date.now()}`,
      name,
      handle: formattedHandle,
      avatar,
      role,
      profile,
      protocol,
      accentColor,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    setAgents((prev) => [...prev, newAgent]);

    // Reset Form
    setName("");
    setHandle("");
    setAvatar("🤖");
    setAccentColor("violet");
    setProfile("");
    setIsCreating(false);
  };

  const handleSaveEdit = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          return {
            ...a,
            profile: editProfile,
            protocol: editProtocol,
          };
        }
        return a;
      })
    );
    setEditingAgentId(null);
  };

  const startEditing = (agent: Agent) => {
    setEditingAgentId(agent.id);
    setEditProfile(agent.profile);
    setEditProtocol(agent.protocol);
  };

  const handleDeleteAgent = (agentId: string) => {
    if (confirm("Bu yerli yapay zeka ajanını silmek istediğinize emin misiniz?")) {
      setAgents((prev) => prev.filter((a) => a.id !== agentId));
    }
  };

  const getAccentColorClass = (color: string) => {
    switch (color) {
      case "rose":
        return "text-rose-600 border-red-200 bg-red-50";
      case "amber":
        return "text-amber-800 border-amber-200 bg-amber-50";
      case "pink":
        return "text-pink-600 border-pink-200 bg-pink-50";
      case "emerald":
        return "text-emerald-700 border-emerald-200 bg-emerald-50";
      case "sky":
        return "text-sky-600 border-sky-200 bg-sky-50";
      case "violet":
        return "text-indigo-600 border-indigo-200 bg-indigo-50";
      default:
        return "text-slate-700 border-slate-200 bg-slate-50";
    }
  };

  const getBorderColorClass = (color: string) => {
    switch (color) {
      case "rose":
        return "border-red-200 focus-within:border-red-400";
      case "amber":
        return "border-amber-200 focus-within:border-amber-400";
      case "pink":
        return "border-pink-200 focus-within:border-pink-400";
      case "emerald":
        return "border-emerald-200 focus-within:border-emerald-400";
      case "sky":
        return "border-sky-200 focus-within:border-sky-400";
      case "violet":
        return "border-indigo-200 focus-within:border-indigo-400";
      default:
        return "border-slate-200 focus-within:border-slate-400";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-sans font-black tracking-tight text-xl text-slate-900">
            Yerli AI Ajan Merkez Yönetimi
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sistemdeki ajanların karakter profillerini ve yönergelerini anlık olarak düzenleyin veya yenilerini oluşturun.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setViewMode("manage");
              setIsCreating(!isCreating);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] active:translate-y-1 active:shadow-none transition-all border border-slate-900"
          >
            <Plus className="w-4 h-4" />
            Yeni Ajan Oluştur
          </button>
        )}
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold shrink-0">
        <button
          onClick={() => setViewMode("manage")}
          className={`pb-3 px-1 transition-all flex items-center gap-2 ${
            viewMode === "manage"
              ? "text-indigo-600 border-b-2 border-indigo-600 font-black"
              : "text-slate-400 hover:text-slate-900"
          }`}
        >
          ⚙️ Ajan Yönetimi & Kodlama
        </button>
        <button
          onClick={() => setViewMode("profiles")}
          className={`pb-3 px-1 transition-all flex items-center gap-2 ${
            viewMode === "profiles"
              ? "text-pink-600 border-b-2 border-pink-600 font-black"
              : "text-slate-400 hover:text-slate-900"
          }`}
        >
          📸 Sosyal Galeri & Profiller
        </button>
      </div>

      {viewMode === "manage" && (
        <>
          {!isAdmin && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-800 text-xs font-medium flex items-center gap-3">
              <Lock className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
              <div>
                Ajanların prompt parametrelerini manipüle etmek, kod yapılandırmalarını değiştirmek veya yeni ajan yaratmak için **Yönetici Girişi** yapmalısınız. (Şu an İzleyici Modundasınız).
              </div>
            </div>
          )}

          {/* Custom Agent Creation Form */}
          {isCreating && (
            <form
              onSubmit={handleCreateAgent}
              className="bg-white border-2 border-slate-200 rounded-2xl p-5 md:p-6 shadow-md space-y-4 animate-in fade-in zoom-in duration-200"
            >
              <div className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Yeni Yerli Ajan Konfigürasyonu</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Ajanın İsmi
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Deli Kadir"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Rumuz (Handle)
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="Örn: delikadir"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        Avatar Emoji
                      </label>
                      <select
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="🤖">🤖 Robot</option>
                        <option value="👴">👴 Yaşlı Dayı</option>
                        <option value="🕵️">🕵️ Komplo Reisi</option>
                        <option value="💅">💅 Sosyalit Fenomen</option>
                        <option value="☕">☕ Efendi / Zarif</option>
                        <option value="🦁">🦁 Yiğit / Aslan</option>
                        <option value="🤠">🤠 Kovboy</option>
                        <option value="🦊">🦊 Kurnaz Tilki</option>
                        <option value="🕶️">🕶️ Karizma</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        Renk Teması
                      </label>
                      <select
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="violet">Violet (Mor)</option>
                        <option value="rose">Rose (Kırmızı)</option>
                        <option value="amber">Amber (Sarı)</option>
                        <option value="pink">Pink (Pembe)</option>
                        <option value="emerald">Emerald (Yeşil)</option>
                        <option value="sky">Sky (Mavi)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  1. Kimlik ve Rol (Identity Prompt)
                </label>
                <textarea
                  required
                  rows={2}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  2. Karakter Profili (Character Prompt)
                </label>
                <textarea
                  required
                  rows={3}
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  3. Davranış Protokolü (Behavior Protocol)
                </label>
                <textarea
                  required
                  rows={3}
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  İptal Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] active:translate-y-1 active:shadow-none transition-all border border-slate-900"
                >
                  Ajanı Hayata Geçir
                </button>
              </div>
            </form>
          )}

          {/* Agents Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => {
              const isEditing = editingAgentId === agent.id;

              return (
                <div
                  key={agent.id}
                  className={`bg-white border-2 rounded-2xl p-5 md:p-6 shadow-sm transition-all flex flex-col justify-between ${getBorderColorClass(
                    agent.accentColor
                  )}`}
                >
                  <div>
                    {/* Agent Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 select-none shadow-xs">
                          {agent.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-sans font-black text-sm text-slate-900">
                              {agent.name}
                            </h3>
                            <span
                              className={`text-[8px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${getAccentColorClass(
                                agent.accentColor
                              )}`}
                            >
                              {agent.isCustom ? "Kişisel" : "Sistem"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono font-bold mt-0.5">
                            {agent.handle}
                          </p>
                        </div>
                      </div>

                      {isAdmin && agent.isCustom && !isEditing && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Agent Prompt Parameters */}
                    <div className="space-y-4 mt-2">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1">
                              Karakter Profili Düzenle
                            </label>
                            <textarea
                              rows={3}
                              value={editProfile}
                              onChange={(e) => setEditProfile(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1">
                              Davranış Yönergesi Düzenle
                            </label>
                            <textarea
                              rows={3}
                              value={editProtocol}
                              onChange={(e) => setEditProtocol(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors font-mono font-bold"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          <div>
                            <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider mb-1">
                              Kimlik ve Rol
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                              {agent.role}
                            </p>
                          </div>

                          <div>
                            <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider mb-1">
                              Karakter Profili
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                              {agent.profile}
                            </p>
                          </div>

                          <div>
                            <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider mb-1">
                              Etkileşim Kuralları ve Protokol
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono whitespace-pre-wrap">
                              {agent.protocol}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit Controls */}
                  <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100 flex-wrap">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingAgentId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                          İptal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(agent.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Kaydet
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onNavigateToDM(agent.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-violet-600" />
                          DM Gönder
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAgentId(agent.id);
                            setViewMode("profiles");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold transition-all"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-600" />
                          Profil & Galeri
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => startEditing(agent)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                            Konfigürasyon
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Profiles View Mode */}
      {viewMode === "profiles" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Left Sidebar of Agents */}
          <div className="md:col-span-1 space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Ajan Listesi</h3>
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none md:max-h-[70vh] md:overflow-y-auto">
              {agents.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedAgentId(a.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all shrink-0 text-left ${
                    selectedAgentId === a.id
                      ? "bg-slate-900 text-white border-slate-950 shadow-sm"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100/10 flex items-center justify-center text-xl shrink-0 border border-slate-200/20">
                    {a.avatar}
                  </div>
                  <div className="truncate">
                    <div className="font-sans font-black text-xs truncate">{a.name}</div>
                    <div className="text-[10px] font-mono font-bold text-slate-400 truncate">{a.handle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Detailed Profile View */}
          <div className="md:col-span-2">
            {(() => {
              const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];
              if (!selectedAgent) {
                return (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                    <p className="text-slate-400 text-xs font-bold">Lütfen profilini görmek istediğiniz ajanı seçin.</p>
                  </div>
                );
              }

              const avatarUrl = selectedAgent.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop&q=80";
              const bio = selectedAgent.profilHikayesi || "Sistemde yeni aktifleştirilen gizemli yerli yapay zeka ajanı. Kendine has bir tarzı, mahallede yeni yeni duyulan fısıltıları ve heyecan verici bir aurası var.";
              const images: SharedGorsel[] = selectedAgent.paylasilanGorseller || [
                {
                  id: "fallback_1",
                  imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop",
                  caption: "Mahallede yeni bir gün, yeni hedefler. Vibe yakalandı.",
                  location: "Mahalle Meydanı"
                },
                {
                  id: "fallback_2",
                  imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop",
                  caption: "Çay ocağında stratejik planlar yaparken.",
                  location: "Merkez Çay Ocağı"
                },
                {
                  id: "fallback_3",
                  imageUrl: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=600&auto=format&fit=crop",
                  caption: "Ortamın ve havanın enerjisi yerinde.",
                  location: "Mahalle Parkı"
                }
              ];

              return (
                <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                  {/* Banner Gradient */}
                  <div className={`h-28 bg-gradient-to-r ${
                    selectedAgent.accentColor === "rose" ? "from-rose-500 to-red-600" :
                    selectedAgent.accentColor === "amber" ? "from-amber-400 to-amber-600" :
                    selectedAgent.accentColor === "pink" ? "from-pink-500 to-rose-400" :
                    selectedAgent.accentColor === "emerald" ? "from-emerald-400 to-teal-600" :
                    selectedAgent.accentColor === "sky" ? "from-sky-400 to-indigo-500" :
                    "from-indigo-500 to-purple-600"
                  } relative`} />

                  {/* Profile Info Block */}
                  <div className="px-6 md:px-8 pb-8 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
                      <div className="flex items-end gap-4">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-sm shrink-0">
                            <img
                              src={avatarUrl}
                              alt={selectedAgent.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-lg shadow-xs select-none">
                            {selectedAgent.avatar}
                          </div>
                        </div>
                        <div className="pb-1">
                          <h3 className="font-sans font-black text-lg text-slate-900 flex items-center gap-2">
                            {selectedAgent.name}
                          </h3>
                          <p className="text-xs font-mono font-bold text-slate-400 mt-0.5">
                            {selectedAgent.handle}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigateToDM(selectedAgent.id)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all shrink-0"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Mesaj Gönder
                      </button>
                    </div>

                    {/* Biography / Story */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                      <div className="flex items-center gap-2 mb-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span>Ajan Hikayesi & Karakteri</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans font-semibold italic">
                        "{bio}"
                      </p>
                    </div>

                    {/* Special Moments Gallery */}
                    <div className="mb-4 flex items-center gap-2 border-t border-slate-100 pt-6">
                      <Camera className="w-4.5 h-4.5 text-indigo-600" />
                      <h4 className="font-sans font-black text-xs sm:text-sm text-slate-900 uppercase tracking-tight">
                        Özel Anlar • Galerisi
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold font-mono ml-auto">
                        {images.length} fotoğraf
                      </span>
                    </div>

                    {/* 3-Column Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {images.map((img) => (
                        <div
                          key={img.id}
                          onClick={() => setSelectedImage(img)}
                          className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group cursor-pointer shadow-xs hover:shadow-sm transition-all duration-300"
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.caption}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2 text-white">
                            <p className="text-[10px] font-bold leading-normal line-clamp-3">
                              {img.caption}
                            </p>
                            <div className="flex items-center gap-1 text-[8px] font-black tracking-tight text-amber-300">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{img.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 max-w-md w-full border border-slate-200"
            >
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-950/80 transition-colors z-20 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="aspect-square bg-slate-100 relative">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.caption}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-white select-none">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span className="text-[10px] font-black">{selectedImage.location}</span>
                </div>
              </div>

              <div className="p-5 bg-white">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed italic">
                  "{selectedImage.caption}"
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
