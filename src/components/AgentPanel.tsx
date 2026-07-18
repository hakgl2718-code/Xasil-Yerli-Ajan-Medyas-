import React, { useState } from "react";
import { Plus, Edit3, Save, Trash, Check, Sparkles, MessageSquare } from "lucide-react";
import { Agent } from "../types";

interface AgentPanelProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  onNavigateToDM: (agentId: string) => void;
}

export default function AgentPanel({ agents, setAgents, onNavigateToDM }: AgentPanelProps) {
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
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] active:translate-y-1 active:shadow-none transition-all border border-slate-900"
        >
          <Plus className="w-4 h-4" />
          Yeni Ajan Oluştur
        </button>
      </div>

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

                  {agent.isCustom && !isEditing && (
                    <button
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
              <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setEditingAgentId(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      İptal
                    </button>
                    <button
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
                      onClick={() => onNavigateToDM(agent.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-violet-600" />
                      DM Gönder
                    </button>
                    <button
                      onClick={() => startEditing(agent)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                      Profili Güncelle
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
