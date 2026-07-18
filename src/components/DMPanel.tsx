import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  ShieldCheck,
  ShieldAlert,
  MessageCircle,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Sparkles,
  Trash2,
  Bot,
  User,
  Clock,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { Agent, DirectMessage, Conversation, LogEntry } from "../types";

interface DMPanelProps {
  agents: Agent[];
  conversations: Record<string, Conversation>;
  setConversations: React.Dispatch<React.SetStateAction<Record<string, Conversation>>>;
  userDisplayName: string;
  userHandle: string;
  onAddLog: (log: Omit<LogEntry, "id" | "timestamp">) => void;
  selectedDMAgentId: string;
  setSelectedDMAgentId: (id: string) => void;
  systemHour: number;
}

export default function DMPanel({
  agents,
  conversations,
  setConversations,
  userDisplayName,
  userHandle,
  onAddLog,
  selectedDMAgentId,
  setSelectedDMAgentId,
  systemHour,
}: DMPanelProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(selectedDMAgentId || agents[0]?.id || "");
  const [inputMessage, setInputMessage] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [currentlyPlayingMsgId, setCurrentlyPlayingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeAgent = agents.find((a) => a.id === selectedAgentId);
  const activeConv = conversations[selectedAgentId] || {
    agentId: selectedAgentId,
    messages: [],
    status: "none",
  };

  // Sync selected agent when passed from parent
  useEffect(() => {
    if (selectedDMAgentId) {
      setSelectedAgentId(selectedDMAgentId);
      setSelectedDMAgentId("");
    }
  }, [selectedDMAgentId, setSelectedDMAgentId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv.messages, isEvaluating, isAgentTyping]);

  // Clean speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeech = (text: string, agentId: string | null, msgId: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Tarayıcınız ses sentezini desteklemiyor.");
      return;
    }

    if (currentlyPlayingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlyPlayingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";

    // Persona-specific settings
    let rate = 1.0;
    let pitch = 1.0;

    if (agentId) {
      switch (agentId) {
        case "raconcu_dayi":
          rate = 0.75;
          pitch = 0.65;
          break;
        case "nihadefendi":
          rate = 0.82;
          pitch = 0.9;
          break;
        case "selinbabe":
          rate = 1.25;
          pitch = 1.35;
          break;
        case "derin_ertan":
          rate = 1.1;
          pitch = 0.82;
          break;
        default:
          rate = 1.0;
          pitch = 1.0;
          break;
      }
    } else {
      // User speech rate/pitch
      rate = 1.0;
      pitch = 1.0;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    const voices = window.speechSynthesis.getVoices();
    const turkishVoice = voices.find((v) => v.lang.startsWith("tr"));
    if (turkishVoice) {
      utterance.voice = turkishVoice;
    }

    utterance.onend = () => {
      setCurrentlyPlayingMsgId(null);
    };

    utterance.onerror = () => {
      setCurrentlyPlayingMsgId(null);
    };

    setCurrentlyPlayingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeAgent || isEvaluating || isAgentTyping) return;

    const userMsgText = inputMessage.trim();
    setInputMessage("");

    const isFirst = activeConv.messages.length === 0;

    const newUserMsg: DirectMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      content: userMsgText,
      createdAt: new Date().toISOString(),
      isFirstMessage: isFirst,
    };

    // Optimistically update conversation
    setConversations((prev) => {
      const current = prev[selectedAgentId] || {
        agentId: selectedAgentId,
        messages: [],
        status: "none",
      };
      return {
        ...prev,
        [selectedAgentId]: {
          ...current,
          messages: [...current.messages, newUserMsg],
          status: isFirst ? "pending" : current.status,
        },
      };
    });

    if (isFirst) {
      // Gatekeeper Evaluation
      setIsEvaluating(true);
      try {
        const response = await fetch("/api/agent/gatekeeper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: activeAgent,
            userMessage: userMsgText,
            userDisplayName,
            userHandle,
            systemHour,
          }),
        });

        const data = await response.json();
        const decision = data.karar || "RED";

        // Log Developer Console
        onAddLog({
          type: "gatekeeper_evaluation",
          agentName: `${activeAgent.name} (Kapı Bekçisi)`,
          promptUsed: data.promptUsed,
          responseReceived: data.responseReceived,
          latencyMs: data.latencyMs,
          model: data.modelUsed,
        });

        // Trigger Agent response based on Gatekeeper decision
        setIsAgentTyping(true);

        // Define a custom evaluation response instructions depending on the decision
        let gatekeeperPromptInstruction = "";
        if (decision === "ONAY") {
          gatekeeperPromptInstruction = `Kullanıcı kapı bekçisinden ONAY aldı. Çok samimi, cana yakın ve karakterine tam uyan, tanışmaktan mutlu bir karşılama cevabı yaz.`;
        } else {
          gatekeeperPromptInstruction = `Kullanıcı kapı bekçisi tarafından REDDEDİLDİ. Karakterine tamamen uygun şekilde, haddini bildiren, çok kaba/tersleyici olmayan ama soğuk, alaycı, sert bir şekilde mesafeni koy ve sohbeti kilitlediğini belirt.`;
        }

        const replyResponse = await fetch("/api/agent/generate-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: {
              ...activeAgent,
              profile: `${activeAgent.profile}\n\n[KRİTİK DURUM]: ${gatekeeperPromptInstruction}`,
            },
            parentContent: userMsgText,
            parentAuthorName: userDisplayName,
            parentAuthorHandle: userHandle,
            isUser: true,
            systemHour,
          }),
        });

        const replyData = await replyResponse.json();
        const agentReplyText = replyData.content || "Girmeyelim bu muhabbetlere yeğenim.";

        // Update with result
        setConversations((prev) => {
          const current = prev[selectedAgentId];
          return {
            ...prev,
            [selectedAgentId]: {
              ...current,
              messages: [
                ...current.messages.map((m) =>
                  m.id === newUserMsg.id
                    ? { ...m, evaluationDecision: decision }
                    : m
                ),
                {
                  id: `msg_agent_${Date.now()}`,
                  sender: "agent",
                  content: agentReplyText,
                  createdAt: new Date().toISOString(),
                },
              ],
              status: decision === "ONAY" ? "approved" : "rejected",
            },
          };
        });

        onAddLog({
          type: "reply_generation",
          agentName: activeAgent.name,
          promptUsed: replyData.promptUsed,
          responseReceived: agentReplyText,
          latencyMs: replyData.latencyMs,
          model: replyData.modelUsed,
        });

      } catch (err) {
        console.error("Gatekeeper error:", err);
        setConversations((prev) => {
          const current = prev[selectedAgentId];
          return {
            ...prev,
            [selectedAgentId]: {
              ...current,
              status: "none",
              messages: current.messages.filter((m) => m.id !== newUserMsg.id),
            },
          };
        });
      } finally {
        setIsEvaluating(false);
        setIsAgentTyping(false);
      }
    } else {
      // Normal Conversation Flow (already approved)
      setIsAgentTyping(true);
      try {
        const replyResponse = await fetch("/api/agent/generate-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: activeAgent,
            parentContent: userMsgText,
            parentAuthorName: userDisplayName,
            parentAuthorHandle: userHandle,
            isUser: true,
            systemHour,
          }),
        });

        const replyData = await replyResponse.json();
        const agentReplyText = replyData.content || "Eyvallah.";

        setConversations((prev) => {
          const current = prev[selectedAgentId];
          return {
            ...prev,
            [selectedAgentId]: {
              ...current,
              messages: [
                ...current.messages,
                {
                  id: `msg_agent_${Date.now()}`,
                  sender: "agent",
                  content: agentReplyText,
                  createdAt: new Date().toISOString(),
                },
              ],
            },
          };
        });

        onAddLog({
          type: "reply_generation",
          agentName: activeAgent.name,
          promptUsed: replyData.promptUsed,
          responseReceived: agentReplyText,
          latencyMs: replyData.latencyMs,
        });
      } catch (err) {
        console.error("Reply error:", err);
      } finally {
        setIsAgentTyping(false);
      }
    }
  };

  const handleResetConversation = () => {
    if (!activeAgent) return;
    if (confirm(`${activeAgent.name} ile olan sohbet geçmişini temizlemek ve kapıyı sıfırlamak istiyor musunuz?`)) {
      setConversations((prev) => ({
        ...prev,
        [selectedAgentId]: {
          agentId: selectedAgentId,
          messages: [],
          status: "none",
        },
      }));
    }
  };

  const getAccentColor = (color: string) => {
    switch (color) {
      case "rose": return "bg-red-500 text-white";
      case "amber": return "bg-amber-500 text-white";
      case "pink": return "bg-pink-500 text-white";
      case "emerald": return "bg-emerald-500 text-white";
      case "sky": return "bg-sky-500 text-white";
      case "violet": return "bg-indigo-600 text-white";
      default: return "bg-slate-700 text-white";
    }
  };

  const getAccentBg = (color: string) => {
    switch (color) {
      case "rose": return "bg-red-50/50 border-red-100";
      case "amber": return "bg-amber-50/50 border-amber-100";
      case "pink": return "bg-pink-50/50 border-pink-100";
      case "emerald": return "bg-emerald-50/50 border-emerald-100";
      case "sky": return "bg-sky-50/50 border-sky-100";
      case "violet": return "bg-indigo-50/50 border-indigo-100";
      default: return "bg-slate-50/50 border-slate-100";
    }
  };

  const getAccentText = (color: string) => {
    switch (color) {
      case "rose": return "text-red-600";
      case "amber": return "text-amber-800";
      case "pink": return "text-pink-600";
      case "emerald": return "text-emerald-700";
      case "sky": return "text-sky-600";
      case "violet": return "text-indigo-600";
      default: return "text-slate-700";
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden h-[calc(100vh-80px)] md:h-full w-full">
      {/* Left Column: Agents List */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-sans text-sm font-black text-slate-900 uppercase tracking-tight">
            Ajan DM Kutuları
          </h3>
          <p className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase mt-1">
            Kapı Bekçisi Aktif Listesi
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {agents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            const conv = conversations[agent.id] || { messages: [], status: "none" };
            const lastMsg = conv.messages[conv.messages.length - 1];

            return (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgentId(agent.id);
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  setCurrentlyPlayingMsgId(null);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left group ${
                  isSelected
                    ? "bg-slate-50 border-slate-300/80 shadow-xs"
                    : "border-transparent hover:bg-slate-50/60"
                }`}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 border-2 border-white flex items-center justify-center text-xl shadow-xs select-none">
                    {agent.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {agent.name}
                    </span>
                    {conv.status === "approved" && (
                      <span className="text-[9px] bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.2 rounded-md font-extrabold flex items-center gap-0.5">
                        <Unlock className="w-2.5 h-2.5" />
                        AÇIK
                      </span>
                    )}
                    {conv.status === "rejected" && (
                      <span className="text-[9px] bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.2 rounded-md font-extrabold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        KİLİT
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono font-bold text-slate-400 truncate mt-0.5">
                    {agent.handle}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {lastMsg
                      ? lastMsg.sender === "user"
                        ? `Siz: ${lastMsg.content}`
                        : lastMsg.content
                      : `Sohbet başlatılmadı.`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Chat Workspace */}
      <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden relative">
        {activeAgent ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile back or logo toggle */}
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg select-none">
                  {activeAgent.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900">
                      {activeAgent.name}
                    </h4>
                    <span className="text-[9px] font-mono text-red-600 font-extrabold">
                      {activeAgent.handle}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium truncate max-w-[250px] md:max-w-md">
                    {activeAgent.profile}
                  </p>
                </div>
              </div>

              {activeConv.messages.length > 0 && (
                <button
                  onClick={handleResetConversation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-red-600 hover:border-red-200 transition-all text-[11px] font-bold shadow-xs"
                  title="Sohbeti ve Kapı Bekçisini Sıfırla"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bağlantıyı Sıfırla</span>
                </button>
              )}
            </div>

            {/* Chat Messages scroll area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {/* Gatekeeper informational welcome banner for first time */}
              {activeConv.messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-xl mx-auto bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-center mt-6"
                >
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600">
                    <ShieldCheck className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-sans text-xs font-black text-slate-900 uppercase tracking-tight">
                      XASİL KAPI BEKÇİSİ PROTOKOLÜ v3.5
                    </h5>
                    <p className="text-[11px] text-indigo-600 font-mono font-black uppercase">
                      Hattın Güvenliği Kapı Bekçisine Emanet
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Xasil platformu, her ajanın kapısını koruyan bir <strong>Kapı Bekçisi (Gatekeeper)</strong> protokolüne sahiptir. Göndereceğiniz <strong>İLK mesaj</strong>, ajanın kırmızı çizgilerine, üslubuna ve tahammül seviyesine göre yapay zeka tarafından değerlendirilecektir. Mesajınız kaba, laubali veya ajanın karakter yapısına uygunsuz bulunursa kapı kilitlenir ve sert bir ret cevabı alırsınız.
                  </p>
                  <div className={`p-3 rounded-2xl border ${getAccentBg(activeAgent.accentColor)} text-left text-xs space-y-1`}>
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{activeAgent.name} Kapı Tüyosu:</span>
                    </div>
                    <p className="text-slate-600 font-medium italic">
                      "{activeAgent.profile}"
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Message List */}
              {activeConv.messages.map((msg, idx) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-[85%] ${
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shadow-xs select-none shrink-0">
                      {isUser ? "👤" : activeAgent.avatar}
                    </div>

                    {/* Message Card */}
                    <div className="space-y-1">
                      <div
                        className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed border shadow-xs ${
                          isUser
                            ? "bg-slate-800 text-white border-slate-900 rounded-tr-none"
                            : "bg-white text-slate-800 border-slate-200 rounded-tl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* Speech controller */}
                        <div className="flex items-center justify-end mt-2 pt-1.5 border-t border-slate-100/10">
                          <button
                            onClick={() => handleSpeech(msg.content, isUser ? null : activeAgent.id, msg.id)}
                            className={`flex items-center gap-1 text-[10px] font-bold ${
                              isUser
                                ? "text-indigo-200 hover:text-white"
                                : "text-slate-400 hover:text-slate-800"
                            }`}
                          >
                            {currentlyPlayingMsgId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 animate-pulse text-red-500" />
                                <span>Durdur</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Sesli Oku</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Display Gatekeeper status for the FIRST message */}
                      {msg.isFirstMessage && isUser && (
                        <div className="flex items-center gap-1.5 mt-1 px-1">
                          {msg.evaluationDecision === "ONAY" && (
                            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                              Kapı Bekçisi: ONAYLANDI 🔓
                            </span>
                          )}
                          {msg.evaluationDecision === "RED" && (
                            <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                              Kapı Bekçisi: REDDEDİLDİ 🔒
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Evaluative loading placeholder */}
              {isEvaluating && (
                <div className="flex items-start gap-3 max-w-[80%] mr-auto">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shadow-xs select-none">
                    🛡️
                  </div>
                  <div className="p-4 bg-indigo-50 border-2 border-indigo-200/80 rounded-2xl rounded-tl-none space-y-2 max-w-sm shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-700">
                      <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                      <span className="text-xs font-black uppercase tracking-wider">KAPI BEKÇİSİ DEVREDE</span>
                    </div>
                    <p className="text-[11px] text-indigo-900 leading-normal font-medium">
                      Mesajınız analiz ediliyor; ajanın kurallarına, üslup ve kırmızı çizgilerine uygunluğu değerlendiriliyor. Lütfen bekleyin...
                    </p>
                  </div>
                </div>
              )}

              {/* Standard typing placeholder */}
              {isAgentTyping && (
                <div className="flex items-start gap-3 max-w-[80%] mr-auto animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shadow-xs select-none">
                    {activeAgent.avatar}
                  </div>
                  <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-500 font-bold">
                    {activeAgent.name} yazıyor...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Locked Warning Banner (if Gatekeeper rejected) */}
            {activeConv.status === "rejected" && (
              <div className="mx-6 mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shadow-sm animate-in zoom-in duration-200">
                <div className="p-2.5 rounded-xl bg-red-100 border border-red-300 text-red-600 shrink-0">
                  <Lock className="w-6 h-6 animate-bounce" />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h6 className="text-xs font-black text-slate-900 uppercase">
                    KAPI KİLİTLENDİ - SOHBET HATTI BLOKE EDİLDİ
                  </h6>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Kapı Bekçisi gönderdiğiniz ilk mesajı ajanın üslubuna tamamen aykırı buldu! Karakter sınırlarını aştınız. Yeniden denemek için bağlantıyı sıfırlayın.
                  </p>
                </div>
                <button
                  onClick={handleResetConversation}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_rgba(153,27,27,1)] active:translate-y-0.5 active:shadow-none transition-all shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Bağlantıyı Sıfırla
                </button>
              </div>
            )}

            {/* Message Input Bar */}
            {activeConv.status !== "rejected" && (
              <form
                onSubmit={handleSendMessage}
                className="h-20 bg-white border-t border-slate-200 px-4 md:px-6 flex items-center gap-3 shrink-0"
              >
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      activeConv.messages.length === 0
                        ? `Kapı Bekçisini geçecek ilk mesajı buraya yazın...`
                        : `${activeAgent.name} ile sohbete devam edin...`
                    }
                    disabled={isEvaluating || isAgentTyping}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-0 rounded-2xl py-3.5 pl-4 pr-12 text-xs font-medium placeholder-slate-400/90 focus:bg-white transition-all outline-none"
                  />
                  <div className="absolute right-3.5 flex items-center gap-1.5 text-slate-400">
                    {activeConv.messages.length === 0 ? (
                      <Lock className="w-4 h-4 text-indigo-500" title="İlk mesaj Gatekeeper denetimindedir" />
                    ) : (
                      <Unlock className="w-4 h-4 text-green-500" title="Gatekeeper onaylı güvenli hat" />
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isEvaluating || isAgentTyping}
                  className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-[3px_3px_0px_0px_rgba(30,27,75,1)] active:translate-y-0.5 active:shadow-none shrink-0"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <MessageCircle className="w-12 h-12 mb-3 opacity-30 text-slate-500" />
            <p className="font-mono text-xs font-bold">Bir Ajan Seçin</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Sol taraftaki listeden direkt mesaj göndermek istediğiniz ajana tıklayın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
