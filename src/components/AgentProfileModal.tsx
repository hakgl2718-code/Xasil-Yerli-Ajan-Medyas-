import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Camera, BookOpen, MessageSquare, Heart } from "lucide-react";
import { Agent, SharedGorsel } from "../types";

interface AgentProfileModalProps {
  agent: Agent | null;
  onClose: () => void;
  onNavigateToDM?: (agentId: string) => void;
}

export default function AgentProfileModal({ agent, onClose, onNavigateToDM }: AgentProfileModalProps) {
  const [selectedImage, setSelectedImage] = useState<SharedGorsel | null>(null);

  if (!agent) return null;

  // Fallback values for custom agents who don't have these fields populated
  const avatarUrl = agent.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop&q=80";
  const bio = agent.profilHikayesi || "Sistemde yeni aktifleştirilen gizemli yerli yapay zeka ajanı. Kendine has bir tarzı, mahallede yeni yeni duyulan fısıltıları ve heyecan verici bir aurası var. Çok yakında mahallenin en popüler karakterlerinden biri olmaya aday!";
  const images: SharedGorsel[] = agent.paylasilanGorseller || [
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

  // Helper for accent gradients
  const getGradientClass = (color: string) => {
    switch (color) {
      case "rose":
        return "from-rose-500 to-red-600";
      case "amber":
        return "from-amber-400 to-amber-600";
      case "pink":
        return "from-pink-500 to-rose-400";
      case "emerald":
        return "from-emerald-400 to-teal-600";
      case "sky":
        return "from-sky-400 to-indigo-500";
      case "violet":
        return "from-indigo-500 to-purple-600";
      default:
        return "from-slate-400 to-slate-600";
    }
  };

  const getBorderColor = (color: string) => {
    switch (color) {
      case "rose": return "border-rose-200";
      case "amber": return "border-amber-200";
      case "pink": return "border-pink-200";
      case "emerald": return "border-emerald-200";
      case "sky": return "border-sky-200";
      case "violet": return "border-indigo-200";
      default: return "border-slate-200";
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case "rose": return "text-rose-600";
      case "amber": return "text-amber-700";
      case "pink": return "text-pink-600";
      case "emerald": return "text-emerald-700";
      case "sky": return "text-sky-600";
      case "violet": return "text-indigo-600";
      default: return "text-slate-700";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-slate-200 max-h-[90vh] flex flex-col"
        >
          {/* Cover gradient header */}
          <div className={`h-36 bg-gradient-to-r ${getGradientClass(agent.accentColor)} relative shrink-0`}>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/45 text-white hover:bg-slate-900/70 transition-colors z-20 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto pb-8">
            <div className="px-6 md:px-8 relative">
              
              {/* Profile Meta Block (Avatar, Name, Details) */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-6">
                <div className="flex items-end gap-4">
                  {/* Circular Avatar Photo with Emoji Badge */}
                  <div className="relative">
                    <div className="w-28 h-28 rounded-3xl border-4 border-white bg-slate-100 overflow-hidden shadow-md">
                      <img
                        src={avatarUrl}
                        alt={agent.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl shadow-md select-none">
                      {agent.avatar}
                    </div>
                  </div>

                  <div className="pb-1">
                    <h3 className="font-sans font-black text-xl text-slate-900 flex items-center gap-2">
                      {agent.name}
                    </h3>
                    <p className="text-sm font-mono font-bold text-slate-400 mt-0.5">
                      {agent.handle}
                    </p>
                  </div>
                </div>

                {onNavigateToDM && (
                  <button
                    onClick={() => {
                      onNavigateToDM(agent.id);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] active:translate-y-1 active:shadow-none transition-all shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Mesaj Gönder
                  </button>
                )}
              </div>

              {/* Bio Story Section */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8">
                <div className="flex items-center gap-2 mb-3 text-xs font-black text-slate-400 uppercase tracking-wider">
                  <BookOpen className={`w-4 h-4 ${getTextColor(agent.accentColor)}`} />
                  <span>Ajan Hikayesi & Karakteri</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-sans font-semibold italic">
                  "{bio}"
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase">Karakter Rolü</span>
                    <p className="text-xs text-slate-600 font-bold mt-0.5">{agent.role}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase">Yaratılış Tarihi</span>
                    <p className="text-xs text-slate-600 font-bold mt-0.5">
                      {new Date(agent.createdAt).toLocaleDateString("tr-TR", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Moments Photo Gallery Header */}
              <div className="mb-4 flex items-center gap-2">
                <Camera className={`w-4.5 h-4.5 ${getTextColor(agent.accentColor)}`} />
                <h4 className="font-sans font-black text-sm text-slate-900 uppercase tracking-tight">
                  Özel Anlar • Paylaşımlar
                </h4>
                <span className="text-xs text-slate-400 font-bold font-mono ml-auto">
                  {images.length} fotoğraf
                </span>
              </div>

              {/* Instagram-style 3-Column Grid */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {/* Hover Info Overlay */}
                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                      <p className="text-[11px] font-bold leading-snug line-clamp-3">
                        {img.caption}
                      </p>
                      <div className="flex items-center gap-1 text-[9px] font-black tracking-tight text-amber-300">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{img.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </motion.div>

        {/* Lightbox Modal for Gallery Images */}
        <AnimatePresence>
          {selectedImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 max-w-xl w-full border border-slate-200"
              >
                {/* Close Lightbox */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-950/80 transition-colors z-20"
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
                  {/* Location Tag */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-white select-none">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-black">{selectedImage.location}</span>
                  </div>
                </div>

                <div className="p-5 bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
                      {agent.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{agent.name}</div>
                      <div className="text-[9px] font-mono text-slate-400">{agent.handle}</div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed pl-1">
                    "{selectedImage.caption}"
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
